"""适配器工厂"""

import logging
from typing import Dict, Optional

from gateway.config import settings
from .base import TTSAdapter
from .qwen_adapter import QwenTTSAdapter
from .indextts_adapter import IndexTTSAdapter

logger = logging.getLogger(__name__)


class AdapterFactory:
    """适配器工厂 - 管理和获取 TTS 适配器"""

    _adapters: Dict[str, TTSAdapter] = {}
    _initialized: bool = False

    @classmethod
    def initialize(cls) -> None:
        """初始化所有已启用的适配器"""
        if cls._initialized:
            return

        # 初始化 Qwen3-TTS 适配器
        if settings.qwen3_tts_enabled:
            cls._adapters["qwen3-tts"] = QwenTTSAdapter(
                base_url=settings.qwen3_tts_url,
                timeout=settings.qwen3_tts_timeout,
            )
            logger.info(f"Registered adapter: qwen3-tts ({settings.qwen3_tts_url})")

        # 初始化 IndexTTS 适配器
        if settings.indextts_enabled:
            cls._adapters["indextts-2.0"] = IndexTTSAdapter(
                base_url=settings.indextts_url,
                timeout=settings.indextts_timeout,
            )
            logger.info(f"Registered adapter: indextts-2.0 ({settings.indextts_url})")

        cls._initialized = True

    @classmethod
    def register(cls, backend_id: str, adapter: TTSAdapter) -> None:
        """注册适配器"""
        cls._adapters[backend_id] = adapter
        logger.info(f"Registered adapter: {backend_id}")

    @classmethod
    def get(cls, backend_id: str) -> Optional[TTSAdapter]:
        """获取指定适配器"""
        if not cls._initialized:
            cls.initialize()
        return cls._adapters.get(backend_id)

    @classmethod
    def get_all(cls) -> Dict[str, TTSAdapter]:
        """获取所有适配器"""
        if not cls._initialized:
            cls.initialize()
        return cls._adapters.copy()

    @classmethod
    def list_backend_ids(cls) -> list:
        """列出所有后端 ID"""
        if not cls._initialized:
            cls.initialize()
        return list(cls._adapters.keys())

    @classmethod
    async def auto_select(cls, **kwargs) -> Optional[TTSAdapter]:
        """
        自动选择适配器

        策略：
        1. 有 ref_audio_id -> qwen3-tts
        2. emotion_mode 非 preset -> indextts
        3. 语言非中英 -> qwen3-tts
        4. 默认 -> indextts
        """
        if not cls._initialized:
            cls.initialize()

        # 策略 1: 有参考音频 ID -> 使用 Qwen3-TTS
        if kwargs.get("ref_audio_id"):
            adapter = cls._adapters.get("qwen3-tts")
            if adapter:
                logger.debug("Auto-selected qwen3-tts (ref_audio_id provided)")
                return adapter

        # 策略 2: 情感模式非 preset -> 使用 IndexTTS
        emotion_mode = kwargs.get("emotion_mode", "preset")
        if emotion_mode != "preset":
            adapter = cls._adapters.get("indextts-2.0")
            if adapter:
                logger.debug(f"Auto-selected indextts-2.0 (emotion_mode={emotion_mode})")
                return adapter

        # 策略 3: 语言非中英 -> 使用 Qwen3-TTS（多语言支持更好）
        language = kwargs.get("language", "Chinese")
        if language not in ("Chinese", "English"):
            adapter = cls._adapters.get("qwen3-tts")
            if adapter:
                logger.debug(f"Auto-selected qwen3-tts (language={language})")
                return adapter

        # 策略 4: 默认使用 IndexTTS
        adapter = cls._adapters.get("indextts-2.0")
        if adapter:
            logger.debug("Auto-selected indextts-2.0 (default)")
            return adapter

        # 如果 IndexTTS 不可用，尝试 Qwen3-TTS
        adapter = cls._adapters.get("qwen3-tts")
        if adapter:
            logger.debug("Auto-selected qwen3-tts (fallback)")
            return adapter

        logger.warning("No adapter available for auto-selection")
        return None

    @classmethod
    async def get_healthy_adapter(cls, backend_id: str) -> Optional[TTSAdapter]:
        """获取健康的适配器（检查状态）"""
        adapter = cls.get(backend_id)
        if not adapter:
            return None

        status = await adapter.get_status()
        if status.online and status.model_loaded:
            return adapter

        logger.warning(f"Adapter {backend_id} is not healthy: {status}")
        return None

    @classmethod
    def reset(cls) -> None:
        """重置工厂状态（主要用于测试）"""
        cls._adapters.clear()
        cls._initialized = False
