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
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-ios-purple/12 rounded-ios-sm">
          <Globe className="w-4 h-4 text-ios-purple" />
        </div>
        <span className="text-subheadline font-medium text-text-primary">
          Qwen3-TTS 设置
        </span>
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
        <label className="text-subheadline text-text-secondary flex items-center gap-2">
          <Music className="w-4 h-4 text-text-tertiary" />
          参考音频
        </label>
        <div className="ios-card p-6 flex items-center justify-center border-2 border-dashed border-separator-opaque cursor-pointer hover:border-ios-purple/40 transition-colors">
          <div className="text-center">
            <Music className="w-6 h-6 mx-auto mb-2 text-text-quaternary" />
            <p className="text-caption-1 text-text-tertiary">
              {config.refAudioId ? config.refAudioId : '选择参考音频进行声音克隆'}
            </p>
          </div>
        </div>
        <p className="text-caption-2 text-text-quaternary">
          上传参考音频可进行声音克隆，支持 .wav 格式
        </p>
      </div>
    </div>
  );
}
