"""
Loads the trained scikit-learn pipelines once at startup and exposes
inference helpers used by the API routes.
"""

from datetime import date
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CATEGORY_MODEL_PATH = BASE_DIR / "ml" / "models" / "category_model.joblib"
PRIORITY_MODEL_PATH = BASE_DIR / "ml" / "models" / "priority_model.joblib"

PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"]
# Maps predicted class -> a representative point on a 0-1 urgency scale,
# used to compute a continuous priority_score alongside the discrete label.
PRIORITY_TO_SCORE = {"LOW": 0.15, "MEDIUM": 0.45, "HIGH": 0.72, "URGENT": 0.93}


class MLService:
    def __init__(self):
        self.category_model = None
        self.priority_model = None
        self._loaded = False

    def load(self):
        if not CATEGORY_MODEL_PATH.exists() or not PRIORITY_MODEL_PATH.exists():
            raise FileNotFoundError(
                "Model files not found. Run `python ml/generate_dataset.py` then "
                "`python ml/train_model.py` from the project root before starting the API."
            )
        self.category_model = joblib.load(CATEGORY_MODEL_PATH)
        self.priority_model = joblib.load(PRIORITY_MODEL_PATH)
        self._loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @staticmethod
    def days_until_due(due_date: Optional[date]) -> float:
        if due_date is None:
            # No due date given: treat as a mid-range default rather than
            # biasing hard toward urgent or not-urgent.
            return 14.0
        return float((due_date - date.today()).days)

    def classify_category(self, title: str, description: str = "") -> tuple[str, float, list[dict]]:
        text = f"{title} {description or ''}"
        proba = self.category_model.predict_proba([text])[0]
        classes = self.category_model.classes_
        ranked = sorted(zip(classes, proba), key=lambda x: x[1], reverse=True)
        top_category, top_conf = ranked[0]
        top_categories = [{"category": c, "confidence": round(float(p), 4)} for c, p in ranked[:3]]
        return top_category, round(float(top_conf), 4), top_categories

    def predict_priority(self, title: str, description: str, due_date: Optional[date]) -> tuple[str, float, float]:
        text = f"{title} {description or ''}"
        days = self.days_until_due(due_date)

        input_df = pd.DataFrame([{"text": text, "days_until_due": days}])
        proba = self.priority_model.predict_proba(input_df)[0]
        classes = self.priority_model.classes_

        class_proba = dict(zip(classes, proba))
        predicted_label = max(class_proba, key=class_proba.get)
        predicted_conf = round(float(class_proba[predicted_label]), 4)

        # Continuous priority_score = probability-weighted average over the
        # ordinal scale, reflecting model uncertainty rather than just
        # picking the single highest-probability class's fixed score.
        score = sum(class_proba.get(label, 0.0) * PRIORITY_TO_SCORE[label] for label in PRIORITY_ORDER)
        score = round(float(score), 4)

        return predicted_label, predicted_conf, score

    def recommendations_for(self, category: str, priority: str, days_until_due: float) -> list[str]:
        """Simple rule-based recommendations layered on top of the ML predictions."""
        tips = []

        if priority == "URGENT":
            tips.append("Flag this task and notify the assignee immediately; consider reassigning if no one is free today.")
        elif priority == "HIGH":
            tips.append("Schedule this within the current sprint; don't let it slip to next week.")

        if days_until_due is not None and days_until_due < 0:
            tips.append("This task is already overdue — confirm with the assignee whether the due date needs to move.")

        category_tips = {
            "Bug Fix": "Consider linking this to a regression test so it doesn't resurface.",
            "Security": "Loop in a security reviewer before closing this task.",
            "DevOps/Infrastructure": "Check for a maintenance window before deploying this change.",
            "Testing": "Pair this with the feature/bugfix task it covers so coverage lands together.",
            "Documentation": "Tag the relevant engineer as a reviewer so the docs stay accurate.",
        }
        if category in category_tips:
            tips.append(category_tips[category])

        if not tips:
            tips.append("No special handling needed — proceed with standard workflow.")

        return tips


ml_service = MLService()
