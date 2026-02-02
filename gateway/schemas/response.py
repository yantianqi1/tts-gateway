"""TTS 响应模型"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

# 可见性类型
VoiceVisibility = Literal["public", "private"]


class TTSResponse(BaseModel):
    """TTS 生成响应"""
    success: bool
    message: str
    audio_url: Optional[str] = None
    audio_id: Optional[str] = None
    model_used: Optional[str] = None
    duration: Optional[float] = None


class VoiceInfo(BaseModel):
    """音色信息"""
    id: str = Field(..., description="音色 ID")
    name: str = Field(..., description="显示名称")
    backend: str = Field(..., description="所属后端")
    emotions: List[str] = Field(default_factory=list, description="可用情感列表")
    ref_text: Optional[str] = Field(default=None, description="参考文本（Qwen3-TTS）")
    has_default: bool = Field(default=False, description="是否有默认音频")
    visibility: VoiceVisibility = Field(default="public", description="可见性：public 或 private")


class VoicesResponse(BaseModel):
    """音色列表响应"""
    voices: List[VoiceInfo]
    total: int


class VoiceUploadResponse(BaseModel):
    """音色上传响应"""
    success: bool
    message: str
    voice_id: Optional[str] = None
    emotion: Optional[str] = None
    backend: Optional[str] = None
    visibility: Optional[VoiceVisibility] = None


class VerifyKeyRequest(BaseModel):
    """密钥验证请求"""
    private_key: str = Field(..., description="私人密钥")


class VerifyKeyResponse(BaseModel):
    """密钥验证响应"""
    valid: bool = Field(..., description="密钥是否有效")
    voice_count: int = Field(default=0, description="可访问的音色数量")
    voice_ids: List[str] = Field(default_factory=list, description="可访问的音色 ID 列表")


class BackendStatus(BaseModel):
    """后端状态"""
    id: str
    name: str
    url: str
    status: str  # online / offline / error
    model_loaded: bool = False
    features: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class ModelInfo(BaseModel):
    """模型信息"""
    id: str = Field(..., description="模型 ID")
    name: str = Field(..., description="模型名称")
    backend: str = Field(..., description="所属后端")
    status: str = Field(..., description="状态: online / offline")
    features: List[str] = Field(default_factory=list, description="支持的特性")


class ModelsResponse(BaseModel):
    """模型列表响应"""
    models: List[ModelInfo]


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    backends: List[BackendStatus]
