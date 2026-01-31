'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Volume2, Clock, Cpu } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/historyStore';
import { useAudioPlayer } from '@/lib/hooks/useTTS';
import Badge from '@/components/ui/Badge';
import AudioPlayer from '@/components/audio/AudioPlayer';

interface AudioResultProps {
  className?: string;
}

export default function AudioResult({ className = '' }: AudioResultProps) {
  const { sessionResults, removeResult } = useHistoryStore();
  const { play, isPlaying } = useAudioPlayer();

  const handleDownload = (audioUrl: string, text: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `tts-${text.slice(0, 20)}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (sessionResults.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-cyber-bg-secondary/50 flex items-center justify-center mb-4">
          <Volume2 className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-slate-500 text-center">
          生成的音频将显示在这里
        </p>
        <p className="text-xs text-slate-600 mt-1">
          输入文本并点击生成按钮
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">生成结果</h3>
        <span className="text-xs text-slate-500">{sessionResults.length} 个</span>
      </div>

      <AnimatePresence mode="popLayout">
        {sessionResults.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="cyber-card p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-white line-clamp-2 flex-1">
                {result.text}
              </p>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(result.audioUrl, result.text)}
                  className="p-2 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors cursor-pointer"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeResult(result.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer
              src={result.audioUrl}
              onPlay={() => play(result.audioUrl)}
              isPlaying={isPlaying}
            />

            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={result.model === 'qwen3-tts' ? 'info' : 'purple'}
                size="sm"
              >
                <Cpu className="w-3 h-3 mr-1" />
                {result.model}
              </Badge>
              <Badge variant="default" size="sm">
                {result.voice}
              </Badge>
              {result.duration && (
                <Badge variant="default" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {result.duration.toFixed(1)}s
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
