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
              <label htmlFor={id} className="text-sm font-medium text-slate-300">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-semibold text-neon-cyan">
                {valueFormatter(numericValue)}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={`cyber-slider ${className}`}
            {...props}
          />
        </div>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
