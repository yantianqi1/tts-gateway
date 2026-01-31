'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Server,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useBackendStatuses } from '@/lib/hooks/useModels';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function SettingsPage() {
  const { data: statuses, isLoading, refetch } = useBackendStatuses();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">设置</h1>
            <p className="text-sm text-slate-500">系统配置与后端状态</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-lg font-semibold text-white">后端状态</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                刷新
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-cyber-bg-secondary/50 animate-pulse"
                  />
                ))}
              </div>
            ) : statuses && statuses.length > 0 ? (
              <div className="space-y-4">
                {statuses.map((backend) => (
                  <div
                    key={backend.id}
                    className="p-4 bg-cyber-bg-secondary/50 rounded-xl border border-white/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${
                              backend.id === 'qwen3-tts'
                                ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10'
                                : 'bg-gradient-to-br from-neon-magenta/20 to-neon-purple/10'
                            }
                          `}
                        >
                          <Zap
                            className={`w-5 h-5 ${
                              backend.id === 'qwen3-tts' ? 'text-neon-cyan' : 'text-neon-magenta'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{backend.name}</h3>
                          <p className="text-xs text-slate-500">{backend.url}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(backend.status)} size="sm">
                        {getStatusIcon(backend.status)}
                        <span className="ml-1">{backend.status}</span>
                      </Badge>
                    </div>

                    {/* Features */}
                    {backend.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {backend.features.map((feature) => (
                          <Badge key={feature} variant="default" size="sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Error message */}
                    {backend.error && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400">{backend.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Server className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-500">无法获取后端状态</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-neon-purple" />
              <h2 className="text-lg font-semibold text-white">API 配置</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-cyber-bg-secondary/50 rounded-xl">
                <label className="text-xs text-slate-500 block mb-1">Gateway URL</label>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-neon-cyan font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api
                  </code>
                  <Badge variant="success" size="sm">活跃</Badge>
                </div>
              </div>

              <div className="p-4 bg-cyber-bg-secondary/50 rounded-xl">
                <label className="text-xs text-slate-500 block mb-2">快速链接</label>
                <div className="space-y-2">
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-neon-cyan transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    API 文档
                  </a>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-neon-cyan transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    健康检查
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card variant="default" padding="lg" className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">关于</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <p>
                <span className="text-slate-500">版本：</span>
                <span className="text-white">1.0.0</span>
              </p>
              <p>
                <span className="text-slate-500">支持的后端：</span>
                <span className="text-white">Qwen3-TTS, IndexTTS 2.0</span>
              </p>
              <p>
                <span className="text-slate-500">技术栈：</span>
                <span className="text-white">Next.js 15, React 19, TypeScript</span>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
