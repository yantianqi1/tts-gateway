import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep space cyberpunk palette
        cyber: {
          bg: '#050505',           // Pure deep space
          'bg-secondary': '#121214', // Matte metal
          'bg-card': 'rgba(18, 18, 20, 0.5)',
          surface: '#0A0A0B',      // Deep carbon gray
        },
        neon: {
          cyan: '#06B6D4',         // Tech cyan (secondary/decoration)
          magenta: '#ff00ff',
          purple: '#7C3AED',       // Cyber purple (primary glow)
          blue: '#2563EB',         // Cobalt blue (alternative primary)
          pink: '#ec4899',
          green: '#10B981',        // Matrix green (status)
        },
        // Accent colors
        accent: {
          primary: '#7C3AED',      // Electric purple
          secondary: '#06B6D4',    // Cyan
          success: '#10B981',      // Matrix green
          warning: '#F59E0B',
          danger: '#EF4444',
          muted: '#3F3F46',        // Inactive gray
        },
      },
      borderRadius: {
        'cyber': '4px',            // Industrial small radius
        'cyber-lg': '6px',
      },
      animation: {
        'cyber-shine': 'cyber-shine 3s infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'scan-card': 'scan-card 3s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'block-cursor': 'block-cursor 1s ease-in-out infinite',
        'data-stream': 'data-stream 0.8s linear',
        'light-flow': 'light-flow 2s linear infinite',
        'breathing': 'breathing 2s ease-in-out infinite',
      },
      keyframes: {
        'cyber-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '50%, 100%': { transform: 'translateX(100%)' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '16px 16px' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'scan-card': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, -2px)' },
          '80%': { transform: 'translate(2px, 2px)' },
        },
        'block-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'data-stream': {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'light-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'breathing': {
          '0%, 100%': { boxShadow: '0 0 5px var(--glow-color)', opacity: '0.8' },
          '50%': { boxShadow: '0 0 20px var(--glow-color)', opacity: '1' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #06B6D4, 0 0 20px rgba(6, 182, 212, 0.5)',
        'neon-magenta': '0 0 10px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.5)',
        'neon-purple': '0 0 10px #7C3AED, 0 0 20px rgba(124, 58, 237, 0.5)',
        'neon-green': '0 0 10px #10B981, 0 0 20px rgba(16, 185, 129, 0.5)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'cyber-card': '0 0 30px rgba(124, 58, 237, 0.1), inset 0 0 60px rgba(124, 58, 237, 0.02)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #7C3AED, #06B6D4)',
        'gradient-button': 'linear-gradient(90deg, #7C3AED, #06B6D4)',
        'gradient-purple': 'linear-gradient(135deg, #7C3AED, #A855F7)',
        'gradient-flow': 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent)',
      },
      backdropBlur: {
        'cyber': '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;
