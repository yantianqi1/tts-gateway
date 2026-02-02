"""音色管理 API 路由"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from gateway.schemas.response import (
    VerifyKeyRequest,
    VerifyKeyResponse,
    VoicesResponse,
    VoiceUploadResponse,
)
from gateway.services.voice_service import voice_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/voices", response_model=VoicesResponse)
async def list_voices(
    backend: Optional[str] = None,
    visibility: Optional[str] = None,
    x_private_key: Optional[str] = Header(default=None, alias="X-Private-Key"),
):
    """
    获取音色列表

    参数：
    - backend: 可选，指定后端 ("qwen3-tts", "indextts-2.0")
    - visibility: 可选，过滤可见性 ("public", "private", "all")
    - X-Private-Key: Header，私人密钥（用于获取私人音色）

    返回：
    - voices: 音色列表
    - total: 总数
    """
    if backend:
        return await voice_service.list_voices_by_backend(
            backend,
            private_key=x_private_key,
            visibility_filter=visibility,
        )
    return await voice_service.list_all_voices(
        private_key=x_private_key,
        visibility_filter=visibility,
    )


@router.post("/voices/upload", response_model=VoiceUploadResponse)
async def upload_voice(
    file: UploadFile = File(..., description="音色文件 (.wav)"),
    voice_id: str = Form(default="default", description="音色 ID"),
    backend: str = Form(default="indextts-2.0", description="目标后端"),
    emotion: str = Form(default="default", description="情感标签 (IndexTTS)"),
    ref_text: Optional[str] = Form(default=None, description="参考文本 (Qwen3-TTS)"),
    visibility: str = Form(default="public", description="可见性：public 或 private"),
    private_key: Optional[str] = Form(default=None, description="私人密钥（visibility=private 时必填）"),
):
    """
    上传音色

    参数：
    - file: 音频文件 (.wav)
    - voice_id: 音色 ID
    - backend: 目标后端 ("qwen3-tts", "indextts-2.0")
    - emotion: 情感标签（IndexTTS 专用）
    - ref_text: 参考文本（Qwen3-TTS 专用）
    - visibility: 可见性（"public" 或 "private"）
    - private_key: 私人密钥（visibility="private" 时必填）
    """
    # 验证可见性参数
    if visibility not in ("public", "private"):
        raise HTTPException(status_code=400, detail="visibility 必须是 'public' 或 'private'")

    # 私人音色必须提供密钥
    if visibility == "private":
        if not private_key or len(private_key.strip()) < 4:
            raise HTTPException(status_code=400, detail="私人音色必须提供至少 4 位密钥")

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
        visibility=visibility,
        private_key=private_key.strip() if private_key else None,
    )

    return VoiceUploadResponse(
        success=result.get("success", False),
        message=result.get("message", ""),
        voice_id=result.get("voice_id"),
        emotion=result.get("emotion"),
        backend=result.get("backend"),
        visibility=result.get("visibility"),
    )


@router.post("/voices/verify-key", response_model=VerifyKeyResponse)
async def verify_private_key(request: VerifyKeyRequest):
    """
    验证私人密钥

    参数：
    - private_key: 私人密钥

    返回：
    - valid: 密钥是否有效（是否关联了任何音色）
    - voice_count: 可访问的音色数量
    - voice_ids: 可访问的音色 ID 列表
    """
    if not request.private_key or len(request.private_key.strip()) < 4:
        return VerifyKeyResponse(valid=False, voice_count=0, voice_ids=[])

    result = await voice_service.verify_key(request.private_key.strip())

    return VerifyKeyResponse(
        valid=result.get("valid", False),
        voice_count=result.get("voice_count", 0),
        voice_ids=result.get("voice_ids", []),
    )
