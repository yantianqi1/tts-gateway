# TTS Gateway 前后端分离部署指南

本文档介绍如何将 TTS Gateway 部署在前后端分离的架构中：
- **前端 (Next.js)**: 部署在 CPU 服务器
- **后端 (Gateway + TTS 模型)**: 部署在 GPU 服务器

## 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CPU 服务器                                   │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Next.js 前端 (端口 3000)                       │     │
│  │                                                            │     │
│  │  NEXT_PUBLIC_API_URL=http://gpu-server:8080                │     │
│  │  (直接调用远程 Gateway API)                                  │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP 请求
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GPU 服务器                                   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │         Nginx (端口 8080) - 反向代理                        │     │
│  │                                                            │     │
│  │  location /  →  Gateway (localhost:8000)                   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                          │                                          │
│                          ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  TTS Gateway (localhost:8000)                │   │
│  └──────────────────┬─────────────────────┬─────────────────────┘   │
│                     │                     │                         │
│                     ▼                     ▼                         │
│           ┌────────────────┐    ┌────────────────┐                  │
│           │   Qwen3-TTS    │    │    IndexTTS    │                  │
│           │   :8019        │    │    :8081       │                  │
│           └────────────────┘    └────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## GPU 服务器部署

### 1. 启动 TTS 后端服务

```bash
# 启动 Qwen3-TTS (端口 8019)
cd /path/to/qwen3-tts
python app.py --host 127.0.0.1 --port 8019

# 启动 IndexTTS (端口 8081)
cd /path/to/index-tts
python app.py --host 127.0.0.1 --port 8081
```

### 2. 配置 Gateway

创建或修改 `config/config.yaml`:

```yaml
server:
  host: "127.0.0.1"    # 只监听本地，通过 Nginx 对外
  port: 8000

backends:
  qwen3_tts:
    enabled: true
    url: "http://127.0.0.1:8019"
    timeout: 60.0

  indextts:
    enabled: true
    url: "http://127.0.0.1:8081"
    timeout: 120.0
```

### 3. 启动 Gateway

```bash
cd /path/to/tts-gateway
python -m uvicorn gateway.main:app --host 127.0.0.1 --port 8000
```

### 4. 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp deploy/nginx/tts-gateway.conf /etc/nginx/sites-available/

# 创建符号链接
sudo ln -s /etc/nginx/sites-available/tts-gateway.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 5. 验证 GPU 服务

```bash
# 测试健康检查
curl http://localhost:8080/health

# 测试模型列表
curl http://localhost:8080/v1/models

# 测试 TTS 生成
curl -X POST http://localhost:8080/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3-tts", "input": "你好世界", "voice": "alloy"}' \
  --output test.mp3
```

## CPU 服务器部署

### 1. 配置环境变量

```bash
cd /path/to/tts-gateway/frontend

# 创建生产环境配置
echo "NEXT_PUBLIC_API_URL=http://your-gpu-server:8080" > .env.production
```

### 2. 构建并启动前端

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 启动服务
npm start
```

或使用 PM2 进行进程管理:

```bash
npm install -g pm2
pm2 start npm --name "tts-frontend" -- start
pm2 save
```

### 3. 验证前端

1. 访问 `http://cpu-server:3000`
2. 打开浏览器开发者工具 (F12)
3. 切换到 Network 标签
4. 进行 TTS 操作，确认请求发往 GPU 服务器

## 替代方案：Gateway 直接监听 8080

如果不想使用 Nginx，可以让 Gateway 直接监听 8080 端口：

```yaml
# config/config.yaml
server:
  host: "0.0.0.0"   # 监听所有接口
  port: 8080        # 直接使用 8080

backends:
  # ... 同上
```

启动命令：

```bash
python -m uvicorn gateway.main:app --host 0.0.0.0 --port 8080
```

## 注意事项

### CORS 配置

Gateway 已配置 `allow_origins=["*"]`，支持跨域请求。如需限制来源：

```python
# gateway/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://your-frontend-domain.com"],
    # ...
)
```

### 超时设置

TTS 生成可能需要较长时间，确保各层超时配置一致：

| 组件 | 配置位置 | 建议值 |
|------|----------|--------|
| Nginx | `proxy_read_timeout` | 120s |
| Gateway | `backend.timeout` | 60-120s |
| 前端 | `fetch timeout` | 120s |

### 文件大小限制

音色上传需要较大的文件限制：

- Nginx: `client_max_body_size 50M`
- Gateway: 已在代码中配置

### 生产环境建议

1. **HTTPS**: 配置 SSL 证书保护传输安全
2. **认证**: 添加 API 密钥认证
3. **日志**: 配置日志轮转和监控
4. **备份**: 定期备份音色数据

## 故障排查

### 问题：前端无法连接后端

1. 检查 GPU 服务器防火墙是否开放 8080 端口
2. 验证 `NEXT_PUBLIC_API_URL` 配置正确
3. 检查 Nginx 是否正常运行: `systemctl status nginx`

### 问题：TTS 请求超时

1. 检查 Nginx 超时配置
2. 检查 Gateway 后端超时配置
3. 确认 TTS 模型服务正常运行

### 问题：CORS 错误

1. 检查浏览器控制台具体错误信息
2. 确认 Gateway CORS 配置正确
3. 检查请求头是否包含必要的 CORS 头

## 文件清单

```
deploy/
├── nginx/
│   └── tts-gateway.conf    # Nginx 反向代理配置
├── .env.example            # 环境变量模板
└── README.md               # 本文档
```
