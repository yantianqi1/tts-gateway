#!/bin/bash
# 停止所有 TTS 服务

set -e

echo "========================================"
echo "Stopping All TTS Services..."
echo "========================================"

# 停止 Gateway (端口 8000)
echo ""
echo "Stopping TTS Gateway (port 8000)..."
GATEWAY_PID=$(lsof -ti:8000 2>/dev/null || true)
if [ -n "$GATEWAY_PID" ]; then
    kill $GATEWAY_PID 2>/dev/null || true
    echo "  Stopped (PID: $GATEWAY_PID)"
else
    echo "  Not running"
fi

# 停止 Qwen3-TTS (端口 8019)
echo ""
echo "Stopping Qwen3-TTS Server (port 8019)..."
QWEN_PID=$(lsof -ti:8019 2>/dev/null || true)
if [ -n "$QWEN_PID" ]; then
    kill $QWEN_PID 2>/dev/null || true
    echo "  Stopped (PID: $QWEN_PID)"
else
    echo "  Not running"
fi

# 停止 IndexTTS (端口 8080)
echo ""
echo "Stopping IndexTTS Server (port 8080)..."
INDEX_PID=$(lsof -ti:8080 2>/dev/null || true)
if [ -n "$INDEX_PID" ]; then
    kill $INDEX_PID 2>/dev/null || true
    echo "  Stopped (PID: $INDEX_PID)"
else
    echo "  Not running"
fi

echo ""
echo "========================================"
echo "All services stopped!"
echo "========================================"
