'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Volume2, Clock, Cpu } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/historyStore';
import type { AudioResult as AudioResultType } from '@/types/models';
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
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="w-16 h-16 rounded-glass-sm bg-gradient-dopamine/20 flex items-center justify-center mb-4">
          <Volume2 className="w-8 h-8 text-dopamine-purple/50" />
        </div>
        <p className="text-gray-500 text-center text-sm font-medium">
          暂无输出
        </p>
        <p className="text-xs text-gray-400 mt-2">
          生成的语音将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">输出结果</h3>
        <span className="text-xs text-gray-400">
          {sessionResults.length} 条记录
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {sessionResults.map((result: AudioResultType) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="p-4 glass-card rounded-glass-sm space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-700 line-clamp-2 flex-1">
                "{result.text}"
              </p>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(result.audioUrl, result.text)}
                  className="p-2 text-gray-400 hover:text-dopamine-purple hover:bg-dopamine-purple/10 rounded-lg transition-colors cursor-pointer"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeResult(result.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                variant={result.model === 'qwen3-tts' ? 'purple' : 'pink'}
                size="sm"
              >
                <Cpu className="w-3 h-3 mr-1" />
                {result.model}
              </Badge>
              <Badge variant="default" size="sm">
                {result.voice}
              </Badge>
              {result.duration && (
                <Badge variant="blue" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {result.duration.toFixed(1)}秒
                </Badge>
              )}
              {'emotion' in result && result.emotion && (
                <Badge variant="mint" size="sm">
                  {result.emotion}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span>ID: {result.id.slice(0, 8)}</span>
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
