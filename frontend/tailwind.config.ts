import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          'bg-secondary': '#12121a',
          'bg-card': 'rgba(18, 18, 26, 0.8)',
        },
        neon: {
          cyan: '#00fff5',
          magenta: '#ff00ff',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899',
          green: '#10b981',
        },
      },
      animation: {
        'cyber-shine': 'cyber-shine 3s infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        'cyber-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '50%, 100%': { transform: 'translateX(100%)' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, -2px)' },
          '80%': { transform: 'translate(2px, 2px)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00fff5, 0 0 20px #00fff5',
        'neon-magenta': '0 0 10px #ff00ff, 0 0 20px #ff00ff',
        'neon-purple': '0 0 10px #8b5cf6, 0 0 20px #8b5cf6',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00fff5, #8b5cf6, #ff00ff)',
        'gradient-button': 'linear-gradient(90deg, #00fff5, #8b5cf6)',
      },
    },
  },
  plugins: [],
} satisfies Config;
