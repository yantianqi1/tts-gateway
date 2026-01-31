'use client';

import { useTTSStore } from '@/lib/store/ttsStore';

interface TextInputProps {
  className?: string;
}

export default function TextInput({ className = '' }: TextInputProps) {
  const { inputText, setInputText } = useTTSStore();
  const maxLength = 5000;
  const charCount = inputText.length;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">输入文本</label>
        <span
          className={`text-xs ${
            charCount > maxLength * 0.9
              ? 'text-red-400'
              : charCount > maxLength * 0.7
                ? 'text-yellow-400'
                : 'text-slate-500'
          }`}
        >
          {charCount} / {maxLength}
        </span>
      </div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="请输入要合成的文本..."
        maxLength={maxLength}
        className="cyber-textarea w-full h-40 resize-none"
      />
      <p className="text-xs text-slate-500">
        支持中文、英文等多种语言，最大 5000 字符
      </p>
    </div>
  );
}
