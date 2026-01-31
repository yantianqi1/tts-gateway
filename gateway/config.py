"""配置管理模块"""

import os
from pathlib import Path
from typing import Optional

import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class BackendConfig(BaseModel):
    """单个后端配置"""
    enabled: bool = True
    url: str
    timeout: float = 60.0


class BackendsConfig(BaseModel):
    """所有后端配置"""
    qwen3_tts: BackendConfig = BackendConfig(
        enabled=True,
        url="http://localhost:8019",
        timeout=60.0
    )
    indextts: BackendConfig = BackendConfig(
        enabled=True,
        url="http://localhost:8080",
        timeout=120.0
    )


class ServerConfig(BaseModel):
    """服务器配置"""
    host: str = "0.0.0.0"
    port: int = 8000


class RateLimitConfig(BaseModel):
    """限流配置"""
    enabled: bool = True
    requests_per_minute: int = 60


class Settings(BaseSettings):
    """应用配置"""

    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000

    # 后端配置
    qwen3_tts_url: str = "http://localhost:8019"
    qwen3_tts_timeout: float = 60.0
    qwen3_tts_enabled: bool = True

    indextts_url: str = "http://localhost:8080"
    indextts_timeout: float = 120.0
    indextts_enabled: bool = True

    # 限流配置
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 60

    # 日志配置
    log_level: str = "INFO"

    class Config:
        env_prefix = "TTS_GATEWAY_"
        env_file = ".env"
        extra = "ignore"


def load_yaml_config(config_path: Optional[Path] = None) -> dict:
    """加载 YAML 配置文件"""
    if config_path is None:
        # 默认配置文件路径
        config_path = Path(__file__).parent.parent / "config" / "config.yaml"

    if not config_path.exists():
        return {}

    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def get_settings() -> Settings:
    """获取配置实例，合并 YAML 和环境变量"""
    yaml_config = load_yaml_config()

    # 构建配置字典
    config_dict = {}

    # 从 YAML 加载服务器配置
    if "server" in yaml_config:
        server = yaml_config["server"]
        if "host" in server:
            config_dict["host"] = server["host"]
        if "port" in server:
            config_dict["port"] = server["port"]

    # 从 YAML 加载后端配置
    if "backends" in yaml_config:
        backends = yaml_config["backends"]

        if "qwen3_tts" in backends:
            qwen = backends["qwen3_tts"]
            if "url" in qwen:
                config_dict["qwen3_tts_url"] = qwen["url"]
            if "timeout" in qwen:
                config_dict["qwen3_tts_timeout"] = qwen["timeout"]
            if "enabled" in qwen:
                config_dict["qwen3_tts_enabled"] = qwen["enabled"]

        if "indextts" in backends:
            idx = backends["indextts"]
            if "url" in idx:
                config_dict["indextts_url"] = idx["url"]
            if "timeout" in idx:
                config_dict["indextts_timeout"] = idx["timeout"]
            if "enabled" in idx:
                config_dict["indextts_enabled"] = idx["enabled"]

    # 从 YAML 加载限流配置
    if "rate_limit" in yaml_config:
        rl = yaml_config["rate_limit"]
        if "enabled" in rl:
            config_dict["rate_limit_enabled"] = rl["enabled"]
        if "requests_per_minute" in rl:
            config_dict["rate_limit_requests_per_minute"] = rl["requests_per_minute"]

    # 创建配置实例（环境变量会覆盖 YAML 配置）
    return Settings(**config_dict)


# 全局配置实例
settings = get_settings()
