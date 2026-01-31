// useModels hook - fetch and manage models

import { useQuery } from '@tanstack/react-query';
import { getModels, getBackendStatuses } from '@/lib/api/models';
import type { ModelInfo, BackendStatus } from '@/types/api';

export function useModels() {
  return useQuery<ModelInfo[]>({
    queryKey: ['models'],
    queryFn: getModels,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useBackendStatuses() {
  return useQuery<BackendStatus[]>({
    queryKey: ['backend-statuses'],
    queryFn: getBackendStatuses,
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
  });
}

export function useModelStatus(modelId: string) {
  const { data: statuses } = useBackendStatuses();

  const status = statuses?.find((s) => s.id === modelId);
  return {
    isOnline: status?.status === 'online',
    isLoaded: status?.model_loaded ?? false,
    features: status?.features ?? [],
    error: status?.error,
  };
}
