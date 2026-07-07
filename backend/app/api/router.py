from fastapi import APIRouter
from app.api.v1 import auth, health, schemes, complaints, ai, profiles

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(profiles.router, prefix="/profile", tags=["profile"])
api_router.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
