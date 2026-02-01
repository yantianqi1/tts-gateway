'use client';

import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'blue' | 'mint';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  default: 'ios-badge-gray',
  success: 'ios-badge-green',
  warning: 'ios-badge-orange',
  error: 'ios-badge-red',
  info: 'ios-badge-blue',
  purple: 'ios-badge-purple',
  pink: 'bg-[rgba(255,45,85,0.12)] text-[#FF2D55]',
  blue: 'ios-badge-blue',
  mint: 'bg-[rgba(52,199,89,0.12)] text-[#34C759]',
};

const sizes: Record<string, string> = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-[13px] px-2.5 py-1',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full
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
