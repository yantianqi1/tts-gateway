'use client';

import { useTTSStore } from '@/lib/store/ttsStore';

interface TextInputProps {
  className?: string;
}

export default function TextInput({ className = '' }: TextInputProps) {
  const { inputText, setInputText } = useTTSStore();
  const maxLength = 5000;
  const charCount = inputText.length;
  const progress = (charCount / maxLength) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with label and counter */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          输入文本
        </label>

        {/* Character counter */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-dopamine rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span
            className={`text-xs ${
              charCount > maxLength * 0.9
                ? 'text-red-500'
                : charCount > maxLength * 0.7
                  ? 'text-amber-500'
                  : 'text-gray-400'
            }`}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="请输入要合成的文本内容..."
          maxLength={maxLength}
          className="w-full h-40 p-4 dopamine-textarea resize-none"
          spellCheck={false}
        />
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-400">
        支持中文、英文等多种语言
      </p>
    </div>
  );
}
