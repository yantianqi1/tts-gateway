'use client';

import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'blue' | 'mint';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-600 border-gray-200',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  error: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-sky-50 text-sky-600 border-sky-200',
  purple: 'bg-violet-50 text-violet-600 border-violet-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  mint: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const sizes: Record<string, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full border
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
