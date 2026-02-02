// Private Key Store - 管理私人音色访问密钥
// 注意：密钥仅存储在内存中，页面刷新后需重新输入

import { create } from 'zustand';

interface PrivateKeyState {
  // 当前激活的私人密钥（仅内存，不持久化）
  activeKey: string | null;

  // 已解锁的音色 ID 列表
  unlockedVoiceIds: string[];

  // 解锁的音色数量
  unlockedCount: number;

  // Actions
  setActiveKey: (key: string | null) => void;
  addUnlockedVoices: (voiceIds: string[]) => void;
  clearSession: () => void;
  isVoiceUnlocked: (voiceId: string) => boolean;
}

export const usePrivateKeyStore = create<PrivateKeyState>((set, get) => ({
  activeKey: null,
  unlockedVoiceIds: [],
  unlockedCount: 0,

  setActiveKey: (key) => set({ activeKey: key }),

  addUnlockedVoices: (voiceIds) =>
    set((state) => {
      const newIds = [...new Set([...state.unlockedVoiceIds, ...voiceIds])];
      return {
        unlockedVoiceIds: newIds,
        unlockedCount: newIds.length,
      };
    }),

  clearSession: () =>
    set({
      activeKey: null,
      unlockedVoiceIds: [],
      unlockedCount: 0,
    }),

  isVoiceUnlocked: (voiceId) => {
    return get().unlockedVoiceIds.includes(voiceId);
  },
}));
