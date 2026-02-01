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
              <label htmlFor={id} className="text-subheadline text-text-primary">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-subheadline font-semibold text-ios-blue">
                {valueFormatter(numericValue)}
              </span>
            )}
          </div>
        )}

        {/* Slider track container */}
        <div className="relative h-8 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-1 bg-ios-gray-5 rounded-full" />

          {/* Filled track */}
          <div
            className="absolute left-0 h-1 rounded-full bg-ios-blue"
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
            className={`ios-slider relative z-10 ${className}`}
            {...props}
          />
        </div>

        {hint && (
          <p className="text-caption-1 text-text-tertiary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
