'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, ChevronDown } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import Slider from '@/components/ui/Slider';

interface SamplingParamsProps {
  className?: string;
}

export default function SamplingParams({ className = '' }: SamplingParamsProps) {
  const { config, setConfig } = useTTSStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`ios-card overflow-hidden ${className}`}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-fill-tertiary transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-ios-blue/12 rounded-ios-sm">
            <Settings2 className="w-4 h-4 text-ios-blue" />
          </div>
          <span className="text-subheadline font-medium text-text-primary">采样参数</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-text-tertiary" />
        </motion.div>
      </motion.button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 space-y-4">
          <Slider
            label="温度 (Temperature)"
            min={0.1}
            max={2.0}
            step={0.1}
            value={config.temperature}
            onChange={(e) => setConfig({ temperature: parseFloat(e.target.value) })}
            valueFormatter={(v) => v.toFixed(1)}
            hint="控制生成的随机性，值越高越随机"
          />

          <Slider
            label="Top-P"
            min={0}
            max={1}
            step={0.05}
            value={config.topP}
            onChange={(e) => setConfig({ topP: parseFloat(e.target.value) })}
            valueFormatter={(v) => v.toFixed(2)}
            hint="核采样参数，控制累积概率阈值"
          />

          <Slider
            label="Top-K"
            min={1}
            max={100}
            step={1}
            value={config.topK}
            onChange={(e) => setConfig({ topK: parseInt(e.target.value) })}
            hint="限制每步采样的候选数量"
          />

          <Slider
            label="重复惩罚"
            min={0.1}
            max={2.0}
            step={0.1}
            value={config.repetitionPenalty}
            onChange={(e) => setConfig({ repetitionPenalty: parseFloat(e.target.value) })}
            valueFormatter={(v) => v.toFixed(1)}
            hint="防止重复生成相同的内容"
          />
        </div>
      </motion.div>
    </div>
  );
}
