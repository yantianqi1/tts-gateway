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
  { value: 'preset', label: '预设', icon: Music },
  { value: 'audio', label: '音频', icon: FileAudio },
  { value: 'vector', label: '向量', icon: Sliders },
  { value: 'text', label: '分析', icon: MessageSquare },
] as const;

// iOS-style Circular Slider Component
function CircularSlider({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: typeof Smile;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const deltaY = centerY - clientY;
    const sensitivity = 0.008;
    const newValue = Math.max(0, Math.min(1.4, value + deltaY * sensitivity));
    onChange(Math.round(newValue * 10) / 10);
  }, [value, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleInteraction]);

  // Calculate the arc for the value display
  const percentage = (value / 1.4) * 100;
  const circumference = 2 * Math.PI * 24; // radius = 24
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      {/* Circular control */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        className={`
          relative w-16 h-16 cursor-grab active:cursor-grabbing
          transition-transform duration-150
          ${isDragging ? 'scale-105' : ''}
        `}
      >
        {/* Background circle */}
        <svg className="w-full h-full -rotate-135" viewBox="0 0 56 56">
          {/* Track */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--gray-5)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          {/* Value arc */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="var(--ios-purple)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
            style={{ opacity: value > 0 ? 1 : 0.3 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            bg-bg-secondary shadow-ios-sm
            ${isDragging ? 'shadow-ios-md' : ''}
          `}>
            <Icon className={`w-4 h-4 ${value > 0.5 ? 'text-ios-purple' : 'text-text-tertiary'}`} />
          </div>
        </div>
      </div>

      {/* Label and value */}
      <div className="text-center mt-2">
        <span className="text-caption-1 text-text-tertiary">{label}</span>
        <p className={`text-caption-1 font-medium ${value > 0.5 ? 'text-ios-purple' : 'text-text-secondary'}`}>
          {value.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

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
        setUploadError('文件过大 (最大 10MB)');
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
    <div className={`ios-card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-ios-purple/12 rounded-ios-sm">
            <Sparkles className="w-4 h-4 text-ios-purple" />
          </div>
          <span className="text-subheadline font-medium text-text-primary">
            情感控制
          </span>
        </div>
        <span className="text-caption-2 text-text-quaternary">
          {MODE_OPTIONS.find(m => m.value === emotionControl.mode)?.label}
        </span>
      </div>

      {/* Mode selector - iOS segmented control style */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-fill-tertiary rounded-ios-sm mb-4">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = emotionControl.mode === option.value;

          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeChange(option.value as EmotionMode)}
              className={`
                py-2 px-2 rounded-md flex flex-col items-center gap-1 cursor-pointer
                transition-all duration-150
                ${isActive
                  ? 'bg-bg-secondary shadow-ios-sm text-ios-purple'
                  : 'text-text-tertiary'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-caption-2 font-medium">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Preset mode */}
        {emotionControl.mode === 'preset' && (
          <motion.div
            key="preset"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-fill-tertiary rounded-ios-sm text-center"
          >
            <p className="text-subheadline text-text-secondary">
              使用预设情感标签
            </p>
          </motion.div>
        )}

        {/* Audio reference mode */}
        {emotionControl.mode === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
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
                    bg-fill-tertiary rounded-ios-md border-2 border-dashed
                    ${isUploading ? 'border-ios-purple/40' : 'border-separator-opaque hover:border-ios-purple/40'}
                    cursor-pointer transition-all duration-150
                  `}
                >
                  {isUploading ? (
                    <div className="ios-spinner" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-ios-purple mb-2" />
                      <span className="text-subheadline text-text-secondary">上传情感参考</span>
                      <span className="text-caption-2 text-text-quaternary mt-1">
                        支持 .wav 格式，最大 10MB
                      </span>
                    </>
                  )}
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-fill-tertiary rounded-ios-md">
                  <div className="p-2 bg-ios-purple rounded-ios-sm">
                    <FileAudio className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-subheadline font-medium text-text-primary truncate">
                      {uploadedFileName || '已上传音频'}
                    </p>
                    <p className="text-caption-2 text-text-tertiary">情感参考</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleClearUpload}
                    className="p-2 hover:bg-ios-red/12 rounded-ios-sm transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-text-tertiary hover:text-ios-red" />
                  </motion.button>
                </div>
              )}

              {uploadError && (
                <p className="text-caption-1 text-ios-red mt-2">{uploadError}</p>
              )}
            </div>

            {/* Alpha slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-subheadline text-text-secondary">强度 (Alpha)</span>
                <span className="text-subheadline font-semibold text-ios-purple">
                  {emotionControl.emoAlpha.toFixed(1)}
                </span>
              </div>
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-1 bg-gray-5 rounded-full" />
                <div
                  className="absolute left-0 h-1 rounded-full bg-ios-purple"
                  style={{ width: `${(emotionControl.emoAlpha / 1.6) * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1.6}
                  step={0.1}
                  value={emotionControl.emoAlpha}
                  onChange={(e) => setEmotionControl({ emoAlpha: parseFloat(e.target.value) })}
                  className="ios-slider relative z-10"
                />
              </div>
              <p className="text-caption-2 text-text-quaternary">
                0 = 纯音色，1.6 = 强烈情感
              </p>
            </div>
          </motion.div>
        )}

        {/* Vector mode - Circular controls */}
        {emotionControl.mode === 'vector' && (
          <motion.div
            key="vector"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {isVectorWarning && (
              <div className="flex items-center gap-2 p-3 bg-ios-orange/12 rounded-ios-sm">
                <AlertTriangle className="w-4 h-4 text-ios-orange" />
                <span className="text-caption-1 text-ios-orange">
                  向量总和 ({vectorSum.toFixed(1)}) 超过 1.5
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-caption-1 text-text-tertiary">8维情感控制</span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetEmotionVector}
                className="flex items-center gap-1.5 px-3 py-1.5 text-caption-1 text-text-tertiary hover:text-ios-blue bg-fill-tertiary hover:bg-fill-secondary rounded-ios-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                重置
              </motion.button>
            </div>

            {/* Circular sliders grid */}
            <div className="grid grid-cols-4 gap-3">
              {EMOTION_DIMENSIONS.map((dim) => {
                const Icon = ICON_MAP[dim.key] || Smile;
                const value = emotionControl.emoVector[dim.key as keyof EmotionVector];

                return (
                  <CircularSlider
                    key={dim.key}
                    value={value}
                    onChange={(v) => handleVectorChange(dim.key as keyof EmotionVector, v)}
                    label={dim.label}
                    icon={Icon}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Text analysis mode */}
        {emotionControl.mode === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-subheadline text-text-secondary mb-2">
                情感分析文本 (可选)
              </label>
              <textarea
                value={emotionControl.emoText}
                onChange={(e) => setEmotionControl({ emoText: e.target.value })}
                placeholder="留空则自动分析合成文本..."
                className="ios-textarea w-full h-24 resize-none"
              />
              <p className="text-caption-2 text-text-quaternary mt-2">
                自动情感检测已启用
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
