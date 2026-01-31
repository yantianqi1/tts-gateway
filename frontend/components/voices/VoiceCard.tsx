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
      whileHover={{ scale: 1.02 }}
      className={`cyber-card p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${
                voice.backend === 'qwen3-tts'
                  ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10'
                  : 'bg-gradient-to-br from-neon-magenta/20 to-neon-purple/10'
              }
            `}
          >
            {voice.id === 'default' ? (
              <Mic2
                className={`w-5 h-5 ${
                  voice.backend === 'qwen3-tts' ? 'text-neon-cyan' : 'text-neon-magenta'
                }`}
              />
            ) : (
              <User
                className={`w-5 h-5 ${
                  voice.backend === 'qwen3-tts' ? 'text-neon-cyan' : 'text-neon-magenta'
                }`}
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{voice.name}</h3>
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPlay}
              className={`
                p-2 rounded-lg transition-colors cursor-pointer
                ${
                  isPlaying
                    ? 'text-neon-cyan bg-neon-cyan/20'
                    : 'text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10'
                }
              `}
              title="试听"
            >
              <Play className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && voice.id !== 'default' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
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
          <span className="text-xs text-slate-500">可用情感</span>
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
        <div className="mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-slate-500">参考文本</span>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{voice.ref_text}</p>
        </div>
      )}
    </motion.div>
  );
}
