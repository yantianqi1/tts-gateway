"""音色管理 API 路由"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from gateway.schemas.response import VoicesResponse, VoiceUploadResponse
from gateway.services.voice_service import voice_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/voices", response_model=VoicesResponse)
async def list_voices(backend: Optional[str] = None):
    """
    获取音色列表

    参数：
    - backend: 可选，指定后端 ("qwen3-tts", "indextts-2.0")

    返回：
    - voices: 音色列表
    - total: 总数
    """
    if backend:
        return await voice_service.list_voices_by_backend(backend)
    return await voice_service.list_all_voices()


@router.post("/voices/upload", response_model=VoiceUploadResponse)
async def upload_voice(
    file: UploadFile = File(..., description="音色文件 (.wav)"),
    voice_id: str = Form(default="default", description="音色 ID"),
    backend: str = Form(default="indextts-2.0", description="目标后端"),
    emotion: str = Form(default="default", description="情感标签 (IndexTTS)"),
    ref_text: Optional[str] = Form(default=None, description="参考文本 (Qwen3-TTS)"),
):
    """
    上传音色

    参数：
    - file: 音频文件 (.wav)
    - voice_id: 音色 ID
    - backend: 目标后端 ("qwen3-tts", "indextts-2.0")
    - emotion: 情感标签（IndexTTS 专用）
    - ref_text: 参考文本（Qwen3-TTS 专用）
    """
    # 验证文件格式
    if not file.filename or not file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="仅支持 .wav 格式")

    # 读取文件内容
    content = await file.read()

    # 检查文件大小（10MB 限制）
    max_size = 10 * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="文件过大，最大支持 10MB")

    # 上传音色
    result = await voice_service.upload_voice(
        file_content=content,
        filename=file.filename,
        voice_id=voice_id,
        backend=backend,
        emotion=emotion,
        ref_text=ref_text,
    )

    return VoiceUploadResponse(
        success=result.get("success", False),
        message=result.get("message", ""),
        voice_id=result.get("voice_id"),
        emotion=result.get("emotion"),
        backend=result.get("backend"),
    )
