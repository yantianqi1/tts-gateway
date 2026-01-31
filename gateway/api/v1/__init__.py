"""API v1 路由"""

from fastapi import APIRouter

from .audio import router as audio_router
from .voices import router as voices_router
from .models import router as models_router

router = APIRouter()
router.include_router(audio_router, tags=["audio"])
router.include_router(voices_router, tags=["voices"])
router.include_router(models_router, tags=["models"])
