'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Key, CheckCircle, XCircle } from 'lucide-react';
import { useVerifyPrivateKey } from '@/lib/hooks/useVoices';
import { usePrivateKeyStore } from '@/lib/store/privateKeyStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivateKeyModal({ isOpen, onClose }: PrivateKeyModalProps) {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutate: verifyKey, isPending } = useVerifyPrivateKey();
  const { activeKey, unlockedCount, clearSession } = usePrivateKeyStore();

  const handleUnlock = useCallback(() => {
    if (!inputKey || inputKey.length < 4) {
      setError('请输入至少 4 位密钥');
      return;
    }

    setError(null);
    verifyKey(inputKey, {
      onSuccess: (data) => {
        if (data.valid) {
          setSuccess(true);
          setInputKey('');
          // 延迟关闭，让用户看到成功提示
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1500);
        } else {
          setError('密钥无效或未关联任何私人音色');
        }
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : '验证失败');
      },
    });
  }, [inputKey, verifyKey, onClose]);

  const handleClearSession = useCallback(() => {
    clearSession();
    setInputKey('');
    setError(null);
    setSuccess(false);
  }, [clearSession]);

  const handleClose = useCallback(() => {
    setInputKey('');
    setError(null);
    setSuccess(false);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="访问私人音色库" size="md">
      <div className="space-y-4">
        {/* 当前状态 */}
        {activeKey ? (
          <div className="p-4 bg-ios-green/10 border border-ios-green/20 rounded-ios-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ios-green rounded-ios-sm">
                <Unlock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-subheadline font-medium text-ios-green">已解锁私人音色库</p>
                <p className="text-caption-1 text-text-tertiary">
                  可访问 {unlockedCount} 个私人音色
                </p>
              </div>
              <Button variant="plain" size="sm" onClick={handleClearSession}>
                退出
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-fill-tertiary rounded-ios-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-text-tertiary rounded-ios-sm">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-subheadline font-medium text-text-primary">未解锁</p>
                <p className="text-caption-1 text-text-tertiary">输入密钥以访问私人音色</p>
              </div>
            </div>
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-ios-green/10 border border-ios-green/20 rounded-ios-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-ios-green" />
              <p className="text-subheadline text-ios-green">解锁成功！</p>
            </div>
          </motion.div>
        )}

        {/* 密钥输入 */}
        {!success && (
          <>
            <div className="space-y-2">
              <label className="text-subheadline text-text-primary">私人密钥</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputKey.length >= 4) {
                      handleUnlock();
                    }
                  }}
                  placeholder="输入您的私人密钥"
                  className="ios-input w-full pl-10"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
              <p className="text-caption-1 text-text-tertiary">
                输入密钥后可访问关联的私人音色
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-ios-red/10 border border-ios-red/20 rounded-ios-sm">
                <XCircle className="w-4 h-4 text-ios-red flex-shrink-0" />
                <p className="text-subheadline text-ios-red">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="plain" onClick={handleClose}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleUnlock}
                isLoading={isPending}
                disabled={!inputKey || inputKey.length < 4}
              >
                <Unlock className="w-4 h-4" />
                解锁
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
