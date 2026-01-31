"""IndexTTS 后端适配器"""

import logging
from typing import List, Optional

import httpx

from .base import TTSAdapter, VoiceItem, BackendStatus

logger = logging.getLogger(__name__)


class IndexTTSAdapter(TTSAdapter):
    """IndexTTS 2.0 后端适配器"""

    @property
    def backend_id(self) -> str:
        return "indextts-2.0"

    @property
    def backend_name(self) -> str:
        return "IndexTTS 2.0"

    @property
    def features(self) -> List[str]:
        return [
            "emotion_control",
            "emotion_vector",
            "emotion_audio",
            "temperature",
            "top_p",
            "top_k",
            "auto_language",
        ]

    async def get_status(self) -> BackendStatus:
        """获取后端状态"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/")
                if response.status_code == 200:
                    data = response.json()
                    return BackendStatus(
                        online=True,
                        model_loaded=data.get("status") == "running",
                        model_name=data.get("service"),
                    )
                return BackendStatus(
                    online=False,
                    error=f"HTTP {response.status_code}"
                )
        except Exception as e:
            logger.warning(f"IndexTTS status check failed: {e}")
            return BackendStatus(online=False, error=str(e))

    async def generate_speech(
        self,
        text: str,
        voice: str,
        **kwargs
    ) -> bytes:
        """
        生成语音

        IndexTTS 使用 JSON 请求，直接返回音频流
        """
        # 构建请求体
        request_body = {
            "input": text,
            "voice": voice,
            "emotion": kwargs.get("emotion", "default"),
            "speed": kwargs.get("speed", 1.0),
            "response_format": kwargs.get("response_format", "wav"),
        }

        # 添加可选参数
        if kwargs.get("temperature") is not None:
            request_body["temperature"] = kwargs["temperature"]
        if kwargs.get("top_p") is not None:
            request_body["top_p"] = kwargs["top_p"]
        if kwargs.get("top_k") is not None:
            request_body["top_k"] = kwargs["top_k"]
        if kwargs.get("repetition_penalty") is not None:
            request_body["repetition_penalty"] = kwargs["repetition_penalty"]

        # 情感控制参数
        emotion_mode = kwargs.get("emotion_mode", "preset")
        request_body["emotion_mode"] = emotion_mode

        if emotion_mode == "audio" and kwargs.get("emo_audio_path"):
            request_body["emo_audio_path"] = kwargs["emo_audio_path"]
            if kwargs.get("emo_alpha") is not None:
                request_body["emo_alpha"] = kwargs["emo_alpha"]

        if emotion_mode == "vector" and kwargs.get("emo_vector"):
            request_body["emo_vector"] = kwargs["emo_vector"]

        if emotion_mode == "text":
            request_body["use_emo_text"] = kwargs.get("use_emo_text", True)
            if kwargs.get("emo_text"):
                request_body["emo_text"] = kwargs["emo_text"]

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/v1/audio/speech",
                    json=request_body,
                )
                response.raise_for_status()

                # IndexTTS 直接返回音频流
                return response.content

        except httpx.HTTPStatusError as e:
            logger.error(f"IndexTTS HTTP error: {e}")
            # 尝试解析错误详情
            try:
                error_detail = e.response.json().get("detail", str(e))
            except Exception:
                error_detail = str(e)
            raise Exception(f"IndexTTS 请求失败: {error_detail}")
        except Exception as e:
            logger.error(f"IndexTTS error: {e}")
            raise

    async def list_voices(self) -> List[VoiceItem]:
        """获取音色列表"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/v1/voices")
                response.raise_for_status()

                data = response.json()
                voices = []

                for voice in data.get("voices", []):
                    voices.append(VoiceItem(
                        id=voice.get("id"),
                        name=voice.get("name", voice.get("id")),
                        emotions=voice.get("emotions", ["default"]),
                        has_default=voice.get("has_default", False),
                    ))

                return voices

        except Exception as e:
            logger.error(f"Failed to list IndexTTS voices: {e}")
            return []

    async def upload_voice(
        self,
        file_content: bytes,
        filename: str,
        voice_id: str,
        **kwargs
    ) -> dict:
        """
        上传音色

        IndexTTS 使用 voice_id + emotion 结构
        """
        emotion = kwargs.get("emotion", "default")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {
                    "file": (filename, file_content, "audio/wav")
                }
                params = {
                    "voice_id": voice_id,
                    "emotion": emotion,
                }

                response = await client.post(
                    f"{self.base_url}/v1/voices/upload",
                    files=files,
                    params=params,
                )
                response.raise_for_status()

                result = response.json()
                return {
                    "success": result.get("success", False),
                    "message": result.get("message", ""),
                    "voice_id": result.get("voice_id"),
                    "emotion": result.get("emotion"),
                }

        except Exception as e:
            logger.error(f"Failed to upload voice to IndexTTS: {e}")
            return {
                "success": False,
                "message": str(e)
            }
