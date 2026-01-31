"""TTS 适配器抽象基类"""

from abc import ABC, abstractmethod
from typing import List, Optional

from pydantic import BaseModel, Field


class VoiceItem(BaseModel):
    """音色项"""
    id: str
    name: str
    emotions: List[str] = Field(default_factory=list)
    ref_text: Optional[str] = None
    has_default: bool = False


class BackendStatus(BaseModel):
    """后端状态"""
    online: bool
    model_loaded: bool = False
    model_name: Optional[str] = None
    device: Optional[str] = None
    error: Optional[str] = None


class TTSAdapter(ABC):
    """TTS 后端适配器抽象基类"""

    def __init__(self, base_url: str, timeout: float = 60.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    @property
    @abstractmethod
    def backend_id(self) -> str:
        """后端标识符"""
        pass

    @property
    @abstractmethod
    def backend_name(self) -> str:
        """后端显示名称"""
        pass

    @property
    @abstractmethod
    def features(self) -> List[str]:
        """支持的特性列表"""
        pass

    @abstractmethod
    async def get_status(self) -> BackendStatus:
        """获取后端状态"""
        pass

    @abstractmethod
    async def generate_speech(
        self,
        text: str,
        voice: str,
        **kwargs
    ) -> bytes:
        """
        生成语音

        Args:
            text: 待合成文本
            voice: 音色 ID
            **kwargs: 其他参数

        Returns:
            音频二进制数据
        """
        pass

    @abstractmethod
    async def list_voices(self) -> List[VoiceItem]:
        """获取音色列表"""
        pass

    @abstractmethod
    async def upload_voice(
        self,
        file_content: bytes,
        filename: str,
        voice_id: str,
        **kwargs
    ) -> dict:
        """
        上传音色

        Args:
            file_content: 文件内容
            filename: 文件名
            voice_id: 音色 ID
            **kwargs: 其他参数（如 ref_text, emotion）

        Returns:
            上传结果
        """
        pass
