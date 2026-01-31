'use client';

import { motion } from 'framer-motion';
import { Sparkles, Cpu, Zap } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useBackendStatuses } from '@/lib/hooks/useModels';
import type { ModelType } from '@/types/api';

interface ModelSelectorProps {
  className?: string;
}

const models: { id: ModelType; name: string; icon: typeof Sparkles; description: string }[] = [
  {
    id: 'qwen3-tts',
    name: 'Qwen3-TTS',
    icon: Sparkles,
    description: '多语言 · 声音克隆',
  },
  {
    id: 'indextts-2.0',
    name: 'IndexTTS 2.0',
    icon: Cpu,
    description: '情感控制 · 高质量',
  },
  {
    id: 'auto',
    name: 'Auto',
    icon: Zap,
    description: '智能选择',
  },
];

export default function ModelSelector({ className = '' }: ModelSelectorProps) {
  const { config, setModel } = useTTSStore();
  const { data: statuses } = useBackendStatuses();

  const getBackendStatus = (modelId: ModelType) => {
    if (modelId === 'auto') return 'online';
    const backendId = modelId === 'qwen3-tts' ? 'qwen3-tts' : 'indextts';
    const backend = statuses?.find((s) => s.id === backendId);
    return backend?.status || 'unknown';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-slate-300">选择模型</label>
      <div className="grid grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = config.model === model.id;
          const status = getBackendStatus(model.id);
          const Icon = model.icon;

          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModel(model.id)}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/10 border-neon-cyan/50'
                    : 'bg-cyber-bg-secondary/50 border-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Status indicator */}
              <div
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  status === 'online'
                    ? 'bg-neon-green shadow-[0_0_6px_#10b981]'
                    : status === 'offline'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              />

              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-purple'
                      : 'bg-white/5'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? 'text-cyber-bg' : 'text-slate-400'}`}
                />
              </div>

              {/* Name */}
              <h3
                className={`text-sm font-semibold text-center ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {model.name}
              </h3>

              {/* Description */}
              <p className="text-[10px] text-slate-500 text-center mt-1">
                {model.description}
              </p>

              {/* Selection glow */}
              {isSelected && (
                <motion.div
                  layoutId="modelSelector"
                  className="absolute inset-0 rounded-xl border-2 border-neon-cyan/50"
                  style={{ boxShadow: '0 0 20px rgba(0, 255, 245, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
