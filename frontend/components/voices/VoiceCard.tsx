'use client';

import { motion } from 'framer-motion';
import { User, Mic2, Play, Trash2 } from 'lucide-react';
import type { VoiceInfo } from '@/types/api';
import Badge from '@/components/ui/Badge';

interface VoiceCardProps {
  voice: VoiceInfo;
  onPlay?: () => void;
  onDelete?: () => void;
  isPlaying?: boolean;
  className?: string;
}

export default function VoiceCard({
  voice,
  onPlay,
  onDelete,
  isPlaying = false,
  className = '',
}: VoiceCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className={`ios-card p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-ios-md flex items-center justify-center
              ${
                voice.backend === 'qwen3-tts'
                  ? 'bg-ios-purple/15'
                  : 'bg-ios-pink/15'
              }
            `}
          >
            {voice.id === 'default' ? (
              <Mic2
                className={`w-5 h-5 ${
                  voice.backend === 'qwen3-tts' ? 'text-ios-purple' : 'text-ios-pink'
                }`}
              />
            ) : (
              <User
                className={`w-5 h-5 ${
                  voice.backend === 'qwen3-tts' ? 'text-ios-purple' : 'text-ios-pink'
                }`}
              />
            )}
          </div>
          <div>
            <h3 className="text-subheadline font-semibold text-text-primary">{voice.name}</h3>
            <Badge
              variant={voice.backend === 'qwen3-tts' ? 'info' : 'purple'}
              size="sm"
            >
              {voice.backend}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onPlay && voice.has_default && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onPlay}
              className={`
                p-2 rounded-ios-sm transition-colors cursor-pointer
                ${
                  isPlaying
                    ? 'text-ios-blue bg-ios-blue/15'
                    : 'text-text-tertiary hover:text-ios-blue hover:bg-fill-tertiary'
                }
              `}
              title="试听"
            >
              <Play className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && voice.id !== 'default' && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onDelete}
              className="p-2 text-text-tertiary hover:text-ios-red hover:bg-fill-tertiary rounded-ios-sm transition-colors cursor-pointer"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Emotions */}
      {voice.emotions.length > 0 && (
        <div className="space-y-2">
          <span className="text-caption-1 text-text-tertiary">可用情感</span>
          <div className="flex flex-wrap gap-1">
            {voice.emotions.slice(0, 5).map((emotion) => (
              <Badge key={emotion} variant="default" size="sm">
                {emotion}
              </Badge>
            ))}
            {voice.emotions.length > 5 && (
              <Badge variant="default" size="sm">
                +{voice.emotions.length - 5}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Reference text (for Qwen3-TTS) */}
      {voice.ref_text && (
        <div className="mt-3 pt-3 border-t border-separator">
          <span className="text-caption-1 text-text-tertiary">参考文本</span>
          <p className="text-caption-1 text-text-secondary mt-1 line-clamp-2">{voice.ref_text}</p>
        </div>
      )}
    </motion.div>
  );
}
