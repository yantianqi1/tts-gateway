// Data Models for Frontend State

import type { EmotionMode, ModelType, ResponseFormat } from './api';

// 8-dimensional emotion vector
export interface EmotionVector {
  happy: number;    // 喜
  angry: number;    // 怒
  sad: number;      // 哀
  fear: number;     // 惧
  disgust: number;  // 厌恶
  low: number;      // 低落
  surprise: number; // 惊喜
  calm: number;     // 平静
}

// Emotion control configuration
export interface EmotionControl {
  mode: EmotionMode;
  emoAudioPath: string | null;
  emoAlpha: number;
  emoVector: EmotionVector;
  emoText: string;
}

// TTS Configuration for Studio
export interface TTSConfig {
  model: ModelType;
  voice: string;
  responseFormat: ResponseFormat;
  speed: number;

  // Qwen3-TTS settings
  language: string;
  refAudioId: string | null;

  // IndexTTS settings
  emotion: string;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;

  // Emotion control
  emotionControl: EmotionControl;
}

// Generation history item
export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  model: ModelType;
  voice: string;
  emotion?: string;
  audioUrl?: string;
  audioDuration?: number;
}

// Audio result from generation
export interface AudioResult {
  id: string;
  text: string;
  audioUrl: string;
  audioBlob?: Blob;
  model: ModelType;
  voice: string;
  duration?: number;
  timestamp: number;
}

// Language options for Qwen3-TTS
export const LANGUAGE_OPTIONS = [
  { value: 'Chinese', label: '中文' },
  { value: 'English', label: 'English' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Korean', label: '한국어' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Spanish', label: 'Español' },
] as const;

// Emotion preset options for IndexTTS
export const EMOTION_PRESETS = [
  { value: 'default', label: '默认', icon: 'CircleDot' },
  { value: 'happy', label: '开心', icon: 'Smile' },
  { value: 'sad', label: '悲伤', icon: 'Frown' },
  { value: 'angry', label: '愤怒', icon: 'Angry' },
  { value: 'fear', label: '恐惧', icon: 'AlertTriangle' },
  { value: 'surprise', label: '惊讶', icon: 'Sparkles' },
  { value: 'disgust', label: '厌恶', icon: 'ThumbsDown' },
  { value: 'calm', label: '平静', icon: 'Heart' },
] as const;

// Emotion dimensions for vector control
export const EMOTION_DIMENSIONS = [
  { key: 'happy', label: '喜', color: 'from-yellow-400 to-amber-500' },
  { key: 'angry', label: '怒', color: 'from-red-400 to-rose-500' },
  { key: 'sad', label: '哀', color: 'from-blue-400 to-indigo-500' },
  { key: 'fear', label: '惧', color: 'from-purple-400 to-violet-500' },
  { key: 'disgust', label: '厌', color: 'from-green-400 to-emerald-500' },
  { key: 'low', label: '低落', color: 'from-slate-400 to-gray-500' },
  { key: 'surprise', label: '惊喜', color: 'from-pink-400 to-rose-500' },
  { key: 'calm', label: '平静', color: 'from-cyan-400 to-teal-500' },
] as const;

// Default values
export const DEFAULT_EMOTION_VECTOR: EmotionVector = {
  happy: 0,
  angry: 0,
  sad: 0,
  fear: 0,
  disgust: 0,
  low: 0,
  surprise: 0,
  calm: 0.5,
};

export const DEFAULT_EMOTION_CONTROL: EmotionControl = {
  mode: 'preset',
  emoAudioPath: null,
  emoAlpha: 1.0,
  emoVector: DEFAULT_EMOTION_VECTOR,
  emoText: '',
};

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  model: 'auto',
  voice: 'default',
  responseFormat: 'wav',
  speed: 1.0,
  language: 'Chinese',
  refAudioId: null,
  emotion: 'default',
  temperature: 1.0,
  topP: 0.8,
  topK: 20,
  repetitionPenalty: 1.0,
  emotionControl: DEFAULT_EMOTION_CONTROL,
};
