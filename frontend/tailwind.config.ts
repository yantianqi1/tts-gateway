import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dopamine Light Theme - Multi-color Pastel Palette
        dopamine: {
          // Base backgrounds - warm white/cream tones
          bg: '#FEFCFB',              // Warm white
          'bg-secondary': '#FBF9F8',   // Soft cream
          'bg-card': 'rgba(255, 255, 255, 0.7)',
          surface: '#FFFFFF',          // Pure white for cards

          // Primary pastels - harmonious multi-color
          purple: '#A78BFA',           // Soft violet
          pink: '#F9A8D4',             // Candy pink
          blue: '#7DD3FC',             // Sky blue
          mint: '#6EE7B7',             // Fresh mint
          peach: '#FDBA74',            // Warm peach
          coral: '#FDA4AF',            // Soft coral
          lavender: '#C4B5FD',         // Light lavender

          // Accent colors for UI elements
          accent: '#8B5CF6',           // Vibrant purple (primary action)
          'accent-secondary': '#06B6D4', // Teal (secondary)
          success: '#10B981',          // Emerald green
          warning: '#F59E0B',          // Amber
          error: '#EF4444',            // Red
        },

        // Glass morphism colors
        glass: {
          white: 'rgba(255, 255, 255, 0.6)',
          'white-hover': 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.3)',
          'border-strong': 'rgba(255, 255, 255, 0.5)',
        },
      },

      borderRadius: {
        'glass': '16px',
        'glass-lg': '24px',
        'glass-sm': '12px',
      },

      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'blob': 'blob 7s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'bounce-soft': 'bounce-soft 2s infinite',
      },

      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'blob': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-hover': '0 8px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glass-lg': '0 10px 50px rgba(0, 0, 0, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.6)',
        'dopamine': '0 4px 20px rgba(139, 92, 246, 0.15)',
        'dopamine-pink': '0 4px 20px rgba(249, 168, 212, 0.25)',
        'dopamine-blue': '0 4px 20px rgba(125, 211, 252, 0.25)',
        'dopamine-mint': '0 4px 20px rgba(110, 231, 183, 0.25)',
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
      },

      backgroundImage: {
        'gradient-dopamine': 'linear-gradient(135deg, #A78BFA 0%, #F9A8D4 50%, #7DD3FC 100%)',
        'gradient-candy': 'linear-gradient(135deg, #F9A8D4 0%, #FDBA74 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #7DD3FC 0%, #6EE7B7 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FDA4AF 0%, #FDBA74 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #C4B5FD 0%, #7DD3FC 50%, #6EE7B7 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
      },

      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
    },
  },
  plugins: [],
} satisfies Config;
