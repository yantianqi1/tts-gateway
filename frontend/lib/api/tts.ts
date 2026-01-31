// TTS API

import { apiClient } from './client';
import type { TTSRequest, TTSResponse } from '@/types/api';
import type { TTSConfig, AudioResult } from '@/types/models';

// Convert frontend TTSConfig to API TTSRequest
function configToRequest(config: TTSConfig, text: string): TTSRequest {
  return {
    model: config.model,
    input: text,
    voice: config.voice,
    response_format: config.responseFormat,
    speed: config.speed,

    // Qwen3-TTS specific
    language: config.language,
    ref_audio_id: config.refAudioId || undefined,

    // IndexTTS specific
    emotion: config.emotion,
    temperature: config.temperature,
    top_p: config.topP,
    top_k: config.topK,
    repetition_penalty: config.repetitionPenalty,

    // Emotion control
    emotion_mode: config.emotionControl.mode,
    emo_audio_path: config.emotionControl.emoAudioPath || undefined,
    emo_alpha: config.emotionControl.emoAlpha,
    emo_vector: config.emotionControl.mode === 'vector'
      ? Object.values(config.emotionControl.emoVector)
      : undefined,
    use_emo_text: config.emotionControl.mode === 'text',
    emo_text: config.emotionControl.emoText || undefined,

    // Save options (default to false)
    save_audio: false,
    save_name: undefined,
  };
}

// Generate speech and return audio blob
export async function generateSpeech(
  config: TTSConfig,
  text: string,
  options?: { saveAudio?: boolean; saveName?: string }
): Promise<AudioResult> {
  const request = configToRequest(config, text);

  if (options?.saveAudio) {
    request.save_audio = true;
    request.save_name = options.saveName;
  }

  const blob = await apiClient.postBlob('/v1/audio/speech', request);
  const audioUrl = URL.createObjectURL(blob);

  return {
    id: crypto.randomUUID(),
    text,
    audioUrl,
    audioBlob: blob,
    model: config.model,
    voice: config.voice,
    timestamp: Date.now(),
  };
}

// Generate speech with full response (includes metadata)
export async function generateSpeechWithMeta(
  config: TTSConfig,
  text: string
): Promise<TTSResponse> {
  const request = configToRequest(config, text);
  return apiClient.post<TTSResponse>('/v1/audio/speech', request);
}

// Upload emotion reference audio
export async function uploadEmotionAudio(
  file: File
): Promise<{ success: boolean; file_path?: string; message?: string }> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.upload<{ success: boolean; file_path?: string; message?: string }>(
    '/v1/audio/emotion-upload',
    formData
  );
}
