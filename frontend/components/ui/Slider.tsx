'use client';

import { forwardRef, useId } from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  hint?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      showValue = true,
      valueFormatter = (v) => v.toString(),
      hint,
      className = '',
      min = 0,
      max = 100,
      step = 1,
      value,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const numericValue = typeof value === 'string' ? parseFloat(value) : (value as number);
    const percentage = ((numericValue - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={id} className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-xs font-mono text-neon-purple">
                {valueFormatter(numericValue)}
              </span>
            )}
          </div>
        )}

        {/* Slider track container */}
        <div className="relative h-8 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-2 bg-zinc-800/50 rounded-sm" />

          {/* Filled track */}
          <div
            className="absolute left-0 h-2 rounded-sm bg-gradient-to-r from-neon-purple to-neon-cyan"
            style={{ width: `${percentage}%` }}
          />

          {/* Glow effect on filled track */}
          <div
            className="absolute left-0 h-2 rounded-sm bg-gradient-to-r from-neon-purple to-neon-cyan blur-sm opacity-40"
            style={{ width: `${percentage}%` }}
          />

          {/* Tick marks */}
          <div className="absolute inset-x-0 h-2 flex items-center pointer-events-none">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className="absolute w-px h-1 bg-zinc-600/50"
                style={{ left: `${tick}%` }}
              />
            ))}
          </div>

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={`cyber-slider relative z-10 ${className}`}
            {...props}
          />
        </div>

        {hint && (
          <p className="text-[10px] text-zinc-600 font-mono">
            <span className="text-neon-purple/50">$</span> {hint}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
