"""TTS 请求模型（OpenAI 兼容风格）"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class TTSRequest(BaseModel):
    """统一 TTS 请求模型"""

    # 基础参数
    model: str = Field(
        default="auto",
        description="模型选择: 'qwen3-tts', 'indextts-2.0', 'auto'"
    )
    input: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="待合成的文本"
    )
    voice: str = Field(
        default="default",
        description="音色ID"
    )
    response_format: Literal["wav", "mp3"] = Field(
        default="wav",
        description="输出音频格式"
    )
    speed: float = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="语速，范围 0.5-2.0"
    )

    # Qwen3-TTS 专用参数
    language: str = Field(
        default="Chinese",
        description="语言（Qwen3-TTS 专用）"
    )
    ref_audio_id: Optional[str] = Field(
        default=None,
        description="参考音频 ID（Qwen3-TTS 声音克隆专用）"
    )

    # IndexTTS 专用参数
    emotion: str = Field(
        default="default",
        description="情感标签（IndexTTS 专用）"
    )
    temperature: Optional[float] = Field(
        default=1.0,
        ge=0.1,
        le=2.0,
        description="温度，控制生成随机性"
    )
    top_p: Optional[float] = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="核采样"
    )
    top_k: Optional[int] = Field(
        default=20,
        ge=1,
        le=100,
        description="Top-K 采样"
    )
    repetition_penalty: Optional[float] = Field(
        default=1.0,
        ge=0.1,
        le=2.0,
        description="重复惩罚"
    )

    # IndexTTS 2.0 情感控制
    emotion_mode: Literal["preset", "audio", "vector", "text"] = Field(
        default="preset",
        description="情感控制模式"
    )
    emo_audio_path: Optional[str] = Field(
        default=None,
        description="情感参考音频路径"
    )
    emo_alpha: Optional[float] = Field(
        default=1.0,
        ge=0.0,
        le=1.6,
        description="情感混合权重"
    )
    emo_vector: Optional[List[float]] = Field(
        default=None,
        description="8维情感向量"
    )
    use_emo_text: bool = Field(
        default=False,
        description="是否使用情感文本分析"
    )
    emo_text: Optional[str] = Field(
        default=None,
        description="情感分析文本"
    )

    # 保存选项
    save_audio: bool = Field(
        default=False,
        description="是否保存到本地"
    )
    save_name: Optional[str] = Field(
        default=None,
        description="保存文件名"
    )

    @field_validator("emo_vector")
    @classmethod
    def validate_emo_vector(cls, v):
        if v is not None:
            if len(v) != 8:
                raise ValueError("emo_vector 必须是长度为 8 的列表")
            for i, val in enumerate(v):
                if not 0 <= val <= 1.4:
                    raise ValueError(f"emo_vector[{i}] 必须在 [0, 1.4] 范围内")
        return v


class VoiceUploadRequest(BaseModel):
    """音色上传请求"""
    voice_id: str = Field(
        default="default",
        description="音色 ID"
    )
    emotion: str = Field(
        default="default",
        description="情感标签（IndexTTS）"
    )
    ref_text: Optional[str] = Field(
        default=None,
        description="参考文本（Qwen3-TTS）"
    )
    backend: str = Field(
        default="indextts",
        description="目标后端: 'qwen3-tts', 'indextts'"
    )
