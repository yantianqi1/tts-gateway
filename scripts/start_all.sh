#!/bin/bash
# 启动所有 TTS 服务（后端 + Gateway）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BASE_DIR="$(dirname "$PROJECT_DIR")"

echo "========================================"
echo "Starting All TTS Services..."
echo "========================================"

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

# 1. 启动 Qwen3-TTS Server (端口 8019)
echo ""
echo "[1/3] Starting Qwen3-TTS Server (port 8019)..."
QWEN_TTS_DIR="$BASE_DIR/qwen3-tts-server"
if [ -d "$QWEN_TTS_DIR" ]; then
    cd "$QWEN_TTS_DIR"
    if [ -f "scripts/start.sh" ]; then
        nohup ./scripts/start.sh > "$PROJECT_DIR/logs/qwen3-tts.log" 2>&1 &
        echo "  Started (PID: $!)"
    else
        echo "  Warning: start.sh not found, trying uvicorn directly..."
        if [ -d "venv" ]; then
            source venv/bin/activate
        fi
        nohup python -m uvicorn backend.main:app --host 0.0.0.0 --port 8019 > "$PROJECT_DIR/logs/qwen3-tts.log" 2>&1 &
        echo "  Started (PID: $!)"
    fi
else
    echo "  Warning: Qwen3-TTS directory not found at $QWEN_TTS_DIR"
fi

# 2. 启动 IndexTTS Server (端口 8080)
echo ""
echo "[2/3] Starting IndexTTS Server (port 8080)..."
INDEXTTS_DIR="$BASE_DIR/index-TTS"
if [ -d "$INDEXTTS_DIR" ]; then
    cd "$INDEXTTS_DIR"
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 > "$PROJECT_DIR/logs/indextts.log" 2>&1 &
    echo "  Started (PID: $!)"
else
    echo "  Warning: IndexTTS directory not found at $INDEXTTS_DIR"
fi

# 等待后端启动
echo ""
echo "Waiting for backends to start..."
sleep 5

# 3. 启动 Gateway (端口 8000)
echo ""
echo "[3/3] Starting TTS Gateway (port 8000)..."
cd "$PROJECT_DIR"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
nohup python -m uvicorn gateway.main:app --host 0.0.0.0 --port 8000 > "$PROJECT_DIR/logs/gateway.log" 2>&1 &
echo "  Started (PID: $!)"

echo ""
echo "========================================"
echo "All services started!"
echo ""
echo "Gateway:     http://localhost:8000"
echo "Qwen3-TTS:   http://localhost:8019"
echo "IndexTTS:    http://localhost:8080"
echo ""
echo "API Docs:    http://localhost:8000/docs"
echo "Logs:        $PROJECT_DIR/logs/"
echo "========================================"
