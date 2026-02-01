'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  variant?: 'default' | 'grouped' | 'inset' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

const variants: Record<string, string> = {
  default: 'ios-card',
  grouped: 'ios-card-grouped',
  inset: 'ios-card-inset',
  interactive: 'ios-card-interactive',
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
      padding = 'md',
      className = '',
      children,
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive';

    if (isInteractive) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15 }}
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

    return (
      <div
        ref={ref}
        className={`
          ${variants[variant]}
          ${paddings[padding]}
          ${className}
        `}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
