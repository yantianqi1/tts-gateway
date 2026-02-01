'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Mic2 } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useVoices } from '@/lib/hooks/useVoices';
import Badge from '@/components/ui/Badge';

interface VoiceSelectorProps {
  className?: string;
}

export default function VoiceSelector({ className = '' }: VoiceSelectorProps) {
  const { config, setConfig } = useTTSStore();
  const { data: voices, isLoading } = useVoices();

  // Filter voices based on selected model
  const filteredVoices = useMemo(() => {
    if (!voices) return [];
    if (config.model === 'auto') return voices;

    const backend = config.model === 'qwen3-tts' ? 'qwen3-tts' : 'indextts';
    return voices.filter((v) => v.backend === backend);
  }, [voices, config.model]);

  // Group voices by backend
  const groupedVoices = useMemo(() => {
    const groups: Record<string, typeof filteredVoices> = {};
    filteredVoices.forEach((voice) => {
      if (!groups[voice.backend]) {
        groups[voice.backend] = [];
      }
      groups[voice.backend].push(voice);
    });
    return groups;
  }, [filteredVoices]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <label className="text-headline text-text-primary">选择音色</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-ios-md bg-fill-tertiary animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-headline text-text-primary">选择音色</label>
        <span className="text-caption-1 text-text-tertiary">
          {filteredVoices.length} 个可用
        </span>
      </div>

      {Object.entries(groupedVoices).map(([backend, backendVoices]) => (
        <div key={backend} className="space-y-2">
          {config.model === 'auto' && (
            <div className="flex items-center gap-2">
              <Badge variant={backend === 'qwen3-tts' ? 'info' : 'purple'} size="sm">
                {backend}
              </Badge>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {backendVoices.map((voice) => {
              const isSelected = config.voice === voice.id;

              return (
                <motion.button
                  key={voice.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfig({ voice: voice.id })}
                  className={`
                    relative p-3 rounded-ios-md border transition-all duration-150 cursor-pointer text-left
                    ${
                      isSelected
                        ? 'bg-ios-blue/10 border-ios-blue/30'
                        : 'bg-fill-tertiary border-transparent hover:bg-fill-secondary'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        w-8 h-8 rounded-ios-sm flex items-center justify-center
                        ${isSelected ? 'bg-ios-blue' : 'bg-fill-secondary'}
                      `}
                    >
                      {voice.id === 'default' ? (
                        <Mic2
                          className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-text-tertiary'}`}
                        />
                      ) : (
                        <User
                          className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-text-tertiary'}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-subheadline font-medium truncate ${
                          isSelected ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {voice.name}
                      </p>
                      {voice.emotions.length > 0 && (
                        <p className="text-caption-2 text-text-quaternary truncate">
                          {voice.emotions.slice(0, 3).join(' · ')}
                          {voice.emotions.length > 3 && ` +${voice.emotions.length - 3}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="voiceSelector"
                      className="absolute inset-0 rounded-ios-md border-2 border-ios-blue"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {filteredVoices.length === 0 && (
        <div className="ios-empty-state py-8">
          <User className="ios-empty-icon" />
          <p className="ios-empty-description">暂无可用音色</p>
        </div>
      )}
    </div>
  );
}
