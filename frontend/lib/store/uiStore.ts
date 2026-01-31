// UI Store - manages UI state

import { create } from 'zustand';

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;

  // Generating state
  isGenerating: boolean;

  // Active panel in studio
  activePanel: 'settings' | 'results';

  // Selected tab in voices page
  voicesTab: 'all' | 'qwen3-tts' | 'indextts';

  // Modal states
  modals: {
    voiceUpload: boolean;
    settings: boolean;
    audioPreview: boolean;
  };

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  setActivePanel: (panel: 'settings' | 'results') => void;
  setVoicesTab: (tab: 'all' | 'qwen3-tts' | 'indextts') => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  isGenerating: false,
  activePanel: 'settings',
  voicesTab: 'all',
  modals: {
    voiceUpload: false,
    settings: false,
    audioPreview: false,
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setIsGenerating: (generating) =>
    set({ isGenerating: generating }),

  setActivePanel: (panel) =>
    set({ activePanel: panel }),

  setVoicesTab: (tab) =>
    set({ voicesTab: tab }),

  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),

  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),

  closeAllModals: () =>
    set({
      modals: {
        voiceUpload: false,
        settings: false,
        audioPreview: false,
      },
    }),
}));
