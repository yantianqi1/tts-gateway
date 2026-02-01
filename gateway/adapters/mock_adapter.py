"""Mock TTS 适配器 - 用于无模型测试"""

import io
import wave
import struct
import math
import random
from typing import List

from .base import TTSAdapter, BackendStatus, VoiceItem


class MockAdapter(TTSAdapter):
    """Mock TTS 适配器 - 返回测试音频数据"""

    def __init__(self, backend_id: str = "mock", backend_name: str = "Mock TTS"):
        super().__init__(base_url="mock://localhost", timeout=1.0)
        self._backend_id = backend_id
        self._backend_name = backend_name
        self._voices = [
            VoiceItem(id="alloy", name="Alloy", emotions=["neutral", "happy"]),
            VoiceItem(id="echo", name="Echo", emotions=["neutral", "sad"]),
            VoiceItem(id="fable", name="Fable", emotions=["neutral"]),
            VoiceItem(id="onyx", name="Onyx", emotions=["neutral", "angry"]),
            VoiceItem(id="nova", name="Nova", emotions=["neutral", "happy", "excited"]),
            VoiceItem(id="shimmer", name="Shimmer", emotions=["neutral", "calm"]),
        ]

    @property
    def backend_id(self) -> str:
        return self._backend_id

    @property
    def backend_name(self) -> str:
        return self._backend_name

    @property
    def features(self) -> List[str]:
        return ["tts", "voices", "mock"]

    async def get_status(self) -> BackendStatus:
        """返回 Mock 状态"""
        return BackendStatus(
            online=True,
            model_loaded=True,
            model_name="mock-tts-1.0",
            device="cpu",
        )

    async def generate_speech(
        self,
        text: str,
        voice: str,
        **kwargs
    ) -> bytes:
        """
        生成测试音频

        根据文本长度生成对应时长的音频（约每字符 0.1 秒）
        """
        # 计算音频时长（基于文本长度）
        duration = max(0.5, min(len(text) * 0.1, 10.0))  # 0.5-10 秒

        # 生成测试音频
        response_format = kwargs.get("response_format", "mp3")

        if response_format == "wav":
            return self._generate_wav(duration)
        else:
            # 默认返回 MP3（这里用 WAV 代替，实际可以用 pydub 转换）
            return self._generate_wav(duration)

    async def list_voices(self) -> List[VoiceItem]:
        """返回预设的音色列表"""
        return self._voices

    async def upload_voice(
        self,
        file_content: bytes,
        filename: str,
        voice_id: str,
        **kwargs
    ) -> dict:
        """模拟上传音色"""
        # 添加到音色列表
        new_voice = VoiceItem(
            id=voice_id,
            name=kwargs.get("name", voice_id),
            emotions=["neutral"],
            ref_text=kwargs.get("ref_text"),
        )
        self._voices.append(new_voice)

        return {
            "success": True,
            "voice_id": voice_id,
            "message": "Mock: Voice uploaded successfully",
        }

    def _generate_wav(self, duration: float) -> bytes:
        """生成 WAV 格式的测试音频（正弦波）"""
        sample_rate = 24000
        num_samples = int(sample_rate * duration)

        # 生成正弦波（440Hz A4 音符）
        frequency = 440.0
        samples = []

        for i in range(num_samples):
            t = i / sample_rate
            # 添加一些变化使音频更有趣
            freq = frequency * (1 + 0.1 * math.sin(2 * math.pi * 0.5 * t))
            amplitude = 0.3 * (1 - 0.3 * math.sin(2 * math.pi * 0.25 * t))
            sample = amplitude * math.sin(2 * math.pi * freq * t)
            # 添加一些噪声
            sample += 0.02 * (random.random() - 0.5)
            samples.append(int(sample * 32767))

        # 创建 WAV 文件
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # 单声道
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(struct.pack(f'{len(samples)}h', *samples))

        return buffer.getvalue()


# 创建全局 Mock 实例
mock_qwen_adapter = MockAdapter(
    backend_id="qwen3-tts",
    backend_name="Qwen3-TTS (Mock)"
)

mock_indextts_adapter = MockAdapter(
    backend_id="indextts-2.0",
    backend_name="IndexTTS 2.0 (Mock)"
)
