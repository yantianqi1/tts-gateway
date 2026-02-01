'use client';

/**
 * iOS-style Clean Background
 * Minimal, content-focused design following Apple HIG
 */
export default function CleanBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'var(--bg-primary)',
      }}
    />
  );
}
