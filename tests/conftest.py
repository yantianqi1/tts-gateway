"""TTS Gateway 测试配置"""

import pytest
import os
import sys

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置测试环境
os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """设置测试环境"""
    os.environ["TTS_GATEWAY_MOCK_MODE"] = "true"
    yield


@pytest.fixture
def reset_adapters():
    """重置适配器工厂"""
    from gateway.adapters.factory import AdapterFactory
    AdapterFactory.reset()
    yield
    AdapterFactory.reset()
