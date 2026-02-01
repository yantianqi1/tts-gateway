#!/bin/bash
# ============================================
# TTS Gateway API 测试脚本
# ============================================
# 测试所有 API 端点是否正常工作
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
TEST_OUTPUT_DIR="/tmp/tts-gateway-tests"
PASSED=0
FAILED=0
SKIPPED=0

# 创建输出目录
mkdir -p "$TEST_OUTPUT_DIR"

# ============================================
# 工具函数
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    ((SKIPPED++))
}

# 检查 HTTP 状态码
check_status() {
    local expected=$1
    local actual=$2
    local test_name=$3

    if [ "$actual" -eq "$expected" ]; then
        log_pass "$test_name (HTTP $actual)"
        return 0
    else
        log_fail "$test_name (期望 HTTP $expected, 实际 HTTP $actual)"
        return 1
    fi
}

# 检查响应是否包含字符串
check_contains() {
    local response=$1
    local expected=$2
    local test_name=$3

    if echo "$response" | grep -q "$expected"; then
        log_pass "$test_name"
        return 0
    else
        log_fail "$test_name (响应不包含 '$expected')"
        return 1
    fi
}

# 解析 curl 响应（兼容 macOS 和 Linux）
parse_response() {
    local response="$1"
    # 获取最后一行（状态码）
    echo "$response" | tail -1
}

parse_body() {
    local response="$1"
    # 获取除最后一行外的所有内容
    echo "$response" | sed '$d'
}

# ============================================
# 测试用例
# ============================================

test_root_endpoint() {
    log_info "测试根路径 /"

    local response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/")
    local body=$(parse_body "$response")
    local status=$(parse_response "$response")

    check_status 200 "$status" "GET /" || return 1
    check_contains "$body" "TTS Gateway" "响应包含服务名称"
}

test_health_endpoint() {
    log_info "测试健康检查 /health"

    local response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/health")
    local body=$(parse_body "$response")
    local status=$(parse_response "$response")

    check_status 200 "$status" "GET /health" || return 1
    check_contains "$body" "running" "服务状态为 running"
    check_contains "$body" "backends" "响应包含后端列表"
}

test_models_endpoint() {
    log_info "测试模型列表 /v1/models"

    local response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/v1/models")
    local body=$(parse_body "$response")
    local status=$(parse_response "$response")

    check_status 200 "$status" "GET /v1/models" || return 1
    check_contains "$body" "models" "响应包含 models 字段"
}

test_voices_endpoint() {
    log_info "测试音色列表 /v1/voices"

    local response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/v1/voices")
    local body=$(parse_body "$response")
    local status=$(parse_response "$response")

    check_status 200 "$status" "GET /v1/voices" || return 1
}

test_tts_generation() {
    log_info "测试 TTS 生成 /v1/audio/speech"

    local output_file="$TEST_OUTPUT_DIR/test_output.wav"

    local status=$(curl -s -w "%{http_code}" -o "$output_file" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "auto",
            "input": "你好，这是一个测试。",
            "voice": "alloy"
        }')

    check_status 200 "$status" "POST /v1/audio/speech" || return 1

    # 检查文件是否生成
    if [ -f "$output_file" ] && [ -s "$output_file" ]; then
        local file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
        log_pass "音频文件已生成 (${file_size} bytes)"
    else
        log_fail "音频文件未生成或为空"
        return 1
    fi
}

test_tts_with_qwen() {
    log_info "测试 Qwen3-TTS 模型"

    local output_file="$TEST_OUTPUT_DIR/test_qwen.wav"

    local status=$(curl -s -w "%{http_code}" -o "$output_file" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "qwen3-tts",
            "input": "这是 Qwen3-TTS 模型测试。",
            "voice": "alloy"
        }')

    check_status 200 "$status" "POST /v1/audio/speech (qwen3-tts)" || return 1
}

test_tts_with_indextts() {
    log_info "测试 IndexTTS 模型"

    local output_file="$TEST_OUTPUT_DIR/test_indextts.wav"

    local status=$(curl -s -w "%{http_code}" -o "$output_file" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "indextts-2.0",
            "input": "这是 IndexTTS 模型测试。",
            "voice": "alloy"
        }')

    check_status 200 "$status" "POST /v1/audio/speech (indextts-2.0)" || return 1
}

test_invalid_model() {
    log_info "测试无效模型名称"

    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "invalid-model",
            "input": "测试",
            "voice": "alloy"
        }')

    local status=$(parse_response "$response")

    # 应该返回错误状态码
    if [ "$status" -ge 400 ]; then
        log_pass "无效模型返回错误 (HTTP $status)"
    else
        log_fail "无效模型应该返回错误状态码"
    fi
}

test_empty_input() {
    log_info "测试空输入"

    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "auto",
            "input": "",
            "voice": "alloy"
        }')

    local status=$(parse_response "$response")

    # 应该返回错误状态码
    if [ "$status" -ge 400 ]; then
        log_pass "空输入返回错误 (HTTP $status)"
    else
        log_fail "空输入应该返回错误状态码"
    fi
}

test_long_text() {
    log_info "测试长文本"

    local long_text="这是一段很长的测试文本。"
    # 重复生成较长文本
    for i in {1..10}; do
        long_text="${long_text}这是第${i}句话，用于测试长文本处理能力。"
    done

    local output_file="$TEST_OUTPUT_DIR/test_long.wav"

    local status=$(curl -s -w "%{http_code}" -o "$output_file" \
        -X POST "$API_BASE_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"auto\",
            \"input\": \"$long_text\",
            \"voice\": \"alloy\"
        }")

    check_status 200 "$status" "POST /v1/audio/speech (长文本)" || return 1
}

test_docs_endpoint() {
    log_info "测试 API 文档 /docs"

    local status=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/docs")
    check_status 200 "$status" "GET /docs"
}

test_openapi_endpoint() {
    log_info "测试 OpenAPI Schema /openapi.json"

    local response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/openapi.json")
    local body=$(parse_body "$response")
    local status=$(parse_response "$response")

    check_status 200 "$status" "GET /openapi.json" || return 1
    check_contains "$body" "openapi" "响应包含 OpenAPI 版本"
}

# ============================================
# 主函数
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}              TTS Gateway API 测试                          ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "API 地址: $API_BASE_URL"
    echo "输出目录: $TEST_OUTPUT_DIR"
    echo ""
}

print_summary() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "测试结果汇总"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}通过: $PASSED${NC}"
    echo -e "  ${RED}失败: $FAILED${NC}"
    echo -e "  ${YELLOW}跳过: $SKIPPED${NC}"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ 所有测试通过！${NC}"
        return 0
    else
        echo -e "${RED}✗ 有 $FAILED 个测试失败${NC}"
        return 1
    fi
}

run_all_tests() {
    print_header

    echo -e "${BLUE}[基础端点测试]${NC}"
    echo "────────────────────────────────────────"
    test_root_endpoint
    test_health_endpoint
    test_docs_endpoint
    test_openapi_endpoint
    echo ""

    echo -e "${BLUE}[模型和音色测试]${NC}"
    echo "────────────────────────────────────────"
    test_models_endpoint
    test_voices_endpoint
    echo ""

    echo -e "${BLUE}[TTS 生成测试]${NC}"
    echo "────────────────────────────────────────"
    test_tts_generation
    test_tts_with_qwen
    test_tts_with_indextts
    test_long_text
    echo ""

    echo -e "${BLUE}[错误处理测试]${NC}"
    echo "────────────────────────────────────────"
    test_invalid_model
    test_empty_input
    echo ""

    print_summary
}

# 解析参数
case "${1:-all}" in
    all)
        run_all_tests
        ;;
    health)
        print_header
        test_root_endpoint
        test_health_endpoint
        print_summary
        ;;
    tts)
        print_header
        test_tts_generation
        test_tts_with_qwen
        test_tts_with_indextts
        print_summary
        ;;
    *)
        echo "用法: $0 [all|health|tts]"
        echo ""
        echo "  all    - 运行所有测试 (默认)"
        echo "  health - 只测试健康检查端点"
        echo "  tts    - 只测试 TTS 生成功能"
        exit 1
        ;;
esac
