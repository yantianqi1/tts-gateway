'use client';

import { useEffect, useRef, useState } from 'react';

export default function CyberBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setIsHovering(true);
        rafRef.current = 0;
      });
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Dot Grid Background - 16x16 pixels */}
      <div className="cyber-grid" />

      {/* Scan Line Effect */}
      <div className="scan-line" />

      {/* Mouse Hover Glow Effect */}
      {isHovering && (
        <div
          className="fixed pointer-events-none z-0 transition-opacity duration-300"
          style={{
            left: mousePos.x - 150,
            top: mousePos.y - 150,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* Tech Corner Decorations - Top Left */}
      <div className="fixed top-4 left-4 pointer-events-none z-0 opacity-30">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          {/* Corner bracket */}
          <path
            d="M0 40 L0 0 L40 0"
            stroke="url(#corner-gradient-1)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 30 L0 10 L10 10 L10 0"
            stroke="rgba(124, 58, 237, 0.5)"
            strokeWidth="0.5"
            fill="none"
          />
          {/* Decorative dots */}
          <circle cx="20" cy="20" r="2" fill="rgba(124, 58, 237, 0.4)" />
          <circle cx="35" cy="20" r="1" fill="rgba(6, 182, 212, 0.4)" />
          <circle cx="20" cy="35" r="1" fill="rgba(6, 182, 212, 0.4)" />
          <defs>
            <linearGradient id="corner-gradient-1" x1="0" y1="40" x2="40" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Tech Corner Decorations - Bottom Right */}
      <div className="fixed bottom-4 right-4 pointer-events-none z-0 opacity-30 rotate-180">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M0 40 L0 0 L40 0"
            stroke="url(#corner-gradient-2)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 30 L0 10 L10 10 L10 0"
            stroke="rgba(6, 182, 212, 0.5)"
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="20" cy="20" r="2" fill="rgba(6, 182, 212, 0.4)" />
          <circle cx="35" cy="20" r="1" fill="rgba(124, 58, 237, 0.4)" />
          <circle cx="20" cy="35" r="1" fill="rgba(124, 58, 237, 0.4)" />
          <defs>
            <linearGradient id="corner-gradient-2" x1="0" y1="40" x2="40" y2="0">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Tech Parameters - Top Right */}
      <div className="fixed top-6 right-6 pointer-events-none z-0 text-right hidden lg:block">
        <div className="tech-label">SYS_STATUS: ONLINE</div>
        <div className="tech-label mt-1">BUFFER_SIZE: 1024ms</div>
        <div className="tech-label mt-1">MODEL_V: 3.0.1</div>
      </div>

      {/* Decorative Tech Parameters - Bottom Left */}
      <div className="fixed bottom-6 left-6 pointer-events-none z-0 hidden lg:block">
        <div className="tech-label">LATENCY: 42ms</div>
        <div className="tech-label mt-1">SAMPLE_RATE: 24000Hz</div>
        <div className="tech-label mt-1">BIT_DEPTH: 16bit</div>
      </div>

      {/* Ambient Glow Orbs */}
      <div
        className="fixed top-1/4 -left-32 w-64 h-64 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.04) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Horizontal Tech Lines */}
      <div className="fixed top-1/3 left-0 right-0 h-px pointer-events-none z-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-neon-purple to-transparent" />
      </div>
      <div className="fixed bottom-1/3 left-0 right-0 h-px pointer-events-none z-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
      </div>
    </>
  );
}
