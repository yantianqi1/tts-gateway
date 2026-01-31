'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  Angry,
  Frown,
  AlertTriangle,
  ThumbsDown,
  Cloud,
  Sparkles,
  Heart,
  Upload,
  X,
  FileAudio,
  MessageSquare,
  Sliders,
  Music,
  RotateCcw,
} from 'lucide-react';
import { useTTSStore } from '@/lib/store/ttsStore';
import { uploadEmotionAudio } from '@/lib/api/tts';
import type { EmotionVector } from '@/types/models';
import type { EmotionMode } from '@/types/api';
import { EMOTION_DIMENSIONS } from '@/types/models';
import Slider from '@/components/ui/Slider';

const ICON_MAP: Record<string, typeof Smile> = {
  happy: Smile,
  angry: Angry,
  sad: Frown,
  fear: AlertTriangle,
  disgust: ThumbsDown,
  low: Cloud,
  surprise: Sparkles,
  calm: Heart,
};

const MODE_OPTIONS = [
  { value: 'preset', label: '预设', icon: Music, description: '使用预设情感标签' },
  { value: 'audio', label: '参考音频', icon: FileAudio, description: '上传情感参考音频' },
  { value: 'vector', label: '情感向量', icon: Sliders, description: '8维情感向量控制' },
  { value: 'text', label: '文本分析', icon: MessageSquare, description: '自动分析文本情感' },
] as const;

interface EmotionControlProps {
  className?: string;
}

export default function EmotionControl({ className = '' }: EmotionControlProps) {
  const {
    config,
    setEmotionControl,
    setEmotionVector,
    resetEmotionVector,
  } = useTTSStore();
  const { emotionControl } = config;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = useCallback(
    (mode: EmotionMode) => {
      setEmotionControl({ mode });
      setUploadError(null);
    },
    [setEmotionControl]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.wav')) {
        setUploadError('仅支持 .wav 格式');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('文件过大，最大支持 10MB');
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await uploadEmotionAudio(file);
        if (result.success && result.file_path) {
          setEmotionControl({ emoAudioPath: result.file_path });
          setUploadedFileName(file.name);
        } else {
          setUploadError(result.message || '上传失败');
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : '上传失败');
      } finally {
        setIsUploading(false);
      }
    },
    [setEmotionControl]
  );

  const handleClearUpload = useCallback(() => {
    setEmotionControl({ emoAudioPath: null });
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setEmotionControl]);

  const handleVectorChange = useCallback(
    (key: keyof EmotionVector, value: number) => {
      setEmotionVector({ [key]: value });
    },
    [setEmotionVector]
  );

  const vectorSum = Object.values(emotionControl.emoVector).reduce((a, b) => a + b, 0);
  const isVectorWarning = vectorSum > 1.5;

  return (
    <div className={`cyber-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon-purple/10">
        <div className="p-1.5 bg-gradient-to-br from-neon-purple/20 to-neon-magenta/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-neon-purple" />
        </div>
        <span className="text-sm font-medium text-slate-300">情感控制</span>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = emotionControl.mode === option.value;

          return (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeChange(option.value as EmotionMode)}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-br from-neon-purple/30 to-neon-magenta/20 text-white border border-neon-purple/40'
                    : 'bg-cyber-bg-secondary/50 text-slate-400 hover:bg-cyber-bg-secondary border border-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Preset mode */}
        {emotionControl.mode === 'preset' && (
          <motion.div
            key="preset"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-cyber-bg-secondary/30 rounded-xl text-center"
          >
            <p className="text-sm text-slate-500">
              使用上方的情感预设选择器选择情感
            </p>
          </motion.div>
        )}

        {/* Audio reference mode */}
        {emotionControl.mode === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav"
                onChange={handleFileUpload}
                className="hidden"
                id="emotion-audio-upload"
              />

              {!emotionControl.emoAudioPath ? (
                <label
                  htmlFor="emotion-audio-upload"
                  className={`
                    flex flex-col items-center justify-center p-6
                    bg-cyber-bg-secondary/30 rounded-xl border-2 border-dashed
                    ${isUploading ? 'border-neon-purple/30' : 'border-white/10 hover:border-neon-purple/30'}
                    cursor-pointer transition-all duration-200
                  `}
                >
                  {isUploading ? (
                    <div className="cyber-spinner w-6 h-6" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-neon-purple mb-2" />
                      <span className="text-sm text-slate-400">点击上传情感参考音频</span>
                      <span className="text-xs text-slate-500 mt-1">支持 .wav 格式，最大 10MB</span>
                    </>
                  )}
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-cyber-bg-secondary/50 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-magenta rounded-lg">
                    <FileAudio className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {uploadedFileName || '已上传音频'}
                    </p>
                    <p className="text-xs text-slate-500">情感参考音频</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClearUpload}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </motion.button>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}
            </div>

            <Slider
              label="情感强度 (Alpha)"
              min={0}
              max={1.6}
              step={0.1}
              value={emotionControl.emoAlpha}
              onChange={(e) => setEmotionControl({ emoAlpha: parseFloat(e.target.value) })}
              valueFormatter={(v) => v.toFixed(1)}
              hint="0 = 纯音色，1.6 = 强情感"
            />
          </motion.div>
        )}

        {/* Vector mode */}
        {emotionControl.mode === 'vector' && (
          <motion.div
            key="vector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isVectorWarning && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">
                  向量总和 ({vectorSum.toFixed(1)}) 超过 1.5，可能影响生成效果
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetEmotionVector}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-cyber-bg-secondary/50 hover:bg-cyber-bg-secondary rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                重置
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMOTION_DIMENSIONS.map((dim) => {
                const Icon = ICON_MAP[dim.key] || Smile;
                const value = emotionControl.emoVector[dim.key as keyof EmotionVector];

                return (
                  <div key={dim.key} className="p-3 bg-cyber-bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 bg-gradient-to-br ${dim.color} rounded-lg`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">{dim.label}</span>
                      <span className={`ml-auto text-xs font-semibold bg-gradient-to-r ${dim.color} bg-clip-text text-transparent`}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1.4}
                      step={0.1}
                      value={value}
                      onChange={(e) => handleVectorChange(dim.key as keyof EmotionVector, parseFloat(e.target.value))}
                      className="cyber-slider w-full"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Text analysis mode */}
        {emotionControl.mode === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="p-4 bg-cyber-bg-secondary/30 rounded-xl">
              <label className="block text-sm text-slate-400 mb-2">
                情感分析文本 (可选)
              </label>
              <textarea
                value={emotionControl.emoText}
                onChange={(e) => setEmotionControl({ emoText: e.target.value })}
                placeholder="留空则使用待合成的文本进行情感分析..."
                className="cyber-textarea w-full h-24 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                系统将自动分析文本情感，生成对应的情感语音
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
