'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useBackendStatuses } from '@/lib/hooks/useModels';
import type { ModelType } from '@/types/api';

interface ModelSelectorProps {
  className?: string;
}

const models: { id: ModelType; name: string; icon: typeof Sparkles; description: string; techSpec: string }[] = [
  {
    id: 'qwen3-tts',
    name: 'Qwen3-TTS',
    icon: Sparkles,
    description: 'Multilingual Voice Clone',
    techSpec: 'V3.0 | 24kHz',
  },
  {
    id: 'indextts-2.0',
    name: 'IndexTTS 2.0',
    icon: Cpu,
    description: 'Emotion Control HQ',
    techSpec: 'V2.0 | 24kHz',
  },
  {
    id: 'auto',
    name: 'Auto Select',
    icon: Zap,
    description: 'Smart Routing',
    techSpec: 'ADAPTIVE',
  },
];

// Animated waveform background component
function WaveformBg({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg
        className="absolute bottom-0 left-0 right-0 h-8"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path
          d={`M0 10 ${Array.from({ length: 25 }, (_, i) => {
            const x = i * 4;
            const y = isActive ? 10 + Math.sin(i * 0.8) * (4 + Math.random() * 3) : 10;
            return `Q${x + 2} ${y} ${x + 4} 10`;
          }).join(' ')}`}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="0.5"
          className={isActive ? 'animate-pulse' : ''}
        />
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function ModelSelector({ className = '' }: ModelSelectorProps) {
  const { config, setModel } = useTTSStore();
  const { data: statuses } = useBackendStatuses();
  const [showMatrix, setShowMatrix] = useState(false);

  const getBackendStatus = (modelId: ModelType) => {
    if (modelId === 'auto') return 'online';
    const backendId = modelId === 'qwen3-tts' ? 'qwen3-tts' : 'indextts';
    const backend = statuses?.find((s) => s.id === backendId);
    return backend?.status || 'unknown';
  };

  const handleModelChange = (modelId: ModelType) => {
    if (modelId !== config.model) {
      setShowMatrix(true);
      setTimeout(() => setShowMatrix(false), 150);
      setModel(modelId);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Data Matrix Flash Effect */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="data-matrix"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-neon-purple to-neon-cyan" />
        <label className="text-sm font-medium text-zinc-300 tracking-wide uppercase">
          Model Selection
        </label>
        <span className="text-[10px] font-mono text-zinc-600 ml-auto">
          ACTIVE: {config.model.toUpperCase()}
        </span>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = config.model === model.id;
          const status = getBackendStatus(model.id);
          const Icon = model.icon;

          return (
            <motion.button
              key={model.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModelChange(model.id)}
              className={`
                relative p-4 rounded-md border transition-all duration-300 cursor-pointer overflow-hidden
                ${
                  isSelected
                    ? 'bg-cyber-bg-secondary/80 border-neon-purple/50'
                    : 'bg-cyber-bg-secondary/30 border-zinc-800/50 hover:border-zinc-700/50'
                }
              `}
            >
              {/* Waveform background decoration */}
              <WaveformBg isActive={isSelected} />

              {/* Scan line effect when selected */}
              {isSelected && <div className="card-scan-line" />}

              {/* Light flow border effect */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-md pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'light-flow 2s linear infinite',
                  }}
                />
              )}

              {/* Status indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'online'
                      ? 'bg-neon-green shadow-[0_0_6px_#10b981]'
                      : status === 'offline'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                  }`}
                />
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  {status === 'online' ? 'RDY' : status === 'offline' ? 'OFF' : 'UNK'}
                </span>
              </div>

              {/* Icon with glow effect */}
              <div
                className={`
                  w-10 h-10 rounded-md flex items-center justify-center mb-3 mx-auto relative
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-neon-purple to-neon-cyan'
                      : 'bg-zinc-800/50'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? 'text-cyber-bg' : 'text-zinc-400'}`}
                />
                {isSelected && (
                  <div className="absolute inset-0 rounded-md bg-gradient-to-br from-neon-purple to-neon-cyan blur-lg opacity-40" />
                )}
              </div>

              {/* Model name */}
              <h3
                className={`text-sm font-semibold text-center tracking-wide ${
                  isSelected ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {model.name}
              </h3>

              {/* Description */}
              <p className="text-[10px] text-zinc-500 text-center mt-1">
                {model.description}
              </p>

              {/* Tech spec */}
              <div className="mt-2 text-center">
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                  isSelected
                    ? 'bg-neon-purple/20 text-neon-purple'
                    : 'bg-zinc-800/50 text-zinc-600'
                }`}>
                  {model.techSpec}
                </span>
              </div>

              {/* Selection indicator bar */}
              {isSelected && (
                <motion.div
                  layoutId="modelIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-purple to-transparent"
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
