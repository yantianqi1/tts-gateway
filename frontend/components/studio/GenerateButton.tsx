'use client';

import { motion } from 'framer-motion';
import { Play, Loader2, Zap } from 'lucide-react';
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
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      whileTap={{ scale: isDisabled ? 1 : 0.99 }}
      onClick={() => generate()}
      disabled={isDisabled}
      className={`
        relative w-full py-4 px-8 rounded-md
        font-bold text-sm uppercase tracking-widest
        transition-all duration-300
        overflow-hidden
        ${
          isDisabled
            ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-700/30'
            : 'bg-gradient-to-r from-neon-purple to-neon-cyan text-cyber-bg cursor-pointer'
        }
        ${className}
      `}
    >
      {/* Animated background gradient */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple"
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
            <span className="font-mono">PROCESSING...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            <span className="font-mono">GENERATE</span>
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
          className="absolute inset-0 bg-neon-purple/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Tech decoration */}
      <div className="absolute top-1 right-2 text-[8px] font-mono opacity-30">
        SYNTH_EXEC
      </div>
    </motion.button>
  );
}
