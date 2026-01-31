"""请求日志中间件"""

import logging
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("gateway.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    请求日志中间件

    记录请求路径、方法、耗时、状态码
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """处理请求并记录日志"""
        start_time = time.time()

        # 获取客户端 IP
        client_ip = self._get_client_ip(request)

        # 处理请求
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            # 记录异常
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"{client_ip} - {request.method} {request.url.path} - "
                f"ERROR ({duration:.2f}ms) - {str(e)}"
            )
            raise

        # 计算耗时
        duration = (time.time() - start_time) * 1000

        # 根据状态码选择日志级别
        if status_code >= 500:
            log_func = logger.error
        elif status_code >= 400:
            log_func = logger.warning
        else:
            log_func = logger.info

        # 记录日志
        log_func(
            f"{client_ip} - {request.method} {request.url.path} - "
            f"{status_code} ({duration:.2f}ms)"
        )

        # 添加响应头
        response.headers["X-Response-Time"] = f"{duration:.2f}ms"

        return response

    def _get_client_ip(self, request: Request) -> str:
        """获取客户端 IP"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        if request.client:
            return request.client.host

        return "unknown"
