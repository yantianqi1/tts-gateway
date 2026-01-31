'use client';

export default function CyberBackground() {
  return (
    <>
      {/* Cyber Grid */}
      <div className="cyber-grid" />

      {/* Scan Line */}
      <div className="scan-line" />

      {/* Corner Decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <path
            d="M0 50 L50 0 L100 0 L100 20 L30 20 L30 50 Z"
            fill="url(#gradient-corner)"
          />
          <defs>
            <linearGradient id="gradient-corner" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00fff5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-0 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <path
            d="M0 50 L50 0 L100 0 L100 20 L30 20 L30 50 Z"
            fill="url(#gradient-corner-2)"
          />
          <defs>
            <linearGradient id="gradient-corner-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Ambient Glow */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 bg-neon-magenta/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px] pointer-events-none z-0" />
    </>
  );
}
