'use client';

import { Globe, Music } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import Select from '@/components/ui/Select';
import { LANGUAGE_OPTIONS } from '@/types/models';

interface QwenSettingsProps {
  className?: string;
}

export default function QwenSettings({ className = '' }: QwenSettingsProps) {
  const { config, setConfig } = useTTSStore();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-neon-cyan/10">
        <div className="p-1.5 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/10 rounded-lg">
          <Globe className="w-4 h-4 text-neon-cyan" />
        </div>
        <span className="text-sm font-medium text-slate-300">Qwen3-TTS 设置</span>
      </div>

      <Select
        label="语言"
        value={config.language}
        onChange={(e) => setConfig({ language: e.target.value })}
        options={LANGUAGE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Music className="w-4 h-4 text-slate-400" />
          参考音频
        </label>
        <div className="cyber-input flex items-center justify-center py-6 border-dashed cursor-pointer hover:border-neon-cyan/40 transition-colors">
          <div className="text-center">
            <Music className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <p className="text-xs text-slate-500">
              {config.refAudioId ? config.refAudioId : '选择参考音频进行声音克隆'}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          上传参考音频可进行声音克隆，支持 .wav 格式
        </p>
      </div>
    </div>
  );
}
