from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class TaskAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Task title")
    description: Optional[str] = Field(default="", description="Task description")
    due_date: Optional[date] = Field(default=None, description="ISO date the task is due")


class TaskAnalysisResponse(BaseModel):
    # snake_case keys to match what AiClientService.java reads via Map.get(...)
    suggested_category: str
    category_confidence: float
    priority_score: float
    suggested_priority: str
    priority_confidence: float


class ClassifyRequest(BaseModel):
    title: str
    description: Optional[str] = ""


class ClassifyResponse(BaseModel):
    category: str
    confidence: float
    top_categories: list[dict]


class RecommendationRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[date] = None


class RecommendationResponse(BaseModel):
    suggested_category: str
    suggested_priority: str
    recommendations: list[str]
