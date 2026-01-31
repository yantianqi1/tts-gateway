// Models API

import { apiClient } from './client';
import type { ModelInfo, ModelsResponse, HealthResponse, BackendStatus } from '@/types/api';

// Get all available models
export async function getModels(): Promise<ModelInfo[]> {
  const response = await apiClient.get<ModelsResponse>('/v1/models');
  return response.models;
}

// Get health status
export async function getHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health');
}

// Get backend statuses
export async function getBackendStatuses(): Promise<BackendStatus[]> {
  const health = await getHealth();
  return health.backends;
}

// Check if a specific backend is online
export async function isBackendOnline(backendId: string): Promise<boolean> {
  try {
    const statuses = await getBackendStatuses();
    const backend = statuses.find((b) => b.id === backendId);
    return backend?.status === 'online';
  } catch {
    return false;
  }
}
