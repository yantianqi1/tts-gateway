'use client';

import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/30',
  success: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
};

const sizes = {
  sm: 'text-[9px] px-2 py-0.5',
  md: 'text-[10px] px-2.5 py-1',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-mono uppercase tracking-wider rounded-sm border
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
