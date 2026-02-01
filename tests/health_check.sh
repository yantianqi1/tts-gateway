#!/bin/bash
# ============================================
# TTS Gateway 健康检查脚本
# ============================================
# 用于部署后快速验证服务状态
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=5

# ============================================
# 检查函数
# ============================================

check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "000")

    if [ "$status" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓${NC} $name ($url) - HTTP $status"
        return 0
    elif [ "$status" = "000" ]; then
        echo -e "  ${RED}✗${NC} $name ($url) - 连接失败"
        return 1
    else
        echo -e "  ${RED}✗${NC} $name ($url) - HTTP $status (期望 $expected_status)"
        return 1
    fi
}

check_json_field() {
    local name=$1
    local url=$2
    local field=$3
    local expected=$4

    local response=$(curl -s --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "{}")
    local value=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('$field',''))" 2>/dev/null || echo "")

    if [ "$value" = "$expected" ]; then
        echo -e "  ${GREEN}✓${NC} $name: $field = $expected"
        return 0
    else
        echo -e "  ${RED}✗${NC} $name: $field = '$value' (期望 '$expected')"
        return 1
    fi
}

# ============================================
# 主检查
# ============================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              TTS Gateway 健康检查                           ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0

# Gateway 检查
echo -e "${BLUE}[Gateway 后端]${NC} $GATEWAY_URL"
echo "────────────────────────────────────────"

check_endpoint "根路径" "$GATEWAY_URL/" || ((ERRORS++))
check_endpoint "健康检查" "$GATEWAY_URL/health" || ((ERRORS++))
check_endpoint "API 文档" "$GATEWAY_URL/docs" || ((ERRORS++))
check_endpoint "模型列表" "$GATEWAY_URL/v1/models" || ((ERRORS++))
check_json_field "服务状态" "$GATEWAY_URL/health" "status" "running" || ((ERRORS++))

echo ""

# 前端检查
echo -e "${BLUE}[前端]${NC} $FRONTEND_URL"
echo "────────────────────────────────────────"

check_endpoint "首页" "$FRONTEND_URL/" || ((ERRORS++))

echo ""

# 后端服务检查（通过 Gateway 健康检查）
echo -e "${BLUE}[后端服务状态]${NC}"
echo "────────────────────────────────────────"

HEALTH_RESPONSE=$(curl -s --connect-timeout $TIMEOUT "$GATEWAY_URL/health" 2>/dev/null || echo "{}")

# 解析后端状态
python3 << EOF
import json
import sys

try:
    data = json.loads('''$HEALTH_RESPONSE''')
    backends = data.get('backends', [])

    for backend in backends:
        name = backend.get('name', 'Unknown')
        status = backend.get('status', 'unknown')
        model_loaded = backend.get('model_loaded', False)
        error = backend.get('error', '')

        if status == 'online' and model_loaded:
            print(f"  \033[0;32m✓\033[0m {name}: 在线, 模型已加载")
        elif status == 'online':
            print(f"  \033[1;33m⚠\033[0m {name}: 在线, 模型未加载")
        else:
            err_msg = f" ({error})" if error else ""
            print(f"  \033[0;31m✗\033[0m {name}: 离线{err_msg}")

    if not backends:
        print("  \033[1;33m⚠\033[0m 没有已注册的后端服务")

except Exception as e:
    print(f"  \033[0;31m✗\033[0m 解析健康检查响应失败: {e}")
EOF

echo ""

# 结果汇总
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！服务运行正常${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $ERRORS 个检查失败${NC}"
    exit 1
fi
