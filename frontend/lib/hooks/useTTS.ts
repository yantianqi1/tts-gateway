// useTTS hook - TTS generation

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateSpeech } from '@/lib/api/tts';
import { useTTSStore } from '@/lib/store/ttsStore';
import { useHistoryStore } from '@/lib/store/historyStore';
import { useUIStore } from '@/lib/store/uiStore';
import type { AudioResult } from '@/types/models';

export function useTTS() {
  const { config, inputText } = useTTSStore();
  const { addResult } = useHistoryStore();
  const { setIsGenerating } = useUIStore();
  const [currentResult, setCurrentResult] = useState<AudioResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      setIsGenerating(true);
      try {
        const result = await generateSpeech(config, text);
        return result;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (result) => {
      setCurrentResult(result);
      addResult(result);
    },
  });

  const generate = useCallback(
    (text?: string) => {
      const textToGenerate = text || inputText;
      if (!textToGenerate.trim()) {
        return;
      }
      mutation.mutate(textToGenerate);
    },
    [mutation, inputText]
  );

  const generateWithOptions = useCallback(
    async (text: string, options?: { saveAudio?: boolean; saveName?: string }) => {
      setIsGenerating(true);
      try {
        const result = await generateSpeech(config, text, options);
        setCurrentResult(result);
        addResult(result);
        return result;
      } finally {
        setIsGenerating(false);
      }
    },
    [config, addResult, setIsGenerating]
  );

  return {
    generate,
    generateWithOptions,
    currentResult,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
      setCurrentResult(null);
    },
  };
}

// Hook for playing audio
export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const play = useCallback((audioUrl: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    audio.onpause = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };

    setCurrentAudio(audio);
    audio.play();
  }, [currentAudio]);

  const pause = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  return {
    play,
    pause,
    stop,
    isPlaying,
  };
}
