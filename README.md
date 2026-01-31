# TTS Gateway

统一管理多个 TTS 后端的网关服务，采用适配器模式和 OpenAI 兼容 API 风格。

## 支持的后端

| 后端 | 端口 | 特性 |
|------|------|------|
| Qwen3-TTS | 8019 | 声音克隆、多语言支持 |
| IndexTTS 2.0 | 8080 | 情感控制、情感向量、参数调节 |

## 快速开始

### 1. 安装依赖

```bash
cd tts-gateway
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. 启动服务

**仅启动 Gateway:**

```bash
./scripts/start_gateway.sh
```

**启动所有服务（后端 + Gateway）:**

```bash
./scripts/start_all.sh
```

**停止所有服务:**

```bash
./scripts/stop_all.sh
```

### 3. 访问服务

- Gateway: http://localhost:8000
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## API 接口

### 语音合成

```bash
# 使用 IndexTTS（默认）
curl -X POST http://localhost:8000/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"你好，世界！","voice":"default"}' \
  --output speech.wav

# 使用 Qwen3-TTS（需要参考音频）
curl -X POST http://localhost:8000/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3-tts","input":"你好","voice":"<ref_audio_id>","language":"Chinese"}' \
  --output speech.wav

# 自动选择模型
curl -X POST http://localhost:8000/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","input":"Hello world","voice":"default"}' \
  --output speech.wav
```

### 音色列表

```bash
# 获取所有音色
curl http://localhost:8000/v1/voices

# 获取指定后端的音色
curl http://localhost:8000/v1/voices?backend=indextts-2.0
curl http://localhost:8000/v1/voices?backend=qwen3-tts
```

### 模型列表

```bash
# 获取所有模型及状态
curl http://localhost:8000/v1/models

# 获取指定模型状态
curl http://localhost:8000/v1/models/indextts-2.0/status
```

### 上传音色

```bash
# 上传到 IndexTTS
curl -X POST http://localhost:8000/v1/voices/upload \
  -F "file=@voice.wav" \
  -F "voice_id=my_voice" \
  -F "emotion=default" \
  -F "backend=indextts-2.0"

# 上传到 Qwen3-TTS
curl -X POST http://localhost:8000/v1/voices/upload \
  -F "file=@voice.wav" \
  -F "voice_id=my_voice" \
  -F "ref_text=这是参考文本" \
  -F "backend=qwen3-tts"
```

## 请求参数

### TTSRequest

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| model | string | "auto" | 模型选择: "qwen3-tts", "indextts-2.0", "auto" |
| input | string | - | 待合成文本（必填） |
| voice | string | "default" | 音色 ID |
| response_format | string | "wav" | 输出格式: "wav", "mp3" |
| speed | float | 1.0 | 语速 (0.5-2.0) |

**Qwen3-TTS 专用:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| language | string | "Chinese" | 语言 |
| ref_audio_id | string | - | 参考音频 ID |

**IndexTTS 专用:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| emotion | string | "default" | 情感标签 |
| temperature | float | 1.0 | 温度 (0.1-2.0) |
| top_p | float | 0.8 | 核采样 (0.0-1.0) |
| top_k | int | 20 | Top-K 采样 (1-100) |
| emotion_mode | string | "preset" | 情感模式: "preset", "audio", "vector", "text" |
| emo_vector | list | - | 8维情感向量 |

## 配置

配置文件: `config/config.yaml`

```yaml
server:
  host: "0.0.0.0"
  port: 8000

backends:
  qwen3_tts:
    enabled: true
    url: "http://localhost:8019"
    timeout: 60.0

  indextts:
    enabled: true
    url: "http://localhost:8080"
    timeout: 120.0

rate_limit:
  enabled: true
  requests_per_minute: 60
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| TTS_GATEWAY_HOST | 监听地址 | 0.0.0.0 |
| TTS_GATEWAY_PORT | 监听端口 | 8000 |
| TTS_GATEWAY_QWEN3_TTS_URL | Qwen3-TTS 地址 | http://localhost:8019 |
| TTS_GATEWAY_INDEXTTS_URL | IndexTTS 地址 | http://localhost:8080 |

## 项目结构

```
tts-gateway/
├── gateway/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── api/v1/              # API 路由
│   │   ├── audio.py         # /v1/audio/speech
│   │   ├── voices.py        # /v1/voices
│   │   └── models.py        # /v1/models
│   ├── schemas/             # Pydantic 模型
│   │   ├── request.py
│   │   └── response.py
│   ├── adapters/            # 后端适配器
│   │   ├── base.py          # 抽象基类
│   │   ├── qwen_adapter.py  # Qwen3-TTS
│   │   ├── indextts_adapter.py  # IndexTTS
│   │   └── factory.py       # 适配器工厂
│   ├── services/            # 业务服务
│   │   ├── tts_service.py
│   │   └── voice_service.py
│   └── middleware/          # 中间件
│       ├── rate_limit.py    # 限流
│       └── logging.py       # 日志
├── config/
│   └── config.yaml
├── scripts/
│   ├── start_gateway.sh
│   ├── start_all.sh
│   └── stop_all.sh
├── requirements.txt
└── README.md
```

## 自动模型选择策略

当 `model="auto"` 时，Gateway 会根据以下规则自动选择后端：

1. 有 `ref_audio_id` → Qwen3-TTS
2. `emotion_mode` 非 "preset" → IndexTTS
3. 语言非中英 → Qwen3-TTS
4. 默认 → IndexTTS
