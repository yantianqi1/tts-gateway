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
      <div className="space-y-3">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={id} className="text-sm font-medium text-gray-600">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-semibold text-dopamine-purple">
                {valueFormatter(numericValue)}
              </span>
            )}
          </div>
        )}

        {/* Slider track container */}
        <div className="relative h-8 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-2 bg-gray-200/50 rounded-full" />

          {/* Filled track with gradient */}
          <div
            className="absolute left-0 h-2 rounded-full bg-gradient-dopamine"
            style={{ width: `${percentage}%` }}
          />

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={`dopamine-slider relative z-10 ${className}`}
            {...props}
          />
        </div>

        {hint && (
          <p className="text-xs text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
