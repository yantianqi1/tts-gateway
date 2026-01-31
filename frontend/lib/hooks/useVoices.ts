// useVoices hook - fetch and manage voices

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVoices, getVoicesByBackend, uploadVoice, deleteVoice } from '@/lib/api/voices';
import type { VoiceInfo } from '@/types/api';

export function useVoices() {
  return useQuery<VoiceInfo[]>({
    queryKey: ['voices'],
    queryFn: getVoices,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useVoicesByBackend(backend: string) {
  return useQuery<VoiceInfo[]>({
    queryKey: ['voices', backend],
    queryFn: () => getVoicesByBackend(backend),
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
      options?: { emotion?: string; refText?: string };
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
