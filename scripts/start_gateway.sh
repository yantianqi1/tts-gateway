#!/bin/bash
# 启动 TTS Gateway 服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 检查虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# 设置默认端口
export TTS_GATEWAY_PORT=${TTS_GATEWAY_PORT:-8000}
export TTS_GATEWAY_HOST=${TTS_GATEWAY_HOST:-0.0.0.0}

echo "========================================"
echo "Starting TTS Gateway..."
echo "Host: $TTS_GATEWAY_HOST"
echo "Port: $TTS_GATEWAY_PORT"
echo "========================================"

# 启动服务
python -m uvicorn gateway.main:app \
    --host "$TTS_GATEWAY_HOST" \
    --port "$TTS_GATEWAY_PORT" \
    --reload
