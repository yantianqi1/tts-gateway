// Voices API

import { apiClient } from './client';
import type { VoiceInfo, VoicesResponse, VoiceUploadResponse, VerifyKeyResponse, VoiceVisibility } from '@/types/api';

// Get all voices
export async function getVoices(privateKey?: string): Promise<VoiceInfo[]> {
  const headers: Record<string, string> = {};
  if (privateKey) {
    headers['X-Private-Key'] = privateKey;
  }
  const response = await apiClient.get<VoicesResponse>('/v1/voices', headers);
  return response.voices;
}

// Get voices by backend
export async function getVoicesByBackend(backend: string, privateKey?: string): Promise<VoiceInfo[]> {
  const headers: Record<string, string> = {};
  if (privateKey) {
    headers['X-Private-Key'] = privateKey;
  }
  const response = await apiClient.get<VoicesResponse>(`/v1/voices?backend=${backend}`, headers);
  return response.voices;
}

// Upload a new voice
export async function uploadVoice(
  file: File,
  voiceId: string,
  backend: 'qwen3-tts' | 'indextts',
  options?: {
    emotion?: string;
    refText?: string;
    visibility?: VoiceVisibility;
    privateKey?: string;
  }
): Promise<VoiceUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('voice_id', voiceId);
  formData.append('backend', backend);
  formData.append('visibility', options?.visibility || 'public');

  if (options?.emotion) {
    formData.append('emotion', options.emotion);
  }
  if (options?.refText) {
    formData.append('ref_text', options.refText);
  }
  if (options?.visibility === 'private' && options?.privateKey) {
    formData.append('private_key', options.privateKey);
  }

  return apiClient.upload<VoiceUploadResponse>('/v1/voices/upload', formData);
}

// Verify private key
export async function verifyPrivateKey(privateKey: string): Promise<VerifyKeyResponse> {
  return apiClient.post<VerifyKeyResponse>('/v1/voices/verify-key', {
    private_key: privateKey,
  });
}

// Delete a voice
export async function deleteVoice(voiceId: string, backend: string): Promise<void> {
  await apiClient.delete(`/v1/voices/${voiceId}?backend=${backend}`);
}

// Get voice details
export async function getVoiceDetails(voiceId: string): Promise<VoiceInfo> {
  return apiClient.get<VoiceInfo>(`/v1/voices/${voiceId}`);
}
