'use client';

import { motion } from 'framer-motion';
import { Mic2, Gauge } from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import TextInput from '@/components/studio/TextInput';
import ModelSelector from '@/components/studio/ModelSelector';
import VoiceSelector from '@/components/studio/VoiceSelector';
import QwenSettings from '@/components/studio/QwenSettings';
import IndexSettings from '@/components/studio/IndexSettings';
import GenerateButton from '@/components/studio/GenerateButton';
import AudioResult from '@/components/studio/AudioResult';
import Slider from '@/components/ui/Slider';
import Card from '@/components/ui/Card';

export default function StudioPage() {
  const { config, setConfig } = useTTSStore();

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2.5 bg-gradient-dopamine rounded-glass-sm shadow-dopamine">
            <Mic2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text tracking-tight">语音工作室</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              高质量 AI 语音合成
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left Panel - Creation Settings (3/5) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-5"
        >
          {/* Text Input */}
          <Card variant="glass" padding="lg">
            <TextInput />
          </Card>

          {/* Model Selection */}
          <Card variant="glass" padding="lg">
            <ModelSelector />
          </Card>

          {/* Voice Selection */}
          <Card variant="glass" padding="lg">
            <VoiceSelector />
          </Card>

          {/* Model-specific Settings */}
          {config.model !== 'auto' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant={config.model === 'qwen3-tts' ? 'glass' : 'pink'} padding="lg">
                {config.model === 'qwen3-tts' ? (
                  <QwenSettings />
                ) : (
                  <IndexSettings />
                )}
              </Card>
            </motion.div>
          )}

          {/* Speed Control */}
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-dopamine-purple" />
              <span className="text-sm font-medium text-gray-700">
                语速控制
              </span>
            </div>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={config.speed}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ speed: parseFloat(e.target.value) })}
              valueFormatter={(v: number) => `${v.toFixed(1)}x`}
              hint="调整播放速度，1.0 为正常速度"
            />
          </Card>

          {/* Generate Button */}
          <GenerateButton />
        </motion.div>

        {/* Right Panel - Results (2/5) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" padding="lg" className="sticky top-6">
            <AudioResult />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
