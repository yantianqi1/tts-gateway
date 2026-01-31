"""TTS 核心服务"""

import logging
from typing import Dict, Optional, Tuple

from gateway.adapters import AdapterFactory, TTSAdapter
from gateway.schemas.request import TTSRequest

logger = logging.getLogger(__name__)


class TTSService:
    """TTS 核心服务 - 处理语音合成请求"""

    async def generate_speech(
        self,
        request: TTSRequest
    ) -> Tuple[bytes, Dict]:
        """
        生成语音

        Args:
            request: TTS 请求

        Returns:
            (音频数据, 元数据字典)
        """
        # 1. 选择适配器
        adapter = await self._select_adapter(request)
        if not adapter:
            raise Exception("没有可用的 TTS 后端")

        # 2. 准备参数
        kwargs = self._prepare_kwargs(request, adapter.backend_id)

        # 3. 调用适配器生成语音
        logger.info(
            f"Generating speech with {adapter.backend_id}: "
            f"text={request.input[:50]}..., voice={request.voice}"
        )

        audio_data = await adapter.generate_speech(
            text=request.input,
            voice=request.voice,
            **kwargs
        )

        # 4. 返回结果
        metadata = {
            "model_used": adapter.backend_id,
            "voice": request.voice,
            "response_format": request.response_format,
        }

        return audio_data, metadata

    async def _select_adapter(self, request: TTSRequest) -> Optional[TTSAdapter]:
        """选择适配器"""
        model = request.model.lower()

        # 指定具体模型
        if model == "qwen3-tts":
            adapter = AdapterFactory.get("qwen3-tts")
            if adapter:
                return adapter
            raise Exception("Qwen3-TTS 后端未启用或不可用")

        if model in ("indextts-2.0", "indextts"):
            adapter = AdapterFactory.get("indextts-2.0")
            if adapter:
                return adapter
            raise Exception("IndexTTS 后端未启用或不可用")

        # 自动选择
        if model == "auto":
            return await AdapterFactory.auto_select(
                ref_audio_id=request.ref_audio_id,
                emotion_mode=request.emotion_mode,
                language=request.language,
            )

        # 尝试按名称查找
        adapter = AdapterFactory.get(model)
        if adapter:
            return adapter

        raise Exception(f"未知的模型: {model}")

    def _prepare_kwargs(self, request: TTSRequest, backend_id: str) -> Dict:
        """准备适配器参数"""
        kwargs = {
            "speed": request.speed,
            "response_format": request.response_format,
        }

        if backend_id == "qwen3-tts":
            # Qwen3-TTS 参数
            kwargs["language"] = request.language
            kwargs["ref_audio_id"] = request.ref_audio_id or request.voice

        elif backend_id == "indextts-2.0":
            # IndexTTS 参数
            kwargs["emotion"] = request.emotion
            kwargs["temperature"] = request.temperature
            kwargs["top_p"] = request.top_p
            kwargs["top_k"] = request.top_k
            kwargs["repetition_penalty"] = request.repetition_penalty

            # 情感控制
            kwargs["emotion_mode"] = request.emotion_mode
            kwargs["emo_audio_path"] = request.emo_audio_path
            kwargs["emo_alpha"] = request.emo_alpha
            kwargs["emo_vector"] = request.emo_vector
            kwargs["use_emo_text"] = request.use_emo_text
            kwargs["emo_text"] = request.emo_text

        return kwargs


# 全局服务实例
tts_service = TTSService()
