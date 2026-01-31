// History Store - manages generation history

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioResult } from '@/types/models';

interface HistoryState {
  // Session results (not persisted, includes blobs)
  sessionResults: AudioResult[];

  // Persisted history metadata (no blobs)
  history: Omit<AudioResult, 'audioBlob'>[];

  // Max history items to keep
  maxHistoryItems: number;

  // Actions
  addResult: (result: AudioResult) => void;
  removeResult: (id: string) => void;
  clearSessionResults: () => void;
  clearHistory: () => void;
  setMaxHistoryItems: (max: number) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessionResults: [],
      history: [],
      maxHistoryItems: 100,

      addResult: (result) => {
        // Add to session results
        set((state) => ({
          sessionResults: [result, ...state.sessionResults],
        }));

        // Add to persisted history (without blob)
        const { audioBlob, ...historyItem } = result;
        set((state) => {
          const newHistory = [historyItem, ...state.history];
          // Limit history size
          if (newHistory.length > state.maxHistoryItems) {
            return { history: newHistory.slice(0, state.maxHistoryItems) };
          }
          return { history: newHistory };
        });
      },

      removeResult: (id) => {
        // Remove from session results
        const sessionResult = get().sessionResults.find((r) => r.id === id);
        if (sessionResult?.audioUrl) {
          URL.revokeObjectURL(sessionResult.audioUrl);
        }

        set((state) => ({
          sessionResults: state.sessionResults.filter((r) => r.id !== id),
          history: state.history.filter((r) => r.id !== id),
        }));
      },

      clearSessionResults: () => {
        // Revoke all blob URLs
        get().sessionResults.forEach((result) => {
          if (result.audioUrl) {
            URL.revokeObjectURL(result.audioUrl);
          }
        });

        set({ sessionResults: [] });
      },

      clearHistory: () =>
        set({ history: [] }),

      setMaxHistoryItems: (max) =>
        set({ maxHistoryItems: max }),
    }),
    {
      name: 'tts-gateway-history',
      partialize: (state) => ({
        history: state.history,
        maxHistoryItems: state.maxHistoryItems,
      }),
    }
  )
);
