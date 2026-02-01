'use client';

import { motion } from 'framer-motion';
import { Mic2, Gauge, Terminal } from 'lucide-react';
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
          <div className="p-2.5 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-md">
            <Mic2 className="w-6 h-6 text-cyber-bg" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold gradient-text tracking-tight">Voice Studio</h1>
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded">
                SYNTH_MODULE
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-mono mt-0.5">
              <Terminal className="w-3 h-3 inline mr-1" />
              High-quality AI voice synthesis
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
              <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-neon-purple to-neon-cyan" />
              <Gauge className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                Speed Control
              </span>
              <span className="text-[9px] font-mono text-zinc-600 ml-auto">
                RATE_MOD
              </span>
            </div>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={config.speed}
              onChange={(e) => setConfig({ speed: parseFloat(e.target.value) })}
              valueFormatter={(v) => `${v.toFixed(1)}x`}
              hint="Adjust playback speed, 1.0 = normal"
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
