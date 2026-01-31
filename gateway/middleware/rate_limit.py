"""请求限流中间件"""

import time
from collections import defaultdict
from typing import Dict, Tuple

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from gateway.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    简单的令牌桶限流中间件

    按 IP 地址限制每分钟请求数
    """

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.tokens_per_second = requests_per_minute / 60.0

        # 存储每个 IP 的 (tokens, last_update_time)
        self._buckets: Dict[str, Tuple[float, float]] = defaultdict(
            lambda: (float(requests_per_minute), time.time())
        )

    def _get_client_ip(self, request: Request) -> str:
        """获取客户端 IP"""
        # 优先使用代理转发的真实 IP
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # 回退到直连 IP
        if request.client:
            return request.client.host

        return "unknown"

    def _check_rate_limit(self, client_ip: str) -> Tuple[bool, float]:
        """
        检查速率限制

        Returns:
            (是否允许, 剩余令牌数)
        """
        now = time.time()
        tokens, last_update = self._buckets[client_ip]

        # 计算新增的令牌
        elapsed = now - last_update
        new_tokens = min(
            self.requests_per_minute,
            tokens + elapsed * self.tokens_per_second
        )

        if new_tokens >= 1.0:
            # 消耗一个令牌
            self._buckets[client_ip] = (new_tokens - 1.0, now)
            return True, new_tokens - 1.0
        else:
            # 令牌不足
            self._buckets[client_ip] = (new_tokens, now)
            return False, new_tokens

    async def dispatch(self, request: Request, call_next):
        """处理请求"""
        # 检查是否启用限流
        if not settings.rate_limit_enabled:
            return await call_next(request)

        # 跳过健康检查等端点
        if request.url.path in ("/", "/health", "/docs", "/openapi.json", "/redoc"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        allowed, remaining = self._check_rate_limit(client_ip)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": f"请求过于频繁，请稍后再试。限制: {self.requests_per_minute} 请求/分钟",
                    "retry_after": 1.0 / self.tokens_per_second,
                },
                headers={
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": str(int(1.0 / self.tokens_per_second)),
                }
            )

        # 添加限流头信息
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(int(remaining))

        return response
