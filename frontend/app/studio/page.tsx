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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl">
            <Mic2 className="w-6 h-6 text-cyber-bg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">语音工作室</h1>
            <p className="text-sm text-slate-500">创建高质量的 AI 语音</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Creation Settings (3/5) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Text Input */}
          <Card variant="default" padding="lg">
            <TextInput />
          </Card>

          {/* Model Selection */}
          <Card variant="default" padding="lg">
            <ModelSelector />
          </Card>

          {/* Voice Selection */}
          <Card variant="default" padding="lg">
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
              <Card variant={config.model === 'qwen3-tts' ? 'default' : 'magenta'} padding="lg">
                {config.model === 'qwen3-tts' ? (
                  <QwenSettings />
                ) : (
                  <IndexSettings />
                )}
              </Card>
            </motion.div>
          )}

          {/* Speed Control */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-medium text-slate-300">语速控制</span>
            </div>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={config.speed}
              onChange={(e) => setConfig({ speed: parseFloat(e.target.value) })}
              valueFormatter={(v) => `${v.toFixed(1)}x`}
              hint="调整语音播放速度，1.0 为正常速度"
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
          <Card variant="default" padding="lg" className="sticky top-6">
            <AudioResult />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
