"""
Trains two models from ml/data/tasks_training_data.csv:

1. category_model: TF-IDF (title + description) -> LinearSVC
   Predicts one of the 10 task categories.

2. priority_model: TF-IDF (title + description) + days_until_due (scaled)
   -> LogisticRegression (multi-class, with predict_proba)
   Predicts LOW / MEDIUM / HIGH / URGENT and gives a continuous
   priority_score (0-1) derived from the class probabilities.

Both are saved as joblib pickles into ml/models/ and loaded at FastAPI
startup by app/ml_service.py.
"""

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC

DATA_PATH = "ml/data/tasks_training_data.csv"
CATEGORY_MODEL_PATH = "ml/models/category_model.joblib"
PRIORITY_MODEL_PATH = "ml/models/priority_model.joblib"

PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"]
PRIORITY_TO_SCORE = {"LOW": 0.15, "MEDIUM": 0.45, "HIGH": 0.72, "URGENT": 0.93}


def load_data():
    df = pd.read_csv(DATA_PATH)
    df["text"] = df["title"].fillna("") + " " + df["description"].fillna("")
    return df


def train_category_model(df):
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["category"], test_size=0.2, random_state=42, stratify=df["category"]
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=2)),
        ("clf", CalibratedClassifierCV(LinearSVC(C=1.0, random_state=42), cv=3)),
    ])

    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print("\n=== Category Classifier Report ===")
    print(classification_report(y_test, preds))

    joblib.dump(pipeline, CATEGORY_MODEL_PATH)
    print(f"Saved category model to {CATEGORY_MODEL_PATH}")
    return pipeline


def train_priority_model(df):
    text_train, text_test, num_train, num_test, y_train, y_test = train_test_split(
        df["text"], df[["days_until_due"]], df["priority"],
        test_size=0.2, random_state=42, stratify=df["priority"]
    )

    # Combine TF-IDF text features with the scaled numeric "days_until_due" feature.
    preprocessor = ColumnTransformer(
        transformers=[
            ("tfidf", TfidfVectorizer(max_features=3000, ngram_range=(1, 2), min_df=2), "text"),
            ("num", StandardScaler(), ["days_until_due"]),
        ]
    )

    train_df = pd.DataFrame({"text": text_train, "days_until_due": num_train["days_until_due"]})
    test_df = pd.DataFrame({"text": text_test, "days_until_due": num_test["days_until_due"]})

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("clf", LogisticRegression(max_iter=1000, random_state=42)),
    ])

    pipeline.fit(train_df, y_train)

    preds = pipeline.predict(test_df)
    print("\n=== Priority Classifier Report ===")
    print(classification_report(y_test, preds))

    joblib.dump(pipeline, PRIORITY_MODEL_PATH)
    print(f"Saved priority model to {PRIORITY_MODEL_PATH}")
    return pipeline


def main():
    df = load_data()
    print(f"Loaded {len(df)} rows")
    train_category_model(df)
    train_priority_model(df)
    print("\nTraining complete.")


if __name__ == "__main__":
    main()
