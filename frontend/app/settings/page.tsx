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
        return <CheckCircle className="w-4 h-4 text-ios-green" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-ios-red" />;
      default:
        return <AlertCircle className="w-4 h-4 text-ios-orange" />;
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
          <div className="p-2.5 bg-ios-gray-1 rounded-ios-sm shadow-ios-md">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-title-2">设置</h1>
            <p className="text-footnote text-text-secondary">系统配置与后端状态</p>
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
                <Server className="w-5 h-5 text-ios-blue" />
                <h2 className="text-headline text-text-primary">后端状态</h2>
              </div>
              <Button
                variant="tinted"
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
                    className="h-24 rounded-ios-sm bg-fill-tertiary animate-pulse"
                  />
                ))}
              </div>
            ) : statuses && statuses.length > 0 ? (
              <div className="space-y-4">
                {statuses.map((backend) => (
                  <div
                    key={backend.id}
                    className="p-4 ios-card rounded-ios-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-ios-sm flex items-center justify-center
                            ${
                              backend.id === 'qwen3-tts'
                                ? 'bg-ios-purple/15'
                                : 'bg-ios-pink/15'
                            }
                          `}
                        >
                          <Zap
                            className={`w-5 h-5 ${
                              backend.id === 'qwen3-tts' ? 'text-ios-purple' : 'text-ios-pink'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-subheadline font-semibold text-text-primary">{backend.name}</h3>
                          <p className="text-caption-1 text-text-quaternary">{backend.url}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(backend.status)} size="sm">
                        {getStatusIcon(backend.status)}
                        <span className="ml-1">{backend.status === 'online' ? '在线' : backend.status === 'offline' ? '离线' : '未知'}</span>
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
                      <div className="mt-3 p-2 bg-ios-red/10 border border-ios-red/20 rounded-ios-sm">
                        <p className="text-caption-1 text-ios-red">{backend.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ios-empty-state py-8">
                <Server className="ios-empty-icon" />
                <p className="ios-empty-description">无法获取后端状态</p>
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
              <Zap className="w-5 h-5 text-ios-blue" />
              <h2 className="text-headline text-text-primary">API 配置</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 ios-card rounded-ios-sm">
                <label className="text-caption-1 text-text-tertiary block mb-1">Gateway URL</label>
                <div className="flex items-center justify-between">
                  <code className="text-subheadline text-ios-blue font-mono">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api
                  </code>
                  <Badge variant="success" size="sm">活跃</Badge>
                </div>
              </div>

              <div className="p-4 ios-card rounded-ios-sm">
                <label className="text-caption-1 text-text-tertiary block mb-2">快速链接</label>
                <div className="space-y-2">
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-subheadline text-text-secondary hover:text-ios-blue transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    API 文档
                  </a>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-subheadline text-text-secondary hover:text-ios-blue transition-colors"
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
            <h2 className="text-headline text-text-primary mb-4">关于</h2>
            <div className="space-y-3 text-subheadline">
              <p>
                <span className="text-text-tertiary">版本：</span>
                <span className="text-text-primary">1.0.0</span>
              </p>
              <p>
                <span className="text-text-tertiary">支持的后端：</span>
                <span className="text-text-primary">Qwen3-TTS, IndexTTS 2.0</span>
              </p>
              <p>
                <span className="text-text-tertiary">技术栈：</span>
                <span className="text-text-primary">Next.js 15, React 19, TypeScript</span>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
