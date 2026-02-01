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
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      onClick={() => generate()}
      disabled={isDisabled}
      className={`
        relative w-full py-4 px-8 rounded-ios-md
        font-semibold text-[17px]
        transition-all duration-150
        overflow-hidden
        ${
          isDisabled
            ? 'bg-fill-secondary text-text-placeholder cursor-not-allowed'
            : 'ios-button-primary cursor-pointer'
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
