'use client';

import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useTTS } from '@/lib/hooks/useTTS';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useUIStore } from '@/lib/store/uiStore';

interface GenerateButtonProps {
  className?: string;
}

export default function GenerateButton({ className = '' }: GenerateButtonProps) {
  const { generate } = useTTS();
  const { inputText } = useTTSStore();
  const { isGenerating } = useUIStore();

  const isDisabled = !inputText.trim() || isGenerating;

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      onClick={() => generate()}
      disabled={isDisabled}
      className={`
        relative w-full py-4 px-8 rounded-xl
        font-bold text-lg uppercase tracking-wider
        transition-all duration-300
        overflow-hidden
        ${
          isDisabled
            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            : 'cyber-button cursor-pointer'
        }
        ${className}
      `}
    >
      {/* Animated background gradient */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-3">
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>生成语音</span>
          </>
        )}
      </span>

      {/* Shine effect */}
      {!isDisabled && !isGenerating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      )}

      {/* Pulse effect when generating */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 bg-neon-cyan/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
