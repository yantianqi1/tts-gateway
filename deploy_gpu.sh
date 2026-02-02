#!/bin/bash
# ============================================
# TTS Gateway - GPU 服务器一键部署脚本
# ============================================
# 功能：
#   - 自动检测 GPU 环境 (CUDA)
#   - 自动克隆 TTS 模型推理代码
#   - 自动创建虚拟环境并安装依赖
#   - 自动下载 TTS 模型
#   - 启动 Gateway 服务 (统一入口 8080 端口)
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 目录配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
DEPLOY_DIR="${TTS_DEPLOY_DIR:-$PROJECT_DIR}"
LOG_DIR="$DEPLOY_DIR/logs"
PID_DIR="$DEPLOY_DIR/pids"

# TTS 后端目录
QWEN_TTS_DIR="$DEPLOY_DIR/Qwen3-TTS"
INDEXTTS_DIR="$DEPLOY_DIR/index-tts"

# 虚拟环境
GATEWAY_VENV="$DEPLOY_DIR/venv"
QWEN_TTS_VENV="$QWEN_TTS_DIR/.venv"
INDEXTTS_VENV="$INDEXTTS_DIR/.venv"

# 端口配置
GATEWAY_PORT=${TTS_GATEWAY_PORT:-8080}
QWEN_TTS_PORT=8019
INDEXTTS_PORT=8081

# Git 仓库
QWEN_TTS_REPO="https://github.com/QwenLM/Qwen3-TTS.git"
INDEXTTS_REPO="https://github.com/index-tts/index-tts.git"

# ============================================
# 工具函数
# ============================================

print_header() {
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}      ${CYAN}TTS Gateway - GPU 服务器一键部署脚本${NC}              ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

init_dirs() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$PID_DIR"
}

check_port() {
    local port=$1
    if command -v ss &>/dev/null; then
        ss -tuln | grep -q ":$port " && return 0
    elif command -v netstat &>/dev/null; then
        netstat -tuln | grep -q ":$port " && return 0
    elif command -v lsof &>/dev/null; then
        lsof -ti:$port >/dev/null 2>&1 && return 0
    fi
    return 1
}

get_port_pid() {
    local port=$1
    if command -v ss &>/dev/null; then
        ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+' | head -1
    elif command -v lsof &>/dev/null; then
        lsof -ti:$port 2>/dev/null | head -1
    fi
}

stop_port() {
    local port=$1
    local name=$2
    local pid=$(get_port_pid $port)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
        sleep 1
        if check_port $port; then
            kill -9 $pid 2>/dev/null || true
        fi
        log_info "$name 已停止 (PID: $pid)"
    fi
}

wait_for_port() {
    local port=$1
    local name=$2
    local timeout=${3:-60}
    local count=0

    while ! check_port $port; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $timeout ]; then
            log_error "$name 启动超时 (${timeout}秒)"
            return 1
        fi
        if [ $((count % 10)) -eq 0 ]; then
            log_info "等待 $name 启动... (${count}/${timeout}秒)"
        fi
    done
    return 0
}

# ============================================
# 环境检测
# ============================================

check_system() {
    log_step "检测系统环境..."
    echo ""

    if [ -f /etc/os-release ]; then
        . /etc/os-release
        log_info "操作系统: $NAME $VERSION"
    else
        log_info "操作系统: $(uname -s) $(uname -r)"
    fi

    if command -v python3 &>/dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1)
        log_info "Python: $PYTHON_VERSION"
    else
        log_error "未找到 Python3，请先安装 Python 3.10+"
        exit 1
    fi

    if ! command -v pip3 &>/dev/null && ! python3 -m pip --version &>/dev/null; then
        log_error "未找到 pip，请先安装 pip"
        exit 1
    fi
    log_info "pip: $(python3 -m pip --version 2>&1 | head -1)"

    if ! command -v git &>/dev/null; then
        log_error "未找到 git，请先安装 git"
        exit 1
    fi
    log_info "git: $(git --version)"

    echo ""
}

check_gpu() {
    log_step "检测 GPU 环境..."
    echo ""

    GPU_AVAILABLE=false

    if command -v nvidia-smi &>/dev/null; then
        GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null || echo "")
        if [ -n "$GPU_INFO" ]; then
            GPU_AVAILABLE=true
            log_info "GPU 检测: 已检测到 NVIDIA GPU"
            echo "$GPU_INFO" | while read line; do
                log_info "  - $line"
            done

            DRIVER_VERSION=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>/dev/null | head -1)
            if [ -n "$DRIVER_VERSION" ]; then
                log_info "驱动版本: $DRIVER_VERSION"
            fi
        fi
    fi

    if command -v nvcc &>/dev/null; then
        NVCC_VERSION=$(nvcc --version | grep "release" | awk '{print $5}' | tr -d ',')
        log_info "CUDA Toolkit: $NVCC_VERSION"
    fi

    if [ "$GPU_AVAILABLE" = false ]; then
        log_warn "未检测到 GPU，将使用 CPU 模式运行"
        log_warn "CPU 模式下推理速度会较慢"
    fi

    export GPU_AVAILABLE
    echo ""
}

check_memory() {
    log_step "检测内存..."
    echo ""

    if [ -f /proc/meminfo ]; then
        TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
        FREE_MEM=$(grep MemAvailable /proc/meminfo | awk '{print int($2/1024/1024)}')
        log_info "系统内存: ${TOTAL_MEM}GB (可用: ${FREE_MEM}GB)"

        if [ "$TOTAL_MEM" -lt 16 ]; then
            log_warn "建议至少 16GB 内存以同时运行两个 TTS 模型"
        fi
    fi

    if command -v nvidia-smi &>/dev/null; then
        GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1)
        if [ -n "$GPU_MEM" ]; then
            GPU_MEM_GB=$((GPU_MEM / 1024))
            log_info "GPU 显存: ${GPU_MEM_GB}GB"

            if [ "$GPU_MEM_GB" -lt 8 ]; then
                log_warn "显存不足 8GB，可能无法同时加载两个模型"
            fi
        fi
    fi

    echo ""
}

check_disk() {
    log_step "检测磁盘空间..."
    echo ""

    DISK_FREE=$(df -BG "$DEPLOY_DIR" 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
    log_info "可用磁盘空间: ${DISK_FREE}GB"

    if [ "$DISK_FREE" -lt 20 ]; then
        log_warn "磁盘空间不足 20GB"
        log_warn "模型下载需要约 10-15GB 空间"
    fi

    echo ""
}

# ============================================
# 安装 uv 包管理器
# ============================================

install_uv() {
    if command -v uv &>/dev/null; then
        log_info "uv 已安装: $(uv --version)"
        return 0
    fi

    log_info "安装 uv 包管理器..."
    curl -LsSf https://astral.sh/uv/install.sh | sh

    # 添加到 PATH
    export PATH="$HOME/.local/bin:$PATH"

    if command -v uv &>/dev/null; then
        log_success "uv 安装成功: $(uv --version)"
    else
        log_error "uv 安装失败"
        return 1
    fi
}

# ============================================
# 代码克隆
# ============================================

clone_repo() {
    local repo_url=$1
    local target_dir=$2
    local name=$3

    if [ -d "$target_dir" ]; then
        log_info "$name 目录已存在，检查更新..."
        cd "$target_dir"
        git pull 2>/dev/null || log_warn "$name 更新失败，使用现有版本"
    else
        log_info "克隆 $name 代码..."
        if git clone --depth 1 "$repo_url" "$target_dir"; then
            log_success "$name 代码克隆完成"
        else
            log_error "克隆 $name 失败: $repo_url"
            return 1
        fi
    fi
    return 0
}

setup_tts_repos() {
    log_step "克隆 TTS 后端代码..."
    echo ""

    clone_repo "$QWEN_TTS_REPO" "$QWEN_TTS_DIR" "Qwen3-TTS"
    clone_repo "$INDEXTTS_REPO" "$INDEXTTS_DIR" "IndexTTS"

    echo ""
}

# ============================================
# 创建 API 服务封装
# ============================================

create_qwen_api_server() {
    log_step "创建 Qwen3-TTS API 服务..."

    local api_file="$QWEN_TTS_DIR/api_server.py"

    cat > "$api_file" << 'PYEOF'
"""Qwen3-TTS API Server - OpenAI 兼容接口"""
import os
import io
import uuid
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import torch

app = FastAPI(title="Qwen3-TTS API", version="1.0.0")

# 全局模型实例
tts_model = None
tokenizer = None
REF_AUDIO_DIR = Path("ref_audios")
REF_AUDIO_DIR.mkdir(exist_ok=True)


class TTSRequest(BaseModel):
    input: str
    voice: str = "default"
    ref_audio_id: Optional[str] = None
    language: str = "auto"
    speed: float = 1.0
    response_format: str = "wav"


class StatusResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: Optional[str] = None
    device: Optional[str] = None


def get_model():
    global tts_model, tokenizer
    if tts_model is None:
        from qwen_tts import Qwen3TTSModel, Qwen3TTSTokenizer

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Qwen3-TTS model on {device}...")

        model_name = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
        tts_model = Qwen3TTSModel.from_pretrained(model_name, device_map=device)
        tokenizer = Qwen3TTSTokenizer.from_pretrained("Qwen/Qwen3-TTS-Tokenizer-12Hz")

        print("Model loaded successfully!")
    return tts_model, tokenizer


@app.get("/")
async def root():
    return {"service": "Qwen3-TTS API", "status": "running"}


@app.get("/api/status")
async def get_status():
    global tts_model
    device = "cuda" if torch.cuda.is_available() else "cpu"
    return StatusResponse(
        status="running",
        model_loaded=tts_model is not None,
        model_name="Qwen3-TTS-12Hz-1.7B-Base",
        device=device
    )


@app.post("/v1/audio/speech")
async def generate_speech(request: TTSRequest):
    try:
        model, tok = get_model()

        # 获取参考音频（如果有）
        ref_audio_path = None
        if request.ref_audio_id:
            ref_path = REF_AUDIO_DIR / f"{request.ref_audio_id}.wav"
            if ref_path.exists():
                ref_audio_path = str(ref_path)

        # 生成语音
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            output_path = f.name

        # 调用模型
        if ref_audio_path:
            model.synthesize(
                text=request.input,
                ref_audio=ref_audio_path,
                output_path=output_path,
            )
        else:
            model.synthesize(
                text=request.input,
                output_path=output_path,
            )

        # 读取生成的音频
        with open(output_path, "rb") as f:
            audio_data = f.read()

        # 清理临时文件
        os.unlink(output_path)

        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/voices")
async def list_voices():
    voices = []
    for audio_file in REF_AUDIO_DIR.glob("*.wav"):
        voices.append({
            "id": audio_file.stem,
            "name": audio_file.stem,
            "preview_url": f"/ref_audios/{audio_file.name}"
        })

    if not voices:
        voices.append({
            "id": "default",
            "name": "Default Voice",
            "preview_url": None
        })

    return {"voices": voices}


@app.post("/v1/voices/upload")
async def upload_voice(
    file: UploadFile = File(...),
    voice_id: str = Form(...)
):
    try:
        content = await file.read()
        save_path = REF_AUDIO_DIR / f"{voice_id}.wav"

        with open(save_path, "wb") as f:
            f.write(content)

        return {
            "success": True,
            "voice_id": voice_id,
            "message": "Voice uploaded successfully"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8019)
PYEOF

    log_success "Qwen3-TTS API 服务创建完成"
}

create_indextts_api_server() {
    log_step "创建 IndexTTS API 服务..."

    local api_file="$INDEXTTS_DIR/api_server.py"

    cat > "$api_file" << 'PYEOF'
"""IndexTTS API Server - OpenAI 兼容接口"""
import os
import io
import tempfile
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(title="IndexTTS API", version="1.0.0")

# 全局模型实例
tts_model = None
VOICE_DIR = Path("voices")
VOICE_DIR.mkdir(exist_ok=True)


class TTSRequest(BaseModel):
    input: str
    voice: str = "default"
    emotion: str = "default"
    speed: float = 1.0
    response_format: str = "wav"
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = None


class StatusResponse(BaseModel):
    service: str
    status: str


def get_model():
    global tts_model
    if tts_model is None:
        from indextts.infer_v2 import IndexTTS2

        print("Loading IndexTTS-2 model...")
        tts_model = IndexTTS2(
            cfg_path="checkpoints/config.yaml",
            model_dir="checkpoints"
        )
        print("Model loaded successfully!")
    return tts_model


def find_voice_audio(voice_id: str) -> Optional[str]:
    """查找音色对应的音频文件"""
    for ext in [".wav", ".mp3", ".flac"]:
        path = VOICE_DIR / f"{voice_id}{ext}"
        if path.exists():
            return str(path)

    # 检查 examples 目录
    examples_dir = Path("examples")
    if examples_dir.exists():
        for audio_file in examples_dir.glob("*.wav"):
            if voice_id in audio_file.stem:
                return str(audio_file)

    return None


@app.get("/")
async def root():
    return StatusResponse(service="IndexTTS API", status="running")


@app.get("/api/status")
async def get_status():
    global tts_model
    return {
        "status": "running",
        "model_loaded": tts_model is not None,
        "model_name": "IndexTTS-2"
    }


@app.post("/v1/audio/speech")
async def generate_speech(request: TTSRequest):
    try:
        model = get_model()

        # 查找音色音频
        voice_audio = find_voice_audio(request.voice)
        if not voice_audio:
            # 使用默认音频
            examples_dir = Path("examples")
            if examples_dir.exists():
                wav_files = list(examples_dir.glob("*.wav"))
                if wav_files:
                    voice_audio = str(wav_files[0])

        if not voice_audio:
            raise HTTPException(
                status_code=400,
                detail=f"Voice '{request.voice}' not found and no default voice available"
            )

        # 生成语音
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            output_path = f.name

        model.infer(
            spk_audio_prompt=voice_audio,
            text=request.input,
            output_path=output_path
        )

        # 读取生成的音频
        with open(output_path, "rb") as f:
            audio_data = f.read()

        os.unlink(output_path)

        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/voices")
async def list_voices():
    voices = []

    # 从 voices 目录读取
    for audio_file in VOICE_DIR.glob("*.*"):
        if audio_file.suffix.lower() in [".wav", ".mp3", ".flac"]:
            voices.append({
                "id": audio_file.stem,
                "name": audio_file.stem,
                "emotions": ["default"],
                "has_default": True
            })

    # 从 examples 目录读取
    examples_dir = Path("examples")
    if examples_dir.exists():
        for audio_file in examples_dir.glob("*.wav"):
            voices.append({
                "id": audio_file.stem,
                "name": audio_file.stem,
                "emotions": ["default"],
                "has_default": True
            })

    if not voices:
        voices.append({
            "id": "default",
            "name": "Default Voice",
            "emotions": ["default"],
            "has_default": True
        })

    return {"voices": voices}


@app.post("/v1/voices/upload")
async def upload_voice(
    file: UploadFile = File(...),
    voice_id: str = Form(...)
):
    try:
        content = await file.read()

        # 确定文件扩展名
        ext = Path(file.filename).suffix or ".wav"
        save_path = VOICE_DIR / f"{voice_id}{ext}"

        with open(save_path, "wb") as f:
            f.write(content)

        return {
            "success": True,
            "voice_id": voice_id,
            "message": "Voice uploaded successfully"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
PYEOF

    log_success "IndexTTS API 服务创建完成"
}

# ============================================
# 环境设置
# ============================================

setup_gateway_env() {
    log_step "设置 Gateway 环境..."
    echo ""

    if [ ! -d "$GATEWAY_VENV" ]; then
        log_info "创建 Gateway 虚拟环境..."
        python3 -m venv "$GATEWAY_VENV"
    fi

    source "$GATEWAY_VENV/bin/activate"
    pip install --upgrade pip -q

    if [ -f "$PROJECT_DIR/requirements.txt" ]; then
        log_info "安装 Gateway 依赖..."
        pip install -r "$PROJECT_DIR/requirements.txt" -q
    fi

    log_success "Gateway 环境设置完成"
    echo ""
}

setup_qwen_tts_env() {
    log_step "设置 Qwen3-TTS 环境..."
    echo ""

    if [ ! -d "$QWEN_TTS_DIR" ]; then
        log_warn "Qwen3-TTS 目录不存在，跳过"
        return 0
    fi

    cd "$QWEN_TTS_DIR"

    # 创建虚拟环境
    if [ ! -d "$QWEN_TTS_VENV" ]; then
        log_info "创建虚拟环境..."
        python3 -m venv "$QWEN_TTS_VENV"
    fi

    source "$QWEN_TTS_VENV/bin/activate"
    pip install --upgrade pip -q

    # 安装 PyTorch
    if ! python -c "import torch" 2>/dev/null; then
        log_info "安装 PyTorch..."
        if [ "$GPU_AVAILABLE" = true ]; then
            pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
        else
            pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
        fi
    fi

    # 安装 qwen-tts
    log_info "安装 qwen-tts..."
    pip install qwen-tts -q

    # 安装 API 服务依赖
    pip install fastapi uvicorn python-multipart -q

    # 创建 API 服务
    create_qwen_api_server

    log_success "Qwen3-TTS 环境设置完成"
    echo ""
}

setup_indextts_env() {
    log_step "设置 IndexTTS 环境..."
    echo ""

    if [ ! -d "$INDEXTTS_DIR" ]; then
        log_warn "IndexTTS 目录不存在，跳过"
        return 0
    fi

    cd "$INDEXTTS_DIR"

    # IndexTTS 推荐使用 uv
    install_uv

    # 使用 uv 同步依赖
    log_info "安装 IndexTTS 依赖 (使用 uv)..."
    uv sync --all-extras 2>/dev/null || {
        log_warn "uv sync 失败，尝试使用 pip..."

        if [ ! -d "$INDEXTTS_VENV" ]; then
            python3 -m venv "$INDEXTTS_VENV"
        fi
        source "$INDEXTTS_VENV/bin/activate"
        pip install --upgrade pip -q

        if [ "$GPU_AVAILABLE" = true ]; then
            pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
        else
            pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
        fi

        if [ -f "pyproject.toml" ]; then
            pip install -e . -q 2>/dev/null || pip install . -q 2>/dev/null || true
        fi
    }

    # 安装 API 服务依赖
    if [ -d "$INDEXTTS_VENV" ]; then
        source "$INDEXTTS_VENV/bin/activate"
    fi
    pip install fastapi uvicorn python-multipart -q 2>/dev/null || uv pip install fastapi uvicorn python-multipart -q

    # 创建 API 服务
    create_indextts_api_server

    log_success "IndexTTS 环境设置完成"
    echo ""
}

# ============================================
# 模型下载
# ============================================

download_qwen_tts_model() {
    log_step "检查 Qwen3-TTS 模型..."
    echo ""

    if [ ! -d "$QWEN_TTS_DIR" ]; then
        log_warn "Qwen3-TTS 目录不存在，跳过"
        return 0
    fi

    cd "$QWEN_TTS_DIR"
    source "$QWEN_TTS_VENV/bin/activate"

    # qwen-tts 会在首次使用时自动下载模型到 ~/.cache/huggingface/
    log_info "Qwen3-TTS 模型将在首次使用时自动下载 (~3GB)"
    log_info "模型会缓存到 ~/.cache/huggingface/"

    echo ""
}

download_indextts_model() {
    log_step "检查 IndexTTS 模型..."
    echo ""

    if [ ! -d "$INDEXTTS_DIR" ]; then
        log_warn "IndexTTS 目录不存在，跳过"
        return 0
    fi

    cd "$INDEXTTS_DIR"

    # 检查模型是否已存在
    if [ -d "checkpoints" ] && [ -f "checkpoints/config.yaml" ]; then
        log_info "IndexTTS 模型已存在"
        return 0
    fi

    # 激活环境
    if [ -d "$INDEXTTS_VENV" ]; then
        source "$INDEXTTS_VENV/bin/activate"
    fi

    # 安装 modelscope
    pip install modelscope -i https://pypi.tuna.tsinghua.edu.cn/simple -q 2>/dev/null || \
        uv pip install modelscope -q 2>/dev/null || true

    # 下载模型
    mkdir -p checkpoints
    log_info "开始下载 IndexTTS-2 模型 (约 3-5GB)..."
    log_info "这可能需要较长时间，请耐心等待..."

    if python -c "from modelscope import snapshot_download; snapshot_download('IndexTeam/IndexTTS-2', local_dir='checkpoints')" 2>/dev/null; then
        log_success "IndexTTS 模型下载完成"
    else
        log_warn "自动下载失败，请手动下载模型"
        log_info "运行: modelscope download --model IndexTeam/IndexTTS-2 --local_dir checkpoints/"
    fi

    echo ""
}

# ============================================
# 服务启动
# ============================================

start_qwen_tts() {
    log_step "启动 Qwen3-TTS 服务..."

    if check_port $QWEN_TTS_PORT; then
        log_warn "Qwen3-TTS 已在运行 (端口 $QWEN_TTS_PORT)"
        return 0
    fi

    if [ ! -d "$QWEN_TTS_DIR" ]; then
        log_warn "Qwen3-TTS 目录不存在，跳过"
        return 0
    fi

    cd "$QWEN_TTS_DIR"
    source "$QWEN_TTS_VENV/bin/activate"

    log_info "启动 Qwen3-TTS API (端口 $QWEN_TTS_PORT)..."
    nohup python api_server.py > "$LOG_DIR/qwen3-tts.log" 2>&1 &
    echo $! > "$PID_DIR/qwen3-tts.pid"

    if wait_for_port $QWEN_TTS_PORT "Qwen3-TTS" 300; then
        log_success "Qwen3-TTS 启动成功: http://127.0.0.1:$QWEN_TTS_PORT"
    else
        log_error "Qwen3-TTS 启动失败，请检查日志: $LOG_DIR/qwen3-tts.log"
        return 1
    fi
}

start_indextts() {
    log_step "启动 IndexTTS 服务..."

    if check_port $INDEXTTS_PORT; then
        log_warn "IndexTTS 已在运行 (端口 $INDEXTTS_PORT)"
        return 0
    fi

    if [ ! -d "$INDEXTTS_DIR" ]; then
        log_warn "IndexTTS 目录不存在，跳过"
        return 0
    fi

    cd "$INDEXTTS_DIR"

    # 使用正确的环境
    if [ -d "$INDEXTTS_VENV" ]; then
        source "$INDEXTTS_VENV/bin/activate"
        log_info "启动 IndexTTS API (端口 $INDEXTTS_PORT)..."
        nohup python api_server.py > "$LOG_DIR/indextts.log" 2>&1 &
    else
        log_info "启动 IndexTTS API (使用 uv, 端口 $INDEXTTS_PORT)..."
        nohup uv run python api_server.py > "$LOG_DIR/indextts.log" 2>&1 &
    fi
    echo $! > "$PID_DIR/indextts.pid"

    if wait_for_port $INDEXTTS_PORT "IndexTTS" 300; then
        log_success "IndexTTS 启动成功: http://127.0.0.1:$INDEXTTS_PORT"
    else
        log_error "IndexTTS 启动失败，请检查日志: $LOG_DIR/indextts.log"
        return 1
    fi
}

start_gateway() {
    log_step "启动 TTS Gateway 服务..."

    if check_port $GATEWAY_PORT; then
        log_warn "Gateway 已在运行 (端口 $GATEWAY_PORT)"
        return 0
    fi

    cd "$PROJECT_DIR"
    source "$GATEWAY_VENV/bin/activate"

    # 设置后端 URL
    export TTS_GATEWAY_QWEN3_TTS_URL="http://127.0.0.1:$QWEN_TTS_PORT"
    export TTS_GATEWAY_INDEXTTS_URL="http://127.0.0.1:$INDEXTTS_PORT"
    export TTS_GATEWAY_PORT=$GATEWAY_PORT
    export TTS_GATEWAY_HOST="0.0.0.0"

    log_info "启动 Gateway (端口 $GATEWAY_PORT)..."
    nohup python -m uvicorn gateway.main:app --host 0.0.0.0 --port $GATEWAY_PORT > "$LOG_DIR/gateway.log" 2>&1 &
    echo $! > "$PID_DIR/gateway.pid"

    sleep 3
    if check_port $GATEWAY_PORT; then
        log_success "Gateway 启动成功"
    else
        log_error "Gateway 启动失败，请检查日志: $LOG_DIR/gateway.log"
        return 1
    fi
}

# ============================================
# 停止服务
# ============================================

stop_all() {
    log_step "停止所有服务..."
    echo ""

    stop_port $GATEWAY_PORT "Gateway"
    stop_port $QWEN_TTS_PORT "Qwen3-TTS"
    stop_port $INDEXTTS_PORT "IndexTTS"

    rm -f "$PID_DIR"/*.pid

    log_success "所有服务已停止"
}

# ============================================
# 状态显示
# ============================================

show_status() {
    echo ""
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}                    ${YELLOW}服务状态${NC}                               ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"

    if check_port $GATEWAY_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} TTS Gateway         : 运行中 - http://0.0.0.0:$GATEWAY_PORT   ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} TTS Gateway         : 未运行                           ${CYAN}│${NC}"
    fi

    if check_port $QWEN_TTS_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} Qwen3-TTS           : 运行中 - http://127.0.0.1:$QWEN_TTS_PORT  ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} Qwen3-TTS           : 未运行                           ${CYAN}│${NC}"
    fi

    if check_port $INDEXTTS_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} IndexTTS            : 运行中 - http://127.0.0.1:$INDEXTTS_PORT  ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} IndexTTS            : 未运行                           ${CYAN}│${NC}"
    fi

    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

show_final_info() {
    # 获取公网 IP
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "<GPU服务器IP>")

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    部署完成！${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}统一 API 入口:${NC}"
    echo -e "    http://${PUBLIC_IP}:${GATEWAY_PORT}"
    echo ""
    echo -e "  ${CYAN}API 文档:${NC}"
    echo -e "    http://${PUBLIC_IP}:${GATEWAY_PORT}/docs"
    echo ""
    echo -e "  ${CYAN}前端配置:${NC}"
    echo -e "    NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:${GATEWAY_PORT}"
    echo ""
    echo -e "  ${CYAN}日志目录:${NC}"
    echo -e "    $LOG_DIR"
    echo ""
    echo -e "  ${CYAN}常用命令:${NC}"
    echo -e "    ./deploy_gpu.sh status   # 查看状态"
    echo -e "    ./deploy_gpu.sh stop     # 停止服务"
    echo -e "    ./deploy_gpu.sh start    # 启动服务"
    echo -e "    ./deploy_gpu.sh logs     # 查看日志"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
}

# ============================================
# 主流程
# ============================================

deploy_full() {
    print_header

    check_system
    check_gpu
    check_memory
    check_disk

    echo ""
    read -p "是否继续部署？[Y/n]: " confirm
    if [[ $confirm == [nN] ]]; then
        log_info "已取消部署"
        exit 0
    fi
    echo ""

    init_dirs
    setup_tts_repos
    setup_gateway_env
    setup_qwen_tts_env
    setup_indextts_env
    download_qwen_tts_model
    download_indextts_model

    echo ""
    log_step "启动所有服务..."
    echo ""

    start_qwen_tts
    echo ""
    start_indextts
    echo ""
    start_gateway
    echo ""

    show_status
    show_final_info
}

start_services() {
    print_header
    init_dirs

    # 重新检测 GPU
    GPU_AVAILABLE=false
    if command -v nvidia-smi &>/dev/null && nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | grep -q .; then
        GPU_AVAILABLE=true
    fi
    export GPU_AVAILABLE

    log_step "启动所有服务..."
    echo ""

    start_qwen_tts
    echo ""
    start_indextts
    echo ""
    start_gateway
    echo ""

    show_status
}

show_logs() {
    echo ""
    echo -e "${CYAN}选择要查看的日志:${NC}"
    echo "  1) Gateway 日志"
    echo "  2) Qwen3-TTS 日志"
    echo "  3) IndexTTS 日志"
    echo "  4) 所有日志 (实时)"
    echo "  0) 退出"
    echo ""
    read -p "请选择 [0-4]: " choice

    case $choice in
        1) tail -f "$LOG_DIR/gateway.log" 2>/dev/null || echo "日志文件不存在" ;;
        2) tail -f "$LOG_DIR/qwen3-tts.log" 2>/dev/null || echo "日志文件不存在" ;;
        3) tail -f "$LOG_DIR/indextts.log" 2>/dev/null || echo "日志文件不存在" ;;
        4) tail -f "$LOG_DIR"/*.log 2>/dev/null || echo "日志文件不存在" ;;
        *) return ;;
    esac
}

show_help() {
    echo "TTS Gateway - GPU 服务器部署脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy    完整部署 (环境检测 + 代码克隆 + 依赖安装 + 模型下载 + 启动)"
    echo "  start     启动所有服务"
    echo "  stop      停止所有服务"
    echo "  restart   重启所有服务"
    echo "  status    查看服务状态"
    echo "  logs      查看日志"
    echo "  check     仅检测环境"
    echo "  help      显示帮助"
    echo ""
    echo "环境变量:"
    echo "  TTS_GATEWAY_PORT   Gateway 端口 (默认: 8080)"
    echo "  TTS_DEPLOY_DIR     部署目录 (默认: 当前目录)"
    echo ""
    echo "默认仓库:"
    echo "  Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS"
    echo "  IndexTTS:  https://github.com/index-tts/index-tts"
    echo ""
    echo "示例:"
    echo "  ./deploy_gpu.sh deploy   # 完整部署"
    echo "  ./deploy_gpu.sh start    # 仅启动服务"
    echo "  ./deploy_gpu.sh status   # 查看状态"
    echo ""
}

# ============================================
# 入口
# ============================================

case "${1:-deploy}" in
    deploy)
        deploy_full
        ;;
    start)
        start_services
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    check)
        print_header
        check_system
        check_gpu
        check_memory
        check_disk
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
