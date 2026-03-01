"""
Health check endpoint — used by deployment platforms to verify the service is up.
"""
from fastapi import APIRouter
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns 200 OK when the API is running.",
)
def health_check():
    return HealthResponse(
        status="ok",
        service="JobLens NLP API",
        version="1.0.0",
    )
