'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'glass' | 'purple' | 'pink' | 'blue' | 'mint';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

const variants: Record<string, string> = {
  default: 'glass-card',
  glass: 'glass-card',
  purple: 'glass-card-purple backdrop-blur-sm border',
  pink: 'glass-card-pink backdrop-blur-sm border',
  blue: 'glass-card-blue backdrop-blur-sm border',
  mint: 'glass-card-mint backdrop-blur-sm border',
};

const paddings: Record<string, string> = {
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
      className = '',
      children,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
        className={`
          ${variants[variant]}
          ${paddings[padding]}
          ${className}
        `}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
