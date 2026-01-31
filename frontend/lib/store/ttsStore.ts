// TTS Store - manages TTS configuration

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TTSConfig, EmotionControl, EmotionVector } from '@/types/models';
import type { ModelType } from '@/types/api';
import {
  DEFAULT_TTS_CONFIG,
  DEFAULT_EMOTION_CONTROL,
  DEFAULT_EMOTION_VECTOR,
} from '@/types/models';

interface TTSState {
  // Current TTS configuration
  config: TTSConfig;

  // Input text
  inputText: string;

  // Actions
  setConfig: (config: Partial<TTSConfig>) => void;
  setModel: (model: ModelType) => void;
  setInputText: (text: string) => void;
  setEmotionControl: (control: Partial<EmotionControl>) => void;
  setEmotionVector: (vector: Partial<EmotionVector>) => void;
  resetEmotionVector: () => void;
  resetConfig: () => void;
}

export const useTTSStore = create<TTSState>()(
  persist(
    (set) => ({
      config: DEFAULT_TTS_CONFIG,
      inputText: '',

      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      setModel: (model) =>
        set((state) => ({
          config: { ...state.config, model },
        })),

      setInputText: (text) =>
        set({ inputText: text }),

      setEmotionControl: (control) =>
        set((state) => ({
          config: {
            ...state.config,
            emotionControl: { ...state.config.emotionControl, ...control },
          },
        })),

      setEmotionVector: (vector) =>
        set((state) => ({
          config: {
            ...state.config,
            emotionControl: {
              ...state.config.emotionControl,
              emoVector: { ...state.config.emotionControl.emoVector, ...vector },
            },
          },
        })),

      resetEmotionVector: () =>
        set((state) => ({
          config: {
            ...state.config,
            emotionControl: {
              ...state.config.emotionControl,
              emoVector: DEFAULT_EMOTION_VECTOR,
            },
          },
        })),

      resetConfig: () =>
        set({
          config: DEFAULT_TTS_CONFIG,
          inputText: '',
        }),
    }),
    {
      name: 'tts-gateway-config',
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);
