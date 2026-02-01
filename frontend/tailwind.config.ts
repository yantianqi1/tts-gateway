import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS System Colors
        ios: {
          // Primary Backgrounds
          'bg-primary': '#F2F2F7',
          'bg-secondary': '#FFFFFF',
          'bg-tertiary': '#F9F9F9',
          'bg-grouped': '#F2F2F7',

          // System Colors
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          teal: '#5AC8FA',
          purple: '#AF52DE',
          pink: '#FF2D55',
          indigo: '#5856D6',

          // Gray Scale
          'gray-1': '#8E8E93',
          'gray-2': '#AEAEB2',
          'gray-3': '#C7C7CC',
          'gray-4': '#D1D1D6',
          'gray-5': '#E5E5EA',
          'gray-6': '#F2F2F7',
        },

        // Text Colors - High Contrast
        text: {
          primary: '#000000',
          secondary: '#3C3C43',
          tertiary: '#48484A',
          quaternary: '#636366',
          placeholder: '#8E8E93',
        },

        // Separator Colors
        separator: {
          DEFAULT: 'rgba(60, 60, 67, 0.12)',
          opaque: '#C6C6C8',
        },

        // Fill Colors
        fill: {
          primary: 'rgba(120, 120, 128, 0.2)',
          secondary: 'rgba(120, 120, 128, 0.16)',
          tertiary: 'rgba(118, 118, 128, 0.12)',
        },

        // Material Colors (for blur backgrounds)
        material: {
          thin: 'rgba(255, 255, 255, 0.8)',
          regular: 'rgba(255, 255, 255, 0.92)',
          thick: 'rgba(255, 255, 255, 0.97)',
        },
      },

      borderRadius: {
        'ios-sm': '8px',
        'ios-md': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin': 'spin 0.8s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },

      boxShadow: {
        'ios-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'ios-md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
      },

      backdropBlur: {
        'ios': '20px',
        'ios-lg': '40px',
      },

      fontFamily: {
        'ios': [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'sans-serif',
        ],
      },

      fontSize: {
        // iOS Typography Scale
        'ios-title-1': ['28px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'ios-title-2': ['22px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.02em' }],
        'ios-title-3': ['20px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'ios-headline': ['17px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.01em' }],
        'ios-body': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'ios-subheadline': ['15px', { lineHeight: '1.4', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'ios-caption-1': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'ios-caption-2': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
      },

      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
