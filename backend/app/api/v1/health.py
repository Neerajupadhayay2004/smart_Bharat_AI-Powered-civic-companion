from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"


@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check endpoint"""
    return HealthResponse(status="healthy")


@router.get("/ready", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def readiness_check():
    """Readiness check (database, external services)"""
    # TODO: Add database and external service checks
    return HealthResponse(status="ready")


@router.get("/live", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def liveness_check():
    """Liveness check"""
    return HealthResponse(status="alive")
