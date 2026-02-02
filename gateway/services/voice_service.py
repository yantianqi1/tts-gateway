"""音色管理服务"""

import logging
from typing import List, Optional

from gateway.adapters import AdapterFactory
from gateway.schemas.response import VoiceInfo, VoicesResponse
from gateway.services.metadata_service import metadata_service

logger = logging.getLogger(__name__)


class VoiceService:
    """音色管理服务"""

    async def _merge_voice_with_metadata(
        self,
        voice,
        backend_id: str,
        visibility_map: dict[str, str],
    ) -> VoiceInfo:
        """
        合并后端音色与元数据

        Args:
            voice: 后端返回的音色信息
            backend_id: 后端 ID
            visibility_map: 音色可见性映射

        Returns:
            VoiceInfo: 合并后的音色信息
        """
        visibility = visibility_map.get(voice.id, "public")

        return VoiceInfo(
            id=voice.id,
            name=voice.name,
            backend=backend_id,
            emotions=voice.emotions,
            ref_text=voice.ref_text,
            has_default=voice.has_default,
            visibility=visibility,
        )

    async def _filter_voices_by_visibility(
        self,
        voices: List[VoiceInfo],
        private_key: Optional[str],
        visibility_filter: Optional[str],
    ) -> List[VoiceInfo]:
        """
        根据可见性和密钥过滤音色

        Args:
            voices: 音色列表
            private_key: 私人密钥
            visibility_filter: 可见性过滤器

        Returns:
            过滤后的音色列表
        """
        # 获取私人密钥可访问的音色 ID
        accessible_private_ids: set[str] = set()
        if private_key:
            private_voices = await metadata_service.list_private_voices_by_key(private_key)
            accessible_private_ids = {v["id"] for v in private_voices}

        result = []
        for voice in voices:
            # 公共音色
            if voice.visibility == "public":
                if visibility_filter in (None, "all", "public"):
                    result.append(voice)
            # 私人音色
            elif voice.visibility == "private":
                if voice.id in accessible_private_ids:
                    if visibility_filter in (None, "all", "private"):
                        result.append(voice)

        return result

    async def list_all_voices(
        self,
        private_key: Optional[str] = None,
        visibility_filter: Optional[str] = None,
    ) -> VoicesResponse:
        """
        获取所有后端的音色列表

        Args:
            private_key: 私人密钥（用于获取私人音色）
            visibility_filter: 可见性过滤器

        Returns:
            聚合的音色列表响应
        """
        all_voices: List[VoiceInfo] = []

        # 获取所有音色的可见性映射
        visibility_map = await metadata_service.get_all_voice_ids_with_visibility()

        adapters = AdapterFactory.get_all()

        for backend_id, adapter in adapters.items():
            try:
                voices = await adapter.list_voices()
                for voice in voices:
                    voice_info = await self._merge_voice_with_metadata(
                        voice, backend_id, visibility_map
                    )
                    all_voices.append(voice_info)
                logger.debug(f"Listed {len(voices)} voices from {backend_id}")
            except Exception as e:
                logger.warning(f"Failed to list voices from {backend_id}: {e}")

        # 过滤音色
        filtered_voices = await self._filter_voices_by_visibility(
            all_voices, private_key, visibility_filter
        )

        return VoicesResponse(
            voices=filtered_voices,
            total=len(filtered_voices),
        )

    async def list_voices_by_backend(
        self,
        backend_id: str,
        private_key: Optional[str] = None,
        visibility_filter: Optional[str] = None,
    ) -> VoicesResponse:
        """
        获取指定后端的音色列表

        Args:
            backend_id: 后端标识符
            private_key: 私人密钥
            visibility_filter: 可见性过滤器

        Returns:
            该后端的音色列表响应
        """
        adapter = AdapterFactory.get(backend_id)
        if not adapter:
            logger.warning(f"Backend not found: {backend_id}")
            return VoicesResponse(voices=[], total=0)

        # 获取所有音色的可见性映射
        visibility_map = await metadata_service.get_all_voice_ids_with_visibility()

        try:
            voices = await adapter.list_voices()
            voice_infos = [
                await self._merge_voice_with_metadata(voice, backend_id, visibility_map)
                for voice in voices
            ]

            # 过滤音色
            filtered_voices = await self._filter_voices_by_visibility(
                voice_infos, private_key, visibility_filter
            )

            return VoicesResponse(
                voices=filtered_voices,
                total=len(filtered_voices),
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
        visibility: str = "public",
        private_key: Optional[str] = None,
        **kwargs
    ) -> dict:
        """
        上传音色到指定后端

        Args:
            file_content: 文件内容
            filename: 文件名
            voice_id: 音色 ID
            backend: 目标后端
            visibility: 可见性
            private_key: 私人密钥
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
            # 上传到 TTS 后端
            result = await adapter.upload_voice(
                file_content=file_content,
                filename=filename,
                voice_id=voice_id,
                **kwargs
            )

            if result.get("success"):
                # 保存元数据
                actual_voice_id = result.get("voice_id", voice_id)
                await metadata_service.save_voice_metadata(
                    voice_id=actual_voice_id,
                    backend=backend,
                    visibility=visibility,
                    private_key=private_key,
                    emotion=kwargs.get("emotion"),
                    ref_text=kwargs.get("ref_text"),
                )
                result["visibility"] = visibility

            result["backend"] = backend
            return result

        except Exception as e:
            logger.error(f"Failed to upload voice to {backend}: {e}")
            return {
                "success": False,
                "message": str(e),
                "backend": backend,
            }

    async def verify_key(self, private_key: str) -> dict:
        """
        验证私人密钥

        Args:
            private_key: 私人密钥

        Returns:
            验证结果
        """
        return await metadata_service.verify_key_and_list_voices(private_key)


# 全局服务实例
voice_service = VoiceService()
