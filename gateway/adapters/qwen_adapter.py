"""Qwen3-TTS 后端适配器"""

import logging
from typing import List, Optional

import httpx

from .base import TTSAdapter, VoiceItem, BackendStatus

logger = logging.getLogger(__name__)


class QwenTTSAdapter(TTSAdapter):
    """Qwen3-TTS 后端适配器"""

    @property
    def backend_id(self) -> str:
        return "qwen3-tts"

    @property
    def backend_name(self) -> str:
        return "Qwen3-TTS"

    @property
    def features(self) -> List[str]:
        return [
            "voice_cloning",
            "multi_language",
            "reference_audio",
        ]

    async def get_status(self) -> BackendStatus:
        """获取后端状态"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/status")
                if response.status_code == 200:
                    data = response.json()
                    return BackendStatus(
                        online=True,
                        model_loaded=data.get("model_loaded", False),
                        model_name=data.get("model_name"),
                        device=data.get("device"),
                    )
                return BackendStatus(
                    online=False,
                    error=f"HTTP {response.status_code}"
                )
        except Exception as e:
            logger.warning(f"Qwen3-TTS status check failed: {e}")
            return BackendStatus(online=False, error=str(e))

    async def generate_speech(
        self,
        text: str,
        voice: str,
        **kwargs
    ) -> bytes:
        """
        生成语音

        Qwen3-TTS 使用 FormData 提交，需要 ref_audio_id
        """
        ref_audio_id = kwargs.get("ref_audio_id") or voice
        language = kwargs.get("language", "Chinese")

        # 构建 FormData
        form_data = {
            "text": text,
            "language": language,
            "ref_audio_id": ref_audio_id,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 调用 TTS API
                response = await client.post(
                    f"{self.base_url}/api/tts",
                    data=form_data,
                )
                response.raise_for_status()

                result = response.json()
                if not result.get("success"):
                    raise Exception(result.get("message", "TTS 生成失败"))

                # 获取音频 URL 并下载
                audio_url = result.get("audio_url")
                if not audio_url:
                    raise Exception("未返回音频 URL")

                # 下载音频
                audio_response = await client.get(
                    f"{self.base_url}{audio_url}"
                )
                audio_response.raise_for_status()

                return audio_response.content

        except httpx.HTTPStatusError as e:
            logger.error(f"Qwen3-TTS HTTP error: {e}")
            raise Exception(f"Qwen3-TTS 请求失败: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Qwen3-TTS error: {e}")
            raise

    async def list_voices(self) -> List[VoiceItem]:
        """获取音色列表（参考音频）"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/ref_audios")
                response.raise_for_status()

                data = response.json()
                voices = []

                for audio in data.get("audios", []):
                    voices.append(VoiceItem(
                        id=audio.get("id"),
                        name=audio.get("filename", audio.get("id")),
                        ref_text=audio.get("ref_text"),
                        emotions=["default"],
                        has_default=True,
                    ))

                return voices

        except Exception as e:
            logger.error(f"Failed to list Qwen3-TTS voices: {e}")
            return []

    async def upload_voice(
        self,
        file_content: bytes,
        filename: str,
        voice_id: str,
        **kwargs
    ) -> dict:
        """
        上传参考音频

        Qwen3-TTS 需要 ref_text（参考文本）
        """
        ref_text = kwargs.get("ref_text", "")
        if not ref_text:
            return {
                "success": False,
                "message": "Qwen3-TTS 需要提供参考文本 (ref_text)"
            }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {
                    "file": (filename, file_content, "audio/wav")
                }
                data = {
                    "ref_text": ref_text
                }

                response = await client.post(
                    f"{self.base_url}/api/upload_ref_audio",
                    files=files,
                    data=data,
                )
                response.raise_for_status()

                result = response.json()
                return {
                    "success": result.get("success", False),
                    "message": result.get("message", ""),
                    "voice_id": result.get("ref_id"),
                }

        except Exception as e:
            logger.error(f"Failed to upload voice to Qwen3-TTS: {e}")
            return {
                "success": False,
                "message": str(e)
            }
