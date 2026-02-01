'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'magenta' | 'purple' | 'glass';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  scanLine?: boolean;
}

const variants = {
  default: 'cyber-card',
  magenta: 'cyber-card-magenta',
  purple: 'cyber-card border-neon-purple/20 hover:border-neon-purple/40',
  glass: 'bg-cyber-bg-secondary/30 backdrop-blur-xl border border-zinc-800/50 rounded-md',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hover = false,
      padding = 'md',
      scanLine = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { scale: 1.01 } : undefined}
        className={`
          ${variants[variant]}
          ${paddings[padding]}
          relative overflow-hidden
          ${className}
        `}
        {...props}
      >
        {/* Scan line effect */}
        {scanLine && <div className="card-scan-line" />}

        {/* Content */}
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
