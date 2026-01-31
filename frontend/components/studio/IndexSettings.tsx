'use client';

import { Sparkles } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import Select from '@/components/ui/Select';
import EmotionControl from './EmotionControl';
import SamplingParams from './SamplingParams';
import { EMOTION_PRESETS } from '@/types/models';

interface IndexSettingsProps {
  className?: string;
}

export default function IndexSettings({ className = '' }: IndexSettingsProps) {
  const { config, setConfig } = useTTSStore();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-neon-magenta/10">
        <div className="p-1.5 bg-gradient-to-br from-neon-magenta/20 to-neon-purple/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-neon-magenta" />
        </div>
        <span className="text-sm font-medium text-slate-300">IndexTTS 2.0 设置</span>
      </div>

      <Select
        label="情感预设"
        value={config.emotion}
        onChange={(e) => setConfig({ emotion: e.target.value })}
        options={EMOTION_PRESETS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
      />

      <EmotionControl />

      <SamplingParams />
    </div>
  );
}
