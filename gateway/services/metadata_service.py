"""音色元数据管理服务"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from gateway.utils.crypto import hash_key, verify_key

logger = logging.getLogger(__name__)


class MetadataService:
    """音色元数据管理服务（基于文件存储）"""

    def __init__(self, data_path: Optional[Path] = None):
        if data_path is None:
            data_path = Path(__file__).parent.parent / "data"
        self.data_path = data_path
        self.metadata_file = self.data_path / "voice_metadata.json"
        self._ensure_data_dir()

    def _ensure_data_dir(self):
        """确保数据目录存在"""
        self.data_path.mkdir(parents=True, exist_ok=True)
        if not self.metadata_file.exists():
            self._save_metadata({"version": "1.0", "voices": {}})

    def _load_metadata(self) -> dict:
        """加载元数据"""
        try:
            with open(self.metadata_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"version": "1.0", "voices": {}}

    def _save_metadata(self, metadata: dict):
        """保存元数据"""
        with open(self.metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

    async def save_voice_metadata(
        self,
        voice_id: str,
        backend: str,
        visibility: str = "public",
        private_key: Optional[str] = None,
        **kwargs,
    ) -> dict:
        """
        保存音色元数据

        Args:
            voice_id: 音色 ID
            backend: 后端类型
            visibility: 可见性 ("public" 或 "private")
            private_key: 私人密钥（仅 visibility="private" 时需要）
            **kwargs: 其他元数据（name, emotions, ref_text 等）

        Returns:
            dict: 保存的元数据
        """
        metadata = self._load_metadata()

        voice_meta = {
            "id": voice_id,
            "backend": backend,
            "visibility": visibility,
            "created_at": datetime.utcnow().isoformat() + "Z",
            **{k: v for k, v in kwargs.items() if v is not None},
        }

        # 如果是私人音色，哈希密钥
        if visibility == "private" and private_key:
            salt, key_hash = hash_key(private_key)
            voice_meta["key_salt"] = salt
            voice_meta["key_hash"] = key_hash

        metadata["voices"][voice_id] = voice_meta
        self._save_metadata(metadata)

        logger.info(f"Saved voice metadata: {voice_id}, visibility: {visibility}")
        return voice_meta

    async def get_voice_metadata(self, voice_id: str) -> Optional[dict]:
        """获取音色元数据"""
        metadata = self._load_metadata()
        return metadata["voices"].get(voice_id)

    async def list_public_voices(self) -> list[dict]:
        """获取所有公共音色元数据"""
        metadata = self._load_metadata()
        return [
            voice
            for voice in metadata["voices"].values()
            if voice.get("visibility") == "public"
        ]

    async def list_private_voices_by_key(self, private_key: str) -> list[dict]:
        """
        获取指定密钥可访问的私人音色

        Args:
            private_key: 私人密钥

        Returns:
            list[dict]: 可访问的私人音色列表
        """
        metadata = self._load_metadata()
        accessible_voices = []

        for voice in metadata["voices"].values():
            if voice.get("visibility") != "private":
                continue

            salt = voice.get("key_salt")
            stored_hash = voice.get("key_hash")

            if salt and stored_hash and verify_key(private_key, salt, stored_hash):
                accessible_voices.append(voice)

        return accessible_voices

    async def verify_voice_access(
        self, voice_id: str, private_key: Optional[str] = None
    ) -> bool:
        """
        验证是否有权访问指定音色

        Args:
            voice_id: 音色 ID
            private_key: 私人密钥

        Returns:
            bool: 是否有权访问
        """
        voice_meta = await self.get_voice_metadata(voice_id)

        # 无元数据（旧音色）或公共音色，允许访问
        if voice_meta is None or voice_meta.get("visibility") == "public":
            return True

        # 私人音色需要验证密钥
        if voice_meta.get("visibility") == "private":
            if not private_key:
                return False

            salt = voice_meta.get("key_salt")
            stored_hash = voice_meta.get("key_hash")

            if salt and stored_hash:
                return verify_key(private_key, salt, stored_hash)

        return False

    async def verify_key_and_list_voices(
        self, private_key: str
    ) -> dict:
        """
        验证密钥并返回可访问的音色列表

        Args:
            private_key: 私人密钥

        Returns:
            dict: {valid: bool, voice_count: int, voice_ids: list}
        """
        voices = await self.list_private_voices_by_key(private_key)

        return {
            "valid": len(voices) > 0,
            "voice_count": len(voices),
            "voice_ids": [v["id"] for v in voices],
        }

    async def delete_metadata(self, voice_id: str) -> bool:
        """删除音色元数据"""
        metadata = self._load_metadata()

        if voice_id in metadata["voices"]:
            del metadata["voices"][voice_id]
            self._save_metadata(metadata)
            logger.info(f"Deleted voice metadata: {voice_id}")
            return True

        return False

    async def get_all_voice_ids_with_visibility(self) -> dict[str, str]:
        """
        获取所有音色 ID 及其可见性

        Returns:
            dict[str, str]: {voice_id: visibility}
        """
        metadata = self._load_metadata()
        return {
            voice_id: voice.get("visibility", "public")
            for voice_id, voice in metadata["voices"].items()
        }


# 单例实例
metadata_service = MetadataService()
