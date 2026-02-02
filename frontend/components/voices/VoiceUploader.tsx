'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Mic2, FileAudio, Lock, Globe, AlertTriangle } from 'lucide-react';
import { useUploadVoice } from '@/lib/hooks/useVoices';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import type { VoiceVisibility } from '@/types/api';

interface VoiceUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceUploader({ isOpen, onClose }: VoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [voiceId, setVoiceId] = useState('');
  const [backend, setBackend] = useState<'qwen3-tts' | 'indextts'>('indextts');
  const [emotion, setEmotion] = useState('default');
  const [refText, setRefText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 新增：可见性和私人密钥
  const [visibility, setVisibility] = useState<VoiceVisibility>('public');
  const [privateKey, setPrivateKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadVoice, isPending } = useUploadVoice();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.wav')) {
      setError('仅支持 .wav 格式');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('文件过大，最大支持 50MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Auto-fill voice ID from filename
    if (!voiceId) {
      const name = selectedFile.name.replace(/\.wav$/i, '');
      setVoiceId(name);
    }
  }, [voiceId]);

  const handleSubmit = useCallback(() => {
    if (!file || !voiceId.trim()) {
      setError('请选择文件并填写音色 ID');
      return;
    }

    // 私人音色验证
    if (visibility === 'private') {
      if (!privateKey || privateKey.length < 4) {
        setError('私人密钥至少需要 4 个字符');
        return;
      }
      if (privateKey !== confirmKey) {
        setError('两次输入的密钥不一致');
        return;
      }
    }

    uploadVoice(
      {
        file,
        voiceId: voiceId.trim(),
        backend,
        options: {
          emotion: backend === 'indextts' ? emotion : undefined,
          refText: backend === 'qwen3-tts' ? refText : undefined,
          visibility,
          privateKey: visibility === 'private' ? privateKey : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          setFile(null);
          setVoiceId('');
          setEmotion('default');
          setRefText('');
          setVisibility('public');
          setPrivateKey('');
          setConfirmKey('');
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : '上传失败');
        },
      }
    );
  }, [file, voiceId, backend, emotion, refText, visibility, privateKey, confirmKey, uploadVoice, onClose]);

  const handleClearFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="上传音色" size="lg">
      <div className="space-y-4">
        {/* Backend selection */}
        <Select
          label="目标后端"
          value={backend}
          onChange={(e) => setBackend(e.target.value as 'qwen3-tts' | 'indextts')}
          options={[
            { value: 'indextts', label: 'IndexTTS 2.0' },
            { value: 'qwen3-tts', label: 'Qwen3-TTS' },
          ]}
        />

        {/* Visibility selection */}
        <div className="space-y-2">
          <label className="text-subheadline text-text-primary">音色库类型</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisibility('public')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-ios-md border-2 transition-all ${
                visibility === 'public'
                  ? 'border-ios-blue bg-ios-blue/10 text-ios-blue'
                  : 'border-separator-opaque bg-fill-tertiary text-text-secondary hover:border-ios-blue/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-subheadline font-medium">公共库</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-ios-md border-2 transition-all ${
                visibility === 'private'
                  ? 'border-ios-orange bg-ios-orange/10 text-ios-orange'
                  : 'border-separator-opaque bg-fill-tertiary text-text-secondary hover:border-ios-orange/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="text-subheadline font-medium">私人库</span>
            </button>
          </div>
          <p className="text-caption-1 text-text-tertiary">
            {visibility === 'public'
              ? '公共库：所有人都可以看到和使用此音色'
              : '私人库：需要密钥才能访问此音色'}
          </p>
        </div>

        {/* Private key inputs (only show when private) */}
        {visibility === 'private' && (
          <div className="space-y-3 p-4 bg-ios-orange/5 border border-ios-orange/20 rounded-ios-md">
            <div className="flex items-start gap-2 text-ios-orange">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-caption-1">
                请牢记您的私人密钥，密钥丢失后将无法访问此音色
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-subheadline text-text-primary">私人密钥</label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="设置访问密钥（至少 4 位）"
                className="ios-input w-full"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-subheadline text-text-primary">确认密钥</label>
              <input
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                placeholder="再次输入密钥"
                className="ios-input w-full"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {/* File upload */}
        <div className="space-y-2">
          <label className="text-subheadline text-text-primary">音频文件</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav"
            onChange={handleFileChange}
            className="hidden"
            id="voice-file-upload"
          />

          {!file ? (
            <label
              htmlFor="voice-file-upload"
              className="flex flex-col items-center justify-center p-8 bg-fill-tertiary rounded-ios-md border-2 border-dashed border-separator-opaque hover:border-ios-blue/50 cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-ios-blue mb-3" />
              <span className="text-subheadline text-text-secondary">点击上传音频文件</span>
              <span className="text-caption-1 text-text-tertiary mt-1">支持 .wav 格式，最大 50MB</span>
            </label>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-fill-tertiary rounded-ios-md">
              <div className="p-2 bg-ios-blue rounded-ios-sm">
                <FileAudio className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-subheadline font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-caption-1 text-text-tertiary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleClearFile}
                className="p-2 text-text-tertiary hover:text-ios-red rounded-ios-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Voice ID */}
        <div className="space-y-2">
          <label className="text-subheadline text-text-primary">音色 ID</label>
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="输入唯一的音色标识符"
            className="ios-input w-full"
          />
        </div>

        {/* Backend-specific options */}
        {backend === 'indextts' && (
          <Select
            label="情感标签"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            options={[
              { value: 'default', label: '默认' },
              { value: 'happy', label: '开心' },
              { value: 'sad', label: '悲伤' },
              { value: 'angry', label: '愤怒' },
              { value: 'calm', label: '平静' },
            ]}
          />
        )}

        {backend === 'qwen3-tts' && (
          <div className="space-y-2">
            <label className="text-subheadline text-text-primary">参考文本 (可选)</label>
            <textarea
              value={refText}
              onChange={(e) => setRefText(e.target.value)}
              placeholder="输入参考音频对应的文本内容..."
              className="ios-textarea w-full h-20 resize-none"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-ios-red/10 border border-ios-red/20 rounded-ios-sm">
            <p className="text-subheadline text-ios-red">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="plain" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!file || !voiceId.trim()}
          >
            <Mic2 className="w-4 h-4" />
            上传
          </Button>
        </div>
      </div>
    </Modal>
  );
}
