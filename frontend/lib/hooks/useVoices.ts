// useVoices hook - fetch and manage voices

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVoices, getVoicesByBackend, uploadVoice, deleteVoice, verifyPrivateKey } from '@/lib/api/voices';
import type { VoiceInfo, VoiceVisibility } from '@/types/api';
import { usePrivateKeyStore } from '@/lib/store/privateKeyStore';

export function useVoices() {
  const activeKey = usePrivateKeyStore((state) => state.activeKey);

  return useQuery<VoiceInfo[]>({
    queryKey: ['voices', activeKey],
    queryFn: () => getVoices(activeKey || undefined),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useVoicesByBackend(backend: string) {
  const activeKey = usePrivateKeyStore((state) => state.activeKey);

  return useQuery<VoiceInfo[]>({
    queryKey: ['voices', backend, activeKey],
    queryFn: () => getVoicesByBackend(backend, activeKey || undefined),
    staleTime: 60 * 1000,
    enabled: !!backend && backend !== 'all',
  });
}

export function useUploadVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      voiceId,
      backend,
      options,
    }: {
      file: File;
      voiceId: string;
      backend: 'qwen3-tts' | 'indextts';
      options?: {
        emotion?: string;
        refText?: string;
        visibility?: VoiceVisibility;
        privateKey?: string;
      };
    }) => uploadVoice(file, voiceId, backend, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voices'] });
    },
  });
}

export function useDeleteVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voiceId, backend }: { voiceId: string; backend: string }) =>
      deleteVoice(voiceId, backend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voices'] });
    },
  });
}

export function useVerifyPrivateKey() {
  const queryClient = useQueryClient();
  const { setActiveKey, addUnlockedVoices } = usePrivateKeyStore();

  return useMutation({
    mutationFn: (privateKey: string) => verifyPrivateKey(privateKey),
    onSuccess: (data, privateKey) => {
      if (data.valid) {
        setActiveKey(privateKey);
        addUnlockedVoices(data.voice_ids);
        // 刷新音色列表以包含私人音色
        queryClient.invalidateQueries({ queryKey: ['voices'] });
      }
    },
  });
}
