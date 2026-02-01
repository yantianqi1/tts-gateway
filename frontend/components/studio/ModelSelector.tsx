'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useBackendStatuses } from '@/lib/hooks/useModels';
import type { ModelType } from '@/types/api';

interface ModelSelectorProps {
  className?: string;
}

const models: { id: ModelType; name: string; icon: typeof Sparkles; description: string; color: string }[] = [
  {
    id: 'qwen3-tts',
    name: 'Qwen3-TTS',
    icon: Sparkles,
    description: '多语言语音克隆',
    color: 'purple',
  },
  {
    id: 'indextts-2.0',
    name: 'IndexTTS 2.0',
    icon: Cpu,
    description: '情感控制高保真',
    color: 'pink',
  },
  {
    id: 'auto',
    name: '自动选择',
    icon: Zap,
    description: '智能路由',
    color: 'blue',
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

  const handleModelChange = (modelId: ModelType) => {
    if (modelId !== config.model) {
      setModel(modelId);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      purple: {
        bg: isSelected ? 'bg-ios-purple/12' : 'bg-fill-tertiary',
        border: isSelected ? 'border-ios-purple/30' : 'border-transparent',
        icon: 'bg-ios-purple',
      },
      pink: {
        bg: isSelected ? 'bg-ios-pink/12' : 'bg-fill-tertiary',
        border: isSelected ? 'border-ios-pink/30' : 'border-transparent',
        icon: 'bg-ios-pink',
      },
      blue: {
        bg: isSelected ? 'bg-ios-blue/12' : 'bg-fill-tertiary',
        border: isSelected ? 'border-ios-blue/30' : 'border-transparent',
        icon: 'bg-ios-blue',
      },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-headline text-text-primary">
          选择模型
        </label>
        <span className="text-caption-1 text-text-tertiary">
          当前：{models.find(m => m.id === config.model)?.name}
        </span>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = config.model === model.id;
          const status = getBackendStatus(model.id);
          const Icon = model.icon;
          const colorClasses = getColorClasses(model.color, isSelected);

          return (
            <motion.button
              key={model.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModelChange(model.id)}
              className={`
                relative p-4 rounded-ios-md border transition-all duration-150 cursor-pointer
                ${colorClasses.bg} ${colorClasses.border}
                hover:shadow-ios-sm
              `}
            >
              {/* Status indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === 'online'
                      ? 'bg-ios-green'
                      : status === 'offline'
                        ? 'bg-ios-red'
                        : 'bg-ios-orange'
                  }`}
                />
              </div>

              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-ios-sm flex items-center justify-center mb-3 mx-auto
                  ${isSelected ? colorClasses.icon : 'bg-fill-secondary'}
                  transition-all duration-150
                `}
              >
                <Icon
                  className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-text-tertiary'}`}
                />
              </div>

              {/* Model name */}
              <h3
                className={`text-subheadline font-semibold text-center ${
                  isSelected ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {model.name}
              </h3>

              {/* Description */}
              <p className="text-caption-2 text-text-tertiary text-center mt-1">
                {model.description}
              </p>

              {/* Selection indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-ios-blue"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
