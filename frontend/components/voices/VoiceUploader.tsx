'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Mic2, FileAudio } from 'lucide-react';
import { useUploadVoice } from '@/lib/hooks/useVoices';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

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

    uploadVoice(
      {
        file,
        voiceId: voiceId.trim(),
        backend,
        options: {
          emotion: backend === 'indextts' ? emotion : undefined,
          refText: backend === 'qwen3-tts' ? refText : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          setFile(null);
          setVoiceId('');
          setEmotion('default');
          setRefText('');
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : '上传失败');
        },
      }
    );
  }, [file, voiceId, backend, emotion, refText, uploadVoice, onClose]);

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
