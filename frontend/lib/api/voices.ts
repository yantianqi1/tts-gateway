// Voices API

import { apiClient } from './client';
import type { VoiceInfo, VoicesResponse, VoiceUploadResponse } from '@/types/api';

// Get all voices
export async function getVoices(): Promise<VoiceInfo[]> {
  const response = await apiClient.get<VoicesResponse>('/v1/voices');
  return response.voices;
}

// Get voices by backend
export async function getVoicesByBackend(backend: string): Promise<VoiceInfo[]> {
  const response = await apiClient.get<VoicesResponse>(`/v1/voices?backend=${backend}`);
  return response.voices;
}

// Upload a new voice
export async function uploadVoice(
  file: File,
  voiceId: string,
  backend: 'qwen3-tts' | 'indextts',
  options?: { emotion?: string; refText?: string }
): Promise<VoiceUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('voice_id', voiceId);
  formData.append('backend', backend);

  if (options?.emotion) {
    formData.append('emotion', options.emotion);
  }
  if (options?.refText) {
    formData.append('ref_text', options.refText);
  }

  return apiClient.upload<VoiceUploadResponse>('/v1/voices/upload', formData);
}

// Delete a voice
export async function deleteVoice(voiceId: string, backend: string): Promise<void> {
  await apiClient.delete(`/v1/voices/${voiceId}?backend=${backend}`);
}

// Get voice details
export async function getVoiceDetails(voiceId: string): Promise<VoiceInfo> {
  return apiClient.get<VoiceInfo>(`/v1/voices/${voiceId}`);
}
