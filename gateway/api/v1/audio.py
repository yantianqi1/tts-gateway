"""音频生成 API 路由"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from gateway.schemas.request import TTSRequest
from gateway.schemas.response import TTSResponse
from gateway.services.tts_service import tts_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/audio/speech")
async def create_speech(request: TTSRequest):
    """
    语音合成接口 (OpenAI 兼容)

    生成语音并返回音频流

    参数：
    - model: 模型选择 ("qwen3-tts", "indextts-2.0", "auto")
    - input: 待合成的文本
    - voice: 音色 ID
    - response_format: 输出格式 (wav/mp3)
    - speed: 语速 (0.5-2.0)

    Qwen3-TTS 专用参数：
    - language: 语言
    - ref_audio_id: 参考音频 ID

    IndexTTS 专用参数：
    - emotion: 情感标签
    - temperature, top_p, top_k: 采样参数
    - emotion_mode: 情感控制模式
    - emo_vector: 8维情感向量
    """
    try:
        audio_data, metadata = await tts_service.generate_speech(request)

        # 确定 MIME 类型
        if request.response_format == "mp3":
            media_type = "audio/mpeg"
        else:
            media_type = "audio/wav"

        # 返回音频流
        return StreamingResponse(
            iter([audio_data]),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=speech.{request.response_format}",
                "X-Model-Used": metadata.get("model_used", "unknown"),
            }
        )

    except Exception as e:
        logger.error(f"Speech generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audio/speech/json", response_model=TTSResponse)
async def create_speech_json(request: TTSRequest):
    """
    语音合成接口 (JSON 响应)

    生成语音并返回 JSON 元数据（音频需要单独下载）

    注意：此接口暂不支持，请使用 POST /audio/speech
    """
    raise HTTPException(
        status_code=501,
        detail="JSON response mode not implemented. Use POST /v1/audio/speech for streaming response."
    )
