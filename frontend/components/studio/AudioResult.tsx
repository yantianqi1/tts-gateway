'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Volume2, Clock, Cpu, Waveform } from 'lucide-react';
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
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="w-16 h-16 rounded-md bg-zinc-800/30 flex items-center justify-center mb-4 border border-zinc-800/50">
          <Volume2 className="w-8 h-8 text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-center font-mono text-sm">
          OUTPUT_QUEUE: EMPTY
        </p>
        <p className="text-[10px] text-zinc-700 mt-2 font-mono">
          Awaiting synthesis command...
        </p>

        {/* Decorative waveform */}
        <div className="mt-6 w-full max-w-xs h-8 flex items-center justify-center gap-0.5 opacity-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-neon-purple to-neon-cyan rounded-sm"
              style={{ height: `${Math.random() * 20 + 4}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-neon-purple to-neon-cyan" />
          <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">Output</h3>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">
          RESULTS: {sessionResults.length}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {sessionResults.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="p-4 bg-cyber-bg-secondary/50 rounded-md border border-zinc-800/50 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-white line-clamp-2 flex-1 font-mono">
                "{result.text}"
              </p>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(result.audioUrl, result.text)}
                  className="p-2 text-zinc-500 hover:text-neon-purple hover:bg-neon-purple/10 rounded-md transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeResult(result.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer"
                  title="Delete"
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
              {'emotion' in result && result.emotion && (
                <Badge variant="purple" size="sm">
                  {result.emotion}
                </Badge>
              )}
            </div>

            {/* Tech footer */}
            <div className="pt-2 border-t border-zinc-800/30 flex items-center justify-between text-[9px] text-zinc-600 font-mono">
              <span>ID: {result.id.slice(0, 8)}</span>
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
