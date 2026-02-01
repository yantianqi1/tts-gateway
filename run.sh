#!/bin/bash
# ============================================
# TTS Gateway 统一启动脚本
# ============================================
# 功能：
#   - 一键启动/停止所有服务
#   - 自动编译启动前端
#   - 自动拉取模型启动后端
#   - Mock 模式（无需模型测试）
#   - 查看服务状态和日志
#   - 清理构建缓存
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 目录配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BASE_DIR="$(dirname "$PROJECT_DIR")"
FRONTEND_DIR="$PROJECT_DIR/frontend"
GATEWAY_DIR="$PROJECT_DIR/gateway"
QWEN_TTS_DIR="$BASE_DIR/qwen3-tts-server"
INDEXTTS_DIR="$BASE_DIR/index-tts"
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

# 端口配置
FRONTEND_PORT=3098
GATEWAY_PORT=8000
QWEN_TTS_PORT=8019
INDEXTTS_PORT=8081

# 虚拟环境路径
GATEWAY_VENV="$PROJECT_DIR/venv"
QWEN_TTS_VENV="$QWEN_TTS_DIR/venv"
INDEXTTS_VENV="$INDEXTTS_DIR/venv"

# 加载根目录 .env 配置
load_env() {
    if [ -f "$PROJECT_DIR/.env" ]; then
        set -a
        source "$PROJECT_DIR/.env"
        set +a
        log_info "已加载配置文件: .env"
    fi
}

# ============================================
# 工具函数
# ============================================

print_header() {
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}          ${CYAN}TTS Gateway 统一管理脚本${NC}                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_menu() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}                      ${YELLOW}主菜单${NC}                               ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}1)${NC} 🚀 一键启动全部服务                                   ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}2)${NC} ⏹️  一键停止全部服务                                   ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}3)${NC} 🔄 重启全部服务                                       ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}4)${NC} 🎨 启动前端 (Next.js)                                 ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}5)${NC} 🔧 启动后端 (Gateway + TTS 模型)                      ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}6)${NC} 🧪 启动后端 Mock 模式 (无需模型)                      ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}7)${NC} ⏹️  停止前端                                           ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}8)${NC} ⏹️  停止后端                                           ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}9)${NC} 📊 查看服务状态                                       ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} ${GREEN}10)${NC} 📜 查看日志                                           ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} ${GREEN}11)${NC} 📺 合并显示所有日志 (单终端)                          ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} ${GREEN}12)${NC} 🧹 清理所有构建缓存                                   ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} ${GREEN}13)${NC} 📦 安装/更新依赖                                      ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│${NC}  ${GREEN}0)${NC} 🚪 退出脚本                                           ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
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

# 初始化目录
init_dirs() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$PID_DIR"
}

# 激活虚拟环境
activate_venv() {
    local venv_path="$1"
    if [ -d "$venv_path" ]; then
        source "$venv_path/bin/activate"
        return 0
    else
        return 1
    fi
}

# 检查端口是否被占用
check_port() {
    local port=$1
    # 优先使用 ss，其次 netstat，最后 lsof
    if command -v ss &>/dev/null; then
        ss -tuln | grep -q ":$port " && return 0
    elif command -v netstat &>/dev/null; then
        netstat -tuln | grep -q ":$port " && return 0
    elif lsof -ti:$port >/dev/null 2>&1; then
        return 0
    fi
    return 1  # 端口空闲
}

# 获取端口对应的 PID
get_port_pid() {
    local port=$1
    if command -v ss &>/dev/null; then
        ss -tlnp | grep ":$port " | grep -oP 'pid=\K[0-9]+' | head -1
    else
        lsof -ti:$port 2>/dev/null | head -1
    fi
}

# 停止指定端口的进程
stop_port() {
    local port=$1
    local name=$2
    local pid=$(get_port_pid $port)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
        sleep 1
        # 如果还在运行，强制杀死
        if check_port $port; then
            kill -9 $pid 2>/dev/null || true
        fi
        log_info "$name 已停止 (PID: $pid)"
    else
        log_info "$name 未在运行"
    fi
}

# 等待端口可用
wait_for_port() {
    local port=$1
    local name=$2
    local timeout=${3:-30}
    local count=0

    while ! check_port $port; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $timeout ]; then
            log_error "$name 启动超时"
            return 1
        fi
    done
    return 0
}

# ============================================
# 前端操作
# ============================================

start_frontend() {
    log_step "启动前端服务..."

    if check_port $FRONTEND_PORT; then
        log_warn "前端已在运行 (端口 $FRONTEND_PORT)"
        return 0
    fi

    cd "$FRONTEND_DIR"

    # 复制根目录 .env 到前端目录
    sync_frontend_env

    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi

    # 检查是否需要构建
    if [ ! -d ".next" ]; then
        log_info "构建前端..."
        npm run build
    fi

    # 启动前端
    log_info "启动 Next.js 服务 (端口 $FRONTEND_PORT)..."
    nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "$PID_DIR/frontend.pid"

    # 等待启动
    if wait_for_port $FRONTEND_PORT "前端" 15; then
        log_info "前端启动成功: http://localhost:$FRONTEND_PORT"
    else
        log_error "前端启动失败，请检查日志: $LOG_DIR/frontend.log"
        return 1
    fi
}

# 同步前端环境变量
sync_frontend_env() {
    if [ -f "$PROJECT_DIR/.env" ]; then
        # 提取前端相关的环境变量
        grep -E "^NEXT_PUBLIC_" "$PROJECT_DIR/.env" > "$FRONTEND_DIR/.env.local" 2>/dev/null || true
        if [ -s "$FRONTEND_DIR/.env.local" ]; then
            log_info "已同步前端环境变量到 frontend/.env.local"
        fi
    fi
}

stop_frontend() {
    log_step "停止前端服务..."
    stop_port $FRONTEND_PORT "前端"
    rm -f "$PID_DIR/frontend.pid"
}

build_frontend() {
    log_step "构建前端..."
    cd "$FRONTEND_DIR"

    # 同步环境变量
    sync_frontend_env

    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi

    log_info "执行构建..."
    npm run build
    log_info "前端构建完成"
}

# ============================================
# 后端操作
# ============================================

start_qwen_tts() {
    log_step "启动 Qwen3-TTS 服务..."

    if check_port $QWEN_TTS_PORT; then
        log_warn "Qwen3-TTS 已在运行 (端口 $QWEN_TTS_PORT)"
        return 0
    fi

    if [ ! -d "$QWEN_TTS_DIR" ]; then
        log_error "Qwen3-TTS 目录不存在: $QWEN_TTS_DIR"
        return 1
    fi

    cd "$QWEN_TTS_DIR"

    # 激活虚拟环境
    if activate_venv "$QWEN_TTS_VENV"; then
        log_info "已激活 Qwen3-TTS 虚拟环境"
    else
        log_warn "Qwen3-TTS 虚拟环境不存在，使用系统 Python"
    fi

    # 启动服务
    log_info "启动 Qwen3-TTS (端口 $QWEN_TTS_PORT)..."
    nohup python -m uvicorn backend.main:app --host 0.0.0.0 --port $QWEN_TTS_PORT > "$LOG_DIR/qwen3-tts.log" 2>&1 &
    echo $! > "$PID_DIR/qwen3-tts.pid"

    # 等待启动（模型加载可能较慢）
    log_info "等待 Qwen3-TTS 加载模型..."
    if wait_for_port $QWEN_TTS_PORT "Qwen3-TTS" 120; then
        log_info "Qwen3-TTS 启动成功: http://localhost:$QWEN_TTS_PORT"
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
        log_error "IndexTTS 目录不存在: $INDEXTTS_DIR"
        return 1
    fi

    cd "$INDEXTTS_DIR"

    # 激活虚拟环境
    if activate_venv "$INDEXTTS_VENV"; then
        log_info "已激活 IndexTTS 虚拟环境"
    else
        log_warn "IndexTTS 虚拟环境不存在，使用系统 Python"
    fi

    # 启动服务
    log_info "启动 IndexTTS (端口 $INDEXTTS_PORT)..."
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port $INDEXTTS_PORT > "$LOG_DIR/indextts.log" 2>&1 &
    echo $! > "$PID_DIR/indextts.pid"

    # 等待启动（模型加载可能较慢）
    log_info "等待 IndexTTS 加载模型..."
    if wait_for_port $INDEXTTS_PORT "IndexTTS" 120; then
        log_info "IndexTTS 启动成功: http://localhost:$INDEXTTS_PORT"
    else
        log_error "IndexTTS 启动失败，请检查日志: $LOG_DIR/indextts.log"
        return 1
    fi
}

start_gateway() {
    local mock_mode=${1:-false}
    log_step "启动 TTS Gateway 服务..."

    if check_port $GATEWAY_PORT; then
        log_warn "Gateway 已在运行 (端口 $GATEWAY_PORT)"
        return 0
    fi

    cd "$PROJECT_DIR"

    # 激活虚拟环境
    if activate_venv "$GATEWAY_VENV"; then
        log_info "已激活 Gateway 虚拟环境"
    else
        log_warn "Gateway 虚拟环境不存在，使用系统 Python"
    fi

    # 设置环境变量
    local env_vars=""
    if [ "$mock_mode" = "true" ]; then
        env_vars="TTS_GATEWAY_MOCK_MODE=true"
        log_info "启用 Mock 模式 (无需 TTS 模型)"
    fi

    # 启动服务
    log_info "启动 TTS Gateway (端口 $GATEWAY_PORT)..."
    if [ -n "$env_vars" ]; then
        nohup env $env_vars python -m uvicorn gateway.main:app --host 0.0.0.0 --port $GATEWAY_PORT > "$LOG_DIR/gateway.log" 2>&1 &
    else
        nohup python -m uvicorn gateway.main:app --host 0.0.0.0 --port $GATEWAY_PORT > "$LOG_DIR/gateway.log" 2>&1 &
    fi
    echo $! > "$PID_DIR/gateway.pid"

    sleep 3
    if check_port $GATEWAY_PORT; then
        log_info "Gateway 启动成功: http://localhost:$GATEWAY_PORT"
        log_info "API 文档: http://localhost:$GATEWAY_PORT/docs"
    else
        log_error "Gateway 启动失败，请检查日志: $LOG_DIR/gateway.log"
        return 1
    fi
}

start_backend() {
    log_step "启动所有后端服务..."
    echo ""

    # 1. 启动 TTS 模型服务
    start_qwen_tts
    echo ""
    start_indextts
    echo ""

    # 2. 启动 Gateway
    start_gateway
}

start_backend_mock() {
    log_step "启动后端 Mock 模式 (无需 TTS 模型)..."
    echo ""

    # 只启动 Gateway（Mock 模式）
    start_gateway true

    echo ""
    log_info "Mock 模式已启动，可用于前端开发测试"
    log_info "TTS 请求将返回测试音频数据"
}

stop_backend() {
    log_step "停止所有后端服务..."
    echo ""

    stop_port $GATEWAY_PORT "Gateway"
    stop_port $QWEN_TTS_PORT "Qwen3-TTS"
    stop_port $INDEXTTS_PORT "IndexTTS"

    rm -f "$PID_DIR/gateway.pid"
    rm -f "$PID_DIR/qwen3-tts.pid"
    rm -f "$PID_DIR/indextts.pid"
}

# ============================================
# 一键操作
# ============================================

start_all() {
    print_header
    log_step "一键启动所有服务..."
    echo ""

    init_dirs
    load_env

    # 先启动后端
    start_backend
    echo ""

    # 再启动前端
    start_frontend
    echo ""

    show_status
}

stop_all() {
    print_header
    log_step "一键停止所有服务..."
    echo ""

    stop_frontend
    echo ""
    stop_backend
    echo ""

    log_info "所有服务已停止"
}

restart_all() {
    print_header
    log_step "重启所有服务..."
    echo ""

    stop_all
    echo ""
    sleep 2
    start_all
}

# ============================================
# 状态和日志
# ============================================

show_status() {
    echo ""
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}                    ${YELLOW}服务状态${NC}                               ${CYAN}│${NC}"
    echo -e "${CYAN}├────────────────────────────────────────────────────────────┤${NC}"

    # 前端状态
    if check_port $FRONTEND_PORT; then
        local pid=$(get_port_pid $FRONTEND_PORT)
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} 前端 (Next.js)      : 运行中 - http://localhost:$FRONTEND_PORT  ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} 前端 (Next.js)      : 未运行                           ${CYAN}│${NC}"
    fi

    # Gateway 状态
    if check_port $GATEWAY_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} TTS Gateway         : 运行中 - http://localhost:$GATEWAY_PORT   ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} TTS Gateway         : 未运行                           ${CYAN}│${NC}"
    fi

    # Qwen3-TTS 状态
    if check_port $QWEN_TTS_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} Qwen3-TTS           : 运行中 - http://localhost:$QWEN_TTS_PORT  ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} Qwen3-TTS           : 未运行                           ${CYAN}│${NC}"
    fi

    # IndexTTS 状态
    if check_port $INDEXTTS_PORT; then
        echo -e "${CYAN}│${NC}  ${GREEN}●${NC} IndexTTS            : 运行中 - http://localhost:$INDEXTTS_PORT  ${CYAN}│${NC}"
    else
        echo -e "${CYAN}│${NC}  ${RED}○${NC} IndexTTS            : 未运行                           ${CYAN}│${NC}"
    fi

    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

show_logs_menu() {
    echo ""
    echo -e "${CYAN}选择要查看的日志:${NC}"
    echo "  1) 前端日志"
    echo "  2) Gateway 日志"
    echo "  3) Qwen3-TTS 日志"
    echo "  4) IndexTTS 日志"
    echo "  5) 所有日志 (实时)"
    echo "  0) 返回主菜单"
    echo ""
    read -p "请选择 [0-5]: " log_choice

    case $log_choice in
        1)
            if [ -f "$LOG_DIR/frontend.log" ]; then
                tail -f "$LOG_DIR/frontend.log"
            else
                log_warn "前端日志不存在"
            fi
            ;;
        2)
            if [ -f "$LOG_DIR/gateway.log" ]; then
                tail -f "$LOG_DIR/gateway.log"
            else
                log_warn "Gateway 日志不存在"
            fi
            ;;
        3)
            if [ -f "$LOG_DIR/qwen3-tts.log" ]; then
                tail -f "$LOG_DIR/qwen3-tts.log"
            else
                log_warn "Qwen3-TTS 日志不存在"
            fi
            ;;
        4)
            if [ -f "$LOG_DIR/indextts.log" ]; then
                tail -f "$LOG_DIR/indextts.log"
            else
                log_warn "IndexTTS 日志不存在"
            fi
            ;;
        5)
            log_info "实时查看所有日志 (Ctrl+C 退出)..."
            tail -f "$LOG_DIR"/*.log 2>/dev/null || log_warn "没有日志文件"
            ;;
        0)
            return
            ;;
        *)
            log_error "无效选择"
            ;;
    esac
}

# 合并显示所有日志（带颜色区分）
show_combined_logs() {
    echo ""
    log_info "合并显示所有服务日志 (Ctrl+C 退出)"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}[FE]${NC} 前端  ${BLUE}[GW]${NC} Gateway  ${YELLOW}[QW]${NC} Qwen3-TTS  ${PURPLE}[IX]${NC} IndexTTS"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo ""

    # 检查是否有 multitail
    if command -v multitail &> /dev/null; then
        multitail -ci green "$LOG_DIR/frontend.log" \
                  -ci blue "$LOG_DIR/gateway.log" \
                  -ci yellow "$LOG_DIR/qwen3-tts.log" \
                  -ci magenta "$LOG_DIR/indextts.log" 2>/dev/null
    else
        # 使用自定义脚本实现合并日志
        show_combined_logs_custom
    fi
}

# 自定义合并日志显示
show_combined_logs_custom() {
    # 创建临时命名管道
    local fifo_dir=$(mktemp -d)
    local fifo="$fifo_dir/logfifo"
    mkfifo "$fifo"

    # 清理函数
    cleanup_fifo() {
        rm -rf "$fifo_dir"
        # 杀死所有后台 tail 进程
        jobs -p | xargs -r kill 2>/dev/null
    }
    trap cleanup_fifo EXIT INT TERM

    # 启动各日志的 tail 并添加前缀
    if [ -f "$LOG_DIR/frontend.log" ]; then
        tail -f "$LOG_DIR/frontend.log" 2>/dev/null | while read line; do
            echo -e "${GREEN}[FE]${NC} $line"
        done &
    fi

    if [ -f "$LOG_DIR/gateway.log" ]; then
        tail -f "$LOG_DIR/gateway.log" 2>/dev/null | while read line; do
            echo -e "${BLUE}[GW]${NC} $line"
        done &
    fi

    if [ -f "$LOG_DIR/qwen3-tts.log" ]; then
        tail -f "$LOG_DIR/qwen3-tts.log" 2>/dev/null | while read line; do
            echo -e "${YELLOW}[QW]${NC} $line"
        done &
    fi

    if [ -f "$LOG_DIR/indextts.log" ]; then
        tail -f "$LOG_DIR/indextts.log" 2>/dev/null | while read line; do
            echo -e "${PURPLE}[IX]${NC} $line"
        done &
    fi

    # 等待用户中断
    wait
}

# ============================================
# 清理操作
# ============================================

clean_cache() {
    print_header
    log_step "清理所有构建缓存..."
    echo ""

    # 清理前端缓存
    log_info "清理前端缓存..."
    if [ -d "$FRONTEND_DIR/.next" ]; then
        rm -rf "$FRONTEND_DIR/.next"
        log_info "  已删除 .next/"
    fi
    if [ -d "$FRONTEND_DIR/node_modules/.cache" ]; then
        rm -rf "$FRONTEND_DIR/node_modules/.cache"
        log_info "  已删除 node_modules/.cache/"
    fi

    # 清理 Python 缓存
    log_info "清理 Python 缓存..."
    find "$PROJECT_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_DIR" -type f -name "*.pyc" -delete 2>/dev/null || true
    find "$PROJECT_DIR" -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    log_info "  已删除 __pycache__/ 和 *.pyc"

    # 清理日志
    log_info "清理日志文件..."
    if [ -d "$LOG_DIR" ]; then
        rm -rf "$LOG_DIR"/*
        log_info "  已清空 logs/"
    fi

    # 清理 PID 文件
    log_info "清理 PID 文件..."
    if [ -d "$PID_DIR" ]; then
        rm -rf "$PID_DIR"/*
        log_info "  已清空 pids/"
    fi

    echo ""
    log_info "缓存清理完成！"
}

clean_all() {
    print_header
    log_step "深度清理（包括 node_modules 和虚拟环境）..."
    echo ""

    read -p "确定要删除 node_modules 吗？这需要重新安装依赖 [y/N]: " confirm
    if [[ $confirm == [yY] ]]; then
        # 清理基本缓存
        clean_cache

        # 清理 node_modules
        log_info "清理 node_modules..."
        if [ -d "$FRONTEND_DIR/node_modules" ]; then
            rm -rf "$FRONTEND_DIR/node_modules"
            log_info "  已删除 frontend/node_modules/"
        fi

        echo ""
        log_info "深度清理完成！"
        log_warn "下次启动前需要运行 '安装/更新依赖'"
    else
        log_info "已取消"
    fi
}

# ============================================
# 依赖安装
# ============================================

install_deps() {
    print_header
    log_step "安装/更新依赖..."
    echo ""

    # 前端依赖
    log_info "安装前端依赖..."
    cd "$FRONTEND_DIR"
    npm install
    echo ""

    # Gateway Python 依赖
    log_info "安装 Gateway Python 依赖..."
    cd "$PROJECT_DIR"
    if activate_venv "$GATEWAY_VENV"; then
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
        fi
    else
        log_warn "Gateway 虚拟环境不存在，请先创建: python -m venv venv"
    fi
    echo ""

    log_info "依赖安装完成！"
}

# ============================================
# 开发模式
# ============================================

dev_frontend() {
    log_step "启动前端开发模式..."
    cd "$FRONTEND_DIR"

    # 同步环境变量
    sync_frontend_env

    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi

    log_info "启动开发服务器 (端口 $FRONTEND_PORT)..."
    npm run dev
}

dev_gateway() {
    log_step "启动 Gateway 开发模式..."
    cd "$PROJECT_DIR"

    if activate_venv "$GATEWAY_VENV"; then
        log_info "已激活虚拟环境"
    fi

    log_info "启动开发服务器 (端口 $GATEWAY_PORT)..."
    python -m uvicorn gateway.main:app --host 0.0.0.0 --port $GATEWAY_PORT --reload
}

# ============================================
# 主菜单
# ============================================

main_menu() {
    while true; do
        print_header
        print_menu

        read -p "请选择操作 [0-13]: " choice
        echo ""

        case $choice in
            1)
                start_all
                read -p "按回车键继续..."
                ;;
            2)
                stop_all
                read -p "按回车键继续..."
                ;;
            3)
                restart_all
                read -p "按回车键继续..."
                ;;
            4)
                init_dirs
                load_env
                start_frontend
                read -p "按回车键继续..."
                ;;
            5)
                init_dirs
                load_env
                start_backend
                read -p "按回车键继续..."
                ;;
            6)
                init_dirs
                load_env
                start_backend_mock
                read -p "按回车键继续..."
                ;;
            7)
                stop_frontend
                read -p "按回车键继续..."
                ;;
            8)
                stop_backend
                read -p "按回车键继续..."
                ;;
            9)
                show_status
                read -p "按回车键继续..."
                ;;
            10)
                show_logs_menu
                ;;
            11)
                show_combined_logs
                ;;
            12)
                clean_cache
                read -p "按回车键继续..."
                ;;
            13)
                install_deps
                read -p "按回车键继续..."
                ;;
            0)
                echo -e "${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                log_error "无效选择，请重试"
                sleep 1
                ;;
        esac
    done
}

# ============================================
# 命令行参数支持
# ============================================

show_help() {
    echo "TTS Gateway 管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start       一键启动所有服务"
    echo "  stop        一键停止所有服务"
    echo "  restart     重启所有服务"
    echo "  status      查看服务状态"
    echo "  frontend    启动前端"
    echo "  backend     启动后端"
    echo "  mock        启动后端 Mock 模式（无需模型）"
    echo "  stop-fe     停止前端"
    echo "  stop-be     停止后端"
    echo "  logs        合并显示所有日志"
    echo "  clean       清理构建缓存"
    echo "  install     安装依赖"
    echo "  dev-fe      前端开发模式"
    echo "  dev-gw      Gateway 开发模式"
    echo "  test        运行 API 测试"
    echo "  test-unit   运行单元测试"
    echo "  health      运行健康检查"
    echo "  help        显示帮助"
    echo ""
    echo "环境变量配置:"
    echo "  在项目根目录创建 .env 文件，配置 NEXT_PUBLIC_API_URL 等变量"
    echo "  示例: NEXT_PUBLIC_API_URL=http://gpu-server:8080"
    echo ""
    echo "不带参数运行将进入交互式菜单"
}

# ============================================
# 测试功能
# ============================================

run_api_tests() {
    log_step "运行 API 测试..."
    echo ""

    if [ -f "$PROJECT_DIR/tests/test_api.sh" ]; then
        bash "$PROJECT_DIR/tests/test_api.sh" "${1:-all}"
    else
        log_error "测试脚本不存在: tests/test_api.sh"
        return 1
    fi
}

run_unit_tests() {
    log_step "运行单元测试..."
    echo ""

    cd "$PROJECT_DIR"

    # 激活虚拟环境
    if activate_venv "$GATEWAY_VENV"; then
        log_info "已激活虚拟环境"
    fi

    # 安装测试依赖
    if [ -f "tests/requirements.txt" ]; then
        pip install -q -r tests/requirements.txt
    fi

    # 运行测试
    TTS_GATEWAY_MOCK_MODE=true python -m pytest tests/ -v --tb=short
}

run_health_check() {
    log_step "运行健康检查..."
    echo ""

    if [ -f "$PROJECT_DIR/tests/health_check.sh" ]; then
        bash "$PROJECT_DIR/tests/health_check.sh"
    else
        log_error "健康检查脚本不存在: tests/health_check.sh"
        return 1
    fi
}

# ============================================
# 入口
# ============================================

init_dirs

if [ $# -eq 0 ]; then
    # 无参数，进入交互式菜单
    main_menu
else
    # 有参数，执行对应命令
    load_env
    case "$1" in
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            restart_all
            ;;
        status)
            show_status
            ;;
        frontend)
            start_frontend
            ;;
        backend)
            start_backend
            ;;
        mock)
            start_backend_mock
            ;;
        stop-fe)
            stop_frontend
            ;;
        stop-be)
            stop_backend
            ;;
        logs)
            show_combined_logs
            ;;
        clean)
            clean_cache
            ;;
        install)
            install_deps
            ;;
        dev-fe)
            dev_frontend
            ;;
        dev-gw)
            dev_gateway
            ;;
        test)
            run_api_tests "${2:-all}"
            ;;
        test-unit)
            run_unit_tests
            ;;
        health)
            run_health_check
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
fi
