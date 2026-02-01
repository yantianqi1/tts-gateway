'use client';

import { useTTSStore } from '@/lib/store/ttsStore';

interface TextInputProps {
  className?: string;
}

// Progress Ring Component for character count
function ProgressRing({ progress, size = 24 }: { progress: number; size?: number }) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle className="bg" cx={size / 2} cy={size / 2} r={radius} />
      <circle
        className="progress"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export default function TextInput({ className = '' }: TextInputProps) {
  const { inputText, setInputText } = useTTSStore();
  const maxLength = 5000;
  const charCount = inputText.length;
  const progress = (charCount / maxLength) * 100;

  // Generate line numbers based on text content
  const lines = inputText.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lines, 8) }, (_, i) => i + 1);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with label and progress counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-neon-purple to-neon-cyan" />
          <label className="text-sm font-medium text-zinc-300 tracking-wide uppercase">
            Command Input
          </label>
        </div>

        {/* Character counter with progress ring */}
        <div className="flex items-center gap-2">
          <ProgressRing progress={Math.min(progress, 100)} size={20} />
          <span
            className={`text-xs font-mono ${
              charCount > maxLength * 0.9
                ? 'text-red-400'
                : charCount > maxLength * 0.7
                  ? 'text-amber-400'
                  : 'text-zinc-500'
            }`}
          >
            {charCount.toString().padStart(4, '0')}/{maxLength}
          </span>
        </div>
      </div>

      {/* Code Editor Style Textarea */}
      <div className="relative group">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-4 pb-4 text-xs font-mono text-zinc-600 select-none overflow-hidden border-r border-neon-purple/10 bg-cyber-surface/30 rounded-l-md">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 h-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea with code editor styling */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="// Enter text to synthesize..."
          maxLength={maxLength}
          className="w-full h-48 pl-12 pr-4 pt-4 pb-4 bg-cyber-surface/80 border border-neon-purple/20 rounded-md text-white font-mono text-sm leading-6 resize-none outline-none transition-all duration-300 focus:border-neon-purple/50 focus:shadow-[0_0_30px_rgba(124,58,237,0.15)] placeholder:text-zinc-600"
          spellCheck={false}
        />

        {/* Block cursor indicator when focused */}
        <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
          <span className="block-cursor" />
        </div>

        {/* Tech decoration - bottom right corner */}
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-neon-purple/30 tracking-wider">
          UTF-8 | LF
        </div>
      </div>

      {/* Hint text */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 font-mono">
          <span className="text-neon-purple/50">$</span> Supports Chinese, English, and more languages
        </span>
        <span className="text-zinc-600 font-mono">
          MAX_BUFFER: {maxLength}
        </span>
      </div>
    </div>
  );
}
