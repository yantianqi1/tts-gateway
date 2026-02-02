// API Response Types

export type VoiceVisibility = 'public' | 'private';

export interface TTSResponse {
  success: boolean;
  message: string;
  audio_url?: string;
  audio_id?: string;
  model_used?: string;
  duration?: number;
}

export interface VoiceInfo {
  id: string;
  name: string;
  backend: string;
  emotions: string[];
  ref_text?: string;
  has_default: boolean;
  visibility: VoiceVisibility;
}

export interface VoicesResponse {
  voices: VoiceInfo[];
  total: number;
}

export interface VoiceUploadResponse {
  success: boolean;
  message: string;
  voice_id?: string;
  emotion?: string;
  backend?: string;
  visibility?: VoiceVisibility;
}

export interface VerifyKeyResponse {
  valid: boolean;
  voice_count: number;
  voice_ids: string[];
}

export interface BackendStatus {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  model_loaded: boolean;
  features: string[];
  error?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  backend: string;
  status: 'online' | 'offline';
  features: string[];
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface HealthResponse {
  status: string;
  version: string;
  backends: BackendStatus[];
}

// API Request Types

export type ModelType = 'qwen3-tts' | 'indextts-2.0' | 'auto';
export type ResponseFormat = 'wav' | 'mp3';
export type EmotionMode = 'preset' | 'audio' | 'vector' | 'text';

export interface TTSRequest {
  // Basic parameters
  model: ModelType;
  input: string;
  voice: string;
  response_format: ResponseFormat;
  speed: number;

  // Qwen3-TTS specific
  language: string;
  ref_audio_id?: string;

  // IndexTTS specific
  emotion: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;

  // IndexTTS 2.0 emotion control
  emotion_mode: EmotionMode;
  emo_audio_path?: string;
  emo_alpha?: number;
  emo_vector?: number[];
  use_emo_text: boolean;
  emo_text?: string;

  // Save options
  save_audio: boolean;
  save_name?: string;
}

export interface VoiceUploadRequest {
  voice_id: string;
  emotion: string;
  ref_text?: string;
  backend: 'qwen3-tts' | 'indextts';
  visibility?: VoiceVisibility;
  private_key?: string;
}

// Partial request for frontend form
export type TTSFormData = Partial<TTSRequest>;
