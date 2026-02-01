"""TTS Gateway 单元测试"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import os

# 设置测试环境
os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"


class TestMockAdapter:
    """测试 Mock 适配器"""

    @pytest.fixture
    def mock_adapter(self):
        from gateway.adapters.mock_adapter import MockAdapter
        return MockAdapter(backend_id="test-mock", backend_name="Test Mock")

    @pytest.mark.asyncio
    async def test_get_status(self, mock_adapter):
        """测试获取状态"""
        status = await mock_adapter.get_status()
        assert status.online is True
        assert status.model_loaded is True
        assert status.model_name == "mock-tts-1.0"

    @pytest.mark.asyncio
    async def test_generate_speech(self, mock_adapter):
        """测试生成语音"""
        audio = await mock_adapter.generate_speech(
            text="测试文本",
            voice="alloy"
        )
        assert isinstance(audio, bytes)
        assert len(audio) > 0
        # WAV 文件应该以 RIFF 开头
        assert audio[:4] == b'RIFF'

    @pytest.mark.asyncio
    async def test_generate_speech_duration(self, mock_adapter):
        """测试音频时长与文本长度相关"""
        short_audio = await mock_adapter.generate_speech(text="短", voice="alloy")
        long_audio = await mock_adapter.generate_speech(text="这是一段很长的测试文本", voice="alloy")

        # 长文本应该生成更大的音频文件
        assert len(long_audio) > len(short_audio)

    @pytest.mark.asyncio
    async def test_list_voices(self, mock_adapter):
        """测试获取音色列表"""
        voices = await mock_adapter.list_voices()
        assert len(voices) > 0
        assert any(v.id == "alloy" for v in voices)

    @pytest.mark.asyncio
    async def test_upload_voice(self, mock_adapter):
        """测试上传音色"""
        result = await mock_adapter.upload_voice(
            file_content=b"fake audio data",
            filename="test.wav",
            voice_id="custom-voice"
        )
        assert result["success"] is True
        assert result["voice_id"] == "custom-voice"


class TestAdapterFactory:
    """测试适配器工厂"""

    @pytest.fixture(autouse=True)
    def reset_factory(self):
        """每个测试前重置工厂"""
        from gateway.adapters.factory import AdapterFactory
        AdapterFactory.reset()
        yield
        AdapterFactory.reset()

    def test_initialize_mock_mode(self):
        """测试 Mock 模式初始化"""
        os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"

        from gateway.adapters.factory import AdapterFactory
        AdapterFactory.initialize()

        adapters = AdapterFactory.get_all()
        assert "qwen3-tts" in adapters
        assert "indextts-2.0" in adapters

    def test_get_adapter(self):
        """测试获取适配器"""
        os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"

        from gateway.adapters.factory import AdapterFactory
        adapter = AdapterFactory.get("qwen3-tts")
        assert adapter is not None
        assert adapter.backend_id == "qwen3-tts"

    def test_list_backend_ids(self):
        """测试列出后端 ID"""
        os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"

        from gateway.adapters.factory import AdapterFactory
        ids = AdapterFactory.list_backend_ids()
        assert "qwen3-tts" in ids
        assert "indextts-2.0" in ids

    @pytest.mark.asyncio
    async def test_auto_select(self):
        """测试自动选择适配器"""
        os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"

        from gateway.adapters.factory import AdapterFactory
        adapter = await AdapterFactory.auto_select()
        assert adapter is not None


class TestTTSService:
    """测试 TTS 服务"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """设置测试环境"""
        os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"
        from gateway.adapters.factory import AdapterFactory
        AdapterFactory.reset()
        yield
        AdapterFactory.reset()

    @pytest.mark.asyncio
    async def test_generate_speech(self):
        """测试语音生成"""
        from gateway.services.tts_service import TTSService
        from gateway.schemas.request import TTSRequest

        service = TTSService()
        request = TTSRequest(
            model="auto",
            input="测试文本",
            voice="alloy"
        )

        audio_data, metadata = await service.generate_speech(request)

        assert isinstance(audio_data, bytes)
        assert len(audio_data) > 0
        assert "model_used" in metadata

    @pytest.mark.asyncio
    async def test_generate_speech_with_specific_model(self):
        """测试指定模型生成"""
        from gateway.services.tts_service import TTSService
        from gateway.schemas.request import TTSRequest

        service = TTSService()

        # 测试 qwen3-tts
        request = TTSRequest(
            model="qwen3-tts",
            input="测试",
            voice="alloy"
        )
        audio_data, metadata = await service.generate_speech(request)
        assert metadata["model_used"] == "qwen3-tts"

        # 测试 indextts
        request = TTSRequest(
            model="indextts-2.0",
            input="测试",
            voice="alloy"
        )
        audio_data, metadata = await service.generate_speech(request)
        assert metadata["model_used"] == "indextts-2.0"


class TestSchemas:
    """测试数据模式"""

    def test_tts_request_validation(self):
        """测试 TTS 请求验证"""
        from gateway.schemas.request import TTSRequest

        # 有效请求
        request = TTSRequest(
            model="auto",
            input="测试",
            voice="alloy"
        )
        assert request.model == "auto"
        assert request.input == "测试"

    def test_tts_request_defaults(self):
        """测试 TTS 请求默认值"""
        from gateway.schemas.request import TTSRequest

        request = TTSRequest(
            model="auto",
            input="测试",
            voice="alloy"
        )
        assert request.speed == 1.0
        # 检查 response_format 有默认值
        assert request.response_format in ("mp3", "wav", "opus", "aac", "flac")

    def test_health_response(self):
        """测试健康响应模式"""
        from gateway.schemas.response import HealthResponse, BackendStatus

        response = HealthResponse(
            status="running",
            version="1.0.0",
            backends=[
                BackendStatus(
                    id="test",
                    name="Test",
                    url="http://localhost",
                    status="online",
                    model_loaded=True,
                    features=["tts"]
                )
            ]
        )
        assert response.status == "running"
        assert len(response.backends) == 1


class TestConfig:
    """测试配置"""

    def test_settings_defaults(self):
        """测试默认配置"""
        from gateway.config import Settings

        settings = Settings()
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000

    def test_settings_from_env(self):
        """测试从环境变量加载配置"""
        os.environ["TTS_GATEWAY_PORT"] = "9000"

        from gateway.config import Settings
        settings = Settings()

        # 清理环境变量
        del os.environ["TTS_GATEWAY_PORT"]

        assert settings.port == 9000


# 运行测试
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
