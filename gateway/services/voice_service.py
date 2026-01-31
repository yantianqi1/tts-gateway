"""音色管理服务"""

import logging
from typing import List, Optional

from gateway.adapters import AdapterFactory
from gateway.schemas.response import VoiceInfo, VoicesResponse

logger = logging.getLogger(__name__)


class VoiceService:
    """音色管理服务"""

    async def list_all_voices(self) -> VoicesResponse:
        """
        获取所有后端的音色列表

        Returns:
            聚合的音色列表响应
        """
        all_voices: List[VoiceInfo] = []

        adapters = AdapterFactory.get_all()

        for backend_id, adapter in adapters.items():
            try:
                voices = await adapter.list_voices()
                for voice in voices:
                    all_voices.append(VoiceInfo(
                        id=voice.id,
                        name=voice.name,
                        backend=backend_id,
                        emotions=voice.emotions,
                        ref_text=voice.ref_text,
                        has_default=voice.has_default,
                    ))
                logger.debug(f"Listed {len(voices)} voices from {backend_id}")
            except Exception as e:
                logger.warning(f"Failed to list voices from {backend_id}: {e}")

        return VoicesResponse(
            voices=all_voices,
            total=len(all_voices),
        )

    async def list_voices_by_backend(
        self,
        backend_id: str
    ) -> VoicesResponse:
        """
        获取指定后端的音色列表

        Args:
            backend_id: 后端标识符

        Returns:
            该后端的音色列表响应
        """
        adapter = AdapterFactory.get(backend_id)
        if not adapter:
            logger.warning(f"Backend not found: {backend_id}")
            return VoicesResponse(voices=[], total=0)

        try:
            voices = await adapter.list_voices()
            voice_infos = [
                VoiceInfo(
                    id=voice.id,
                    name=voice.name,
                    backend=backend_id,
                    emotions=voice.emotions,
                    ref_text=voice.ref_text,
                    has_default=voice.has_default,
                )
                for voice in voices
            ]

            return VoicesResponse(
                voices=voice_infos,
                total=len(voice_infos),
            )

        except Exception as e:
            logger.error(f"Failed to list voices from {backend_id}: {e}")
            return VoicesResponse(voices=[], total=0)

    async def upload_voice(
        self,
        file_content: bytes,
        filename: str,
        voice_id: str,
        backend: str,
        **kwargs
    ) -> dict:
        """
        上传音色到指定后端

        Args:
            file_content: 文件内容
            filename: 文件名
            voice_id: 音色 ID
            backend: 目标后端
            **kwargs: 其他参数（ref_text, emotion）

        Returns:
            上传结果
        """
        adapter = AdapterFactory.get(backend)
        if not adapter:
            return {
                "success": False,
                "message": f"后端不存在: {backend}",
            }

        try:
            result = await adapter.upload_voice(
                file_content=file_content,
                filename=filename,
                voice_id=voice_id,
                **kwargs
            )
            result["backend"] = backend
            return result

        except Exception as e:
            logger.error(f"Failed to upload voice to {backend}: {e}")
            return {
                "success": False,
                "message": str(e),
                "backend": backend,
            }


# 全局服务实例
voice_service = VoiceService()
