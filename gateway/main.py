"""TTS Gateway - FastAPI 主入口"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .config import settings
from .adapters import AdapterFactory
from .api.v1 import router as v1_router
from .middleware import RateLimitMiddleware, LoggingMiddleware
from .schemas.response import HealthResponse, BackendStatus

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("=" * 50)
    logger.info(f"TTS Gateway v{__version__} 启动中...")
    logger.info("=" * 50)

    # 初始化适配器
    AdapterFactory.initialize()
    logger.info(f"已注册后端: {AdapterFactory.list_backend_ids()}")

    # 检查后端状态
    for backend_id, adapter in AdapterFactory.get_all().items():
        try:
            status = await adapter.get_status()
            if status.online:
                logger.info(f"  {backend_id}: ONLINE (model_loaded={status.model_loaded})")
            else:
                logger.warning(f"  {backend_id}: OFFLINE ({status.error})")
        except Exception as e:
            logger.warning(f"  {backend_id}: ERROR ({e})")

    logger.info(f"服务已启动: http://{settings.host}:{settings.port}")
    logger.info("API 文档: http://{settings.host}:{settings.port}/docs")

    yield

    # 关闭时清理
    logger.info("TTS Gateway 正在关闭...")
    AdapterFactory.reset()


# 创建 FastAPI 应用
app = FastAPI(
    title="TTS Gateway",
    description="统一管理多个 TTS 后端的网关服务（OpenAI 兼容 API）",
    version=__version__,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加限流中间件
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=settings.rate_limit_requests_per_minute,
)

# 添加日志中间件
app.add_middleware(LoggingMiddleware)

# 注册 API 路由
app.include_router(v1_router, prefix="/v1")


@app.get("/", tags=["health"])
async def root():
    """根路径 - 服务信息"""
    return {
        "service": "TTS Gateway",
        "version": __version__,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """健康检查"""
    backends = []

    for backend_id, adapter in AdapterFactory.get_all().items():
        try:
            status = await adapter.get_status()
            backends.append(BackendStatus(
                id=backend_id,
                name=adapter.backend_name,
                url=adapter.base_url,
                status="online" if status.online else "offline",
                model_loaded=status.model_loaded,
                features=adapter.features,
                error=status.error,
            ))
        except Exception as e:
            backends.append(BackendStatus(
                id=backend_id,
                name=adapter.backend_name,
                url=adapter.base_url,
                status="error",
                model_loaded=False,
                features=adapter.features,
                error=str(e),
            ))

    return HealthResponse(
        status="running",
        version=__version__,
        backends=backends,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "gateway.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )
