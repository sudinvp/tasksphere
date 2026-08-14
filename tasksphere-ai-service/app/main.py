from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.ml_service import ml_service
from app.schemas import (
    ClassifyRequest,
    ClassifyResponse,
    RecommendationRequest,
    RecommendationResponse,
    TaskAnalysisRequest,
    TaskAnalysisResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load both trained models once at startup rather than per-request.
    ml_service.load()
    yield


app = FastAPI(
    title="TaskSphere AI Service",
    description="AI/ML microservice for task classification, priority prediction, "
                "and lightweight recommendations. Called by the Spring Boot core service.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Only the Spring Boot backend calls this service, server-to-server —
    # the React frontend never talks to it directly. Restrict allow_origins
    # to the backend's real origin in production.
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": ml_service.is_loaded}


@app.get("/")
def root():
    return {"service": "TaskSphere AI Service", "docs": "/docs", "health": "/health"}


@app.post("/api/ai/analyze-task", response_model=TaskAnalysisResponse)
def analyze_task(request: TaskAnalysisRequest):
    """
    Primary endpoint called by the Spring Boot backend (AiClientService) whenever
    a task is created or updated. Combines category classification and priority
    prediction into a single response.
    """
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")

    category, category_conf, _ = ml_service.classify_category(request.title, request.description)
    priority_label, priority_conf, priority_score = ml_service.predict_priority(
        request.title, request.description, request.due_date
    )

    return TaskAnalysisResponse(
        suggested_category=category,
        category_confidence=category_conf,
        priority_score=priority_score,
        suggested_priority=priority_label,
        priority_confidence=priority_conf,
    )


@app.post("/api/ai/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest):
    """Category classification only — useful for a live-typing suggestion in the UI."""
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")

    category, confidence, top_categories = ml_service.classify_category(request.title, request.description)
    return ClassifyResponse(category=category, confidence=confidence, top_categories=top_categories)


@app.post("/api/ai/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):
    """Category + priority prediction plus a few rule-based next-step suggestions."""
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded")

    category, _, _ = ml_service.classify_category(request.title, request.description)
    priority_label, _, _ = ml_service.predict_priority(request.title, request.description, request.due_date)
    days_until_due = ml_service.days_until_due(request.due_date)
    tips = ml_service.recommendations_for(category, priority_label, days_until_due)

    return RecommendationResponse(
        suggested_category=category,
        suggested_priority=priority_label,
        recommendations=tips,
    )
