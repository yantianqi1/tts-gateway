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
  { value: 'preset', label: 'Preset', icon: Music, description: 'Emotion presets' },
  { value: 'audio', label: 'Audio Ref', icon: FileAudio, description: 'Reference audio' },
  { value: 'vector', label: 'Vector', icon: Sliders, description: '8D control' },
  { value: 'text', label: 'Analysis', icon: MessageSquare, description: 'Auto detect' },
] as const;

// Knob Component for emotion control
function EmotionKnob({
  value,
  onChange,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: typeof Smile;
  color: string;
}) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const deltaY = centerY - e.clientY;
      const newValue = Math.max(0, Math.min(1.4, value + deltaY * 0.01));
      onChange(Math.round(newValue * 10) / 10);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [value, onChange]);

  const rotation = (value / 1.4) * 270 - 135; // -135 to 135 degrees

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Knob */}
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={`
          relative w-14 h-14 rounded-full cursor-grab active:cursor-grabbing
          bg-cyber-bg-secondary border border-zinc-700/50
          transition-all duration-200
          ${isDragging ? 'scale-105 border-neon-purple/50' : 'hover:border-zinc-600'}
        `}
        style={{
          boxShadow: isDragging
            ? `0 0 20px ${color.replace('from-', '').replace(' to-', ', ').replace(/\w+-\d+/g, 'rgba(124, 58, 237, 0.3)')}`
            : 'inset 0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {/* Knob indicator */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-gradient-to-b from-neon-purple to-neon-cyan"
          />
        </div>

        {/* Glow ring when active */}
        {value > 0.3 && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-sm pointer-events-none"
            style={{
              background: `conic-gradient(from ${rotation - 135}deg, transparent, rgba(124, 58, 237, ${value / 1.4}), transparent)`,
            }}
          />
        )}
      </div>

      {/* Label and value */}
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center mb-0.5">
          <Icon className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-xs font-mono ${value > 0.5 ? 'text-neon-purple' : 'text-zinc-400'}`}>
          {value.toFixed(1)}
        </span>
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
        setUploadError('Only .wav format supported');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File too large (max 10MB)');
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
          setUploadError(result.message || 'Upload failed');
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
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

  // Get ambient glow color based on dominant emotion
  const getAmbientColor = () => {
    const emotions = emotionControl.emoVector;
    const maxEmotion = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b);
    const colorMap: Record<string, string> = {
      happy: 'rgba(16, 185, 129, 0.1)',
      angry: 'rgba(239, 68, 68, 0.1)',
      sad: 'rgba(59, 130, 246, 0.1)',
      fear: 'rgba(245, 158, 11, 0.1)',
      disgust: 'rgba(168, 85, 247, 0.1)',
      surprise: 'rgba(236, 72, 153, 0.1)',
      calm: 'rgba(6, 182, 212, 0.1)',
      low: 'rgba(100, 116, 139, 0.1)',
    };
    return maxEmotion[1] > 0.3 ? colorMap[maxEmotion[0]] || 'transparent' : 'transparent';
  };

  return (
    <div
      className={`cyber-card p-4 relative overflow-hidden ${className}`}
      style={{
        background: emotionControl.mode === 'vector'
          ? `linear-gradient(135deg, ${getAmbientColor()}, transparent)`
          : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon-purple/10">
        <div className="p-1.5 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/10 rounded-md">
          <Sparkles className="w-4 h-4 text-neon-purple" />
        </div>
        <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Emotion Control
        </span>
        <span className="text-[9px] font-mono text-zinc-600 ml-auto">
          MODE: {emotionControl.mode.toUpperCase()}
        </span>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = emotionControl.mode === option.value;

          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeChange(option.value as EmotionMode)}
              className={`
                p-3 rounded-md flex flex-col items-center gap-1 cursor-pointer
                transition-all duration-200 border
                ${
                  isActive
                    ? 'bg-neon-purple/10 text-white border-neon-purple/40'
                    : 'bg-cyber-bg-secondary/30 text-zinc-400 hover:bg-cyber-bg-secondary/50 border-zinc-800/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{option.label}</span>
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
            className="p-4 bg-cyber-bg-secondary/30 rounded-md text-center border border-zinc-800/30"
          >
            <p className="text-sm text-zinc-500 font-mono">
              <span className="text-neon-purple/50">$</span> Using preset emotion tags
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
                    bg-cyber-bg-secondary/30 rounded-md border border-dashed
                    ${isUploading ? 'border-neon-purple/30' : 'border-zinc-700/50 hover:border-neon-purple/30'}
                    cursor-pointer transition-all duration-200
                  `}
                >
                  {isUploading ? (
                    <div className="cyber-spinner w-6 h-6" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-neon-purple mb-2" />
                      <span className="text-sm text-zinc-400">Upload emotion reference</span>
                      <span className="text-[10px] text-zinc-600 mt-1 font-mono">
                        .wav | MAX: 10MB
                      </span>
                    </>
                  )}
                </label>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-cyber-bg-secondary/50 rounded-md border border-zinc-800/50">
                  <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-md">
                    <FileAudio className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate font-mono">
                      {uploadedFileName || 'Uploaded audio'}
                    </p>
                    <p className="text-[10px] text-zinc-500">Emotion reference</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClearUpload}
                    className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                  </motion.button>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-400 mt-2 font-mono">ERROR: {uploadError}</p>
              )}
            </div>

            {/* Alpha slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Intensity (Alpha)</span>
                <span className="text-xs font-mono text-neon-purple">{emotionControl.emoAlpha.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.6}
                step={0.1}
                value={emotionControl.emoAlpha}
                onChange={(e) => setEmotionControl({ emoAlpha: parseFloat(e.target.value) })}
                className="cyber-slider w-full"
              />
              <p className="text-[10px] text-zinc-600 font-mono">0 = Pure timbre, 1.6 = Strong emotion</p>
            </div>
          </motion.div>
        )}

        {/* Vector mode - Knob controls */}
        {emotionControl.mode === 'vector' && (
          <motion.div
            key="vector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isVectorWarning && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-mono">
                  WARN: Vector sum ({vectorSum.toFixed(1)}) exceeds 1.5
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 font-mono">8-DIMENSIONAL CONTROL</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetEmotionVector}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-zinc-400 hover:text-white bg-cyber-bg-secondary/50 hover:bg-cyber-bg-secondary rounded-md transition-colors cursor-pointer border border-zinc-800/50"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </motion.button>
            </div>

            {/* Knob grid */}
            <div className="grid grid-cols-4 gap-4">
              {EMOTION_DIMENSIONS.map((dim) => {
                const Icon = ICON_MAP[dim.key] || Smile;
                const value = emotionControl.emoVector[dim.key as keyof EmotionVector];

                return (
                  <EmotionKnob
                    key={dim.key}
                    value={value}
                    onChange={(v) => handleVectorChange(dim.key as keyof EmotionVector, v)}
                    label={dim.label}
                    icon={Icon}
                    color={dim.color}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="p-4 bg-cyber-bg-secondary/30 rounded-md border border-zinc-800/30">
              <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">
                Emotion Analysis Text (Optional)
              </label>
              <textarea
                value={emotionControl.emoText}
                onChange={(e) => setEmotionControl({ emoText: e.target.value })}
                placeholder="// Leave empty to analyze synthesis text..."
                className="w-full h-24 resize-none bg-cyber-surface/80 border border-zinc-800/50 rounded-md p-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-neon-purple/50 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-zinc-600 mt-2 font-mono">
                <span className="text-neon-purple/50">$</span> Auto emotion detection enabled
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
