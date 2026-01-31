"""模型信息 API 路由"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException

from gateway.schemas.response import ModelInfo, ModelsResponse, BackendStatus
from gateway.adapters import AdapterFactory

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """
    获取模型列表

    返回所有已注册后端的模型信息和状态
    """
    models = []
    adapters = AdapterFactory.get_all()

    for backend_id, adapter in adapters.items():
        try:
            status = await adapter.get_status()
            models.append(ModelInfo(
                id=backend_id,
                name=adapter.backend_name,
                backend=backend_id,
                status="online" if status.online and status.model_loaded else "offline",
                features=adapter.features,
            ))
        except Exception as e:
            logger.warning(f"Failed to get status for {backend_id}: {e}")
            models.append(ModelInfo(
                id=backend_id,
                name=adapter.backend_name,
                backend=backend_id,
                status="error",
                features=adapter.features,
            ))

    return ModelsResponse(models=models)


@router.get("/models/{model_id}")
async def get_model(model_id: str):
    """
    获取指定模型信息

    参数：
    - model_id: 模型 ID
    """
    adapter = AdapterFactory.get(model_id)
    if not adapter:
        raise HTTPException(status_code=404, detail=f"模型不存在: {model_id}")

    try:
        status = await adapter.get_status()
        return {
            "id": model_id,
            "name": adapter.backend_name,
            "backend": model_id,
            "status": "online" if status.online and status.model_loaded else "offline",
            "features": adapter.features,
            "details": {
                "model_loaded": status.model_loaded,
                "model_name": status.model_name,
                "device": status.device,
                "error": status.error,
            }
        }
    except Exception as e:
        logger.error(f"Failed to get model info for {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/{model_id}/status")
async def get_model_status(model_id: str):
    """
    获取指定模型状态

    参数：
    - model_id: 模型 ID
    """
    adapter = AdapterFactory.get(model_id)
    if not adapter:
        raise HTTPException(status_code=404, detail=f"模型不存在: {model_id}")

    try:
        status = await adapter.get_status()
        return BackendStatus(
            id=model_id,
            name=adapter.backend_name,
            url=adapter.base_url,
            status="online" if status.online else "offline",
            model_loaded=status.model_loaded,
            features=adapter.features,
            error=status.error,
        )
    except Exception as e:
        logger.error(f"Failed to get status for {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
