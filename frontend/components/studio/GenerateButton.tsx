'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
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
        relative w-full py-4 px-8 rounded-glass
        font-semibold text-base
        transition-all duration-300
        overflow-hidden
        ${
          isDisabled
            ? 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
            : 'dopamine-button text-white cursor-pointer'
        }
        ${className}
      `}
    >
      {/* Content */}
      <span className="relative flex items-center justify-center gap-3">
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>开始生成</span>
          </>
        )}
      </span>

      {/* Pulse effect when generating */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
