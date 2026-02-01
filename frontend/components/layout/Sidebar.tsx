'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic2,
  Users,
  History,
  Settings,
  Waves,
  Zap,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: '/studio', icon: Mic2, label: 'Studio', techLabel: 'SYNTH_01' },
  { href: '/voices', icon: Users, label: 'Voices', techLabel: 'VOICE_DB' },
  { href: '/history', icon: History, label: 'History', techLabel: 'LOG_SYS' },
  { href: '/settings', icon: Settings, label: 'Settings', techLabel: 'CONFIG' },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-64 bg-cyber-bg-secondary/60 backdrop-blur-xl border-r border-neon-purple/10 flex flex-col z-50 ${className}`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-neon-purple/10">
        <Link href="/studio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <Waves className="w-5 h-5 text-cyber-bg" />
            </div>
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-neon-purple to-neon-cyan opacity-40 blur-lg" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">TTS Gateway</h1>
            <p className="text-[10px] text-zinc-600 font-mono tracking-wider">CYBERPUNK.VOICE.SYS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-md
                  transition-all duration-200 cursor-pointer group
                  ${isActive
                    ? 'bg-neon-purple/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-neon-purple to-neon-cyan"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-neon-purple' : ''}`} />
                  {isActive && (
                    <div className="absolute inset-0 blur-md bg-neon-purple/50 rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span className="font-medium text-sm">{item.label}</span>

                {/* Tech label */}
                <span className={`ml-auto text-[9px] font-mono ${isActive ? 'text-neon-purple/60' : 'text-zinc-600'}`}>
                  {item.techLabel}
                </span>

                {/* Active pulse indicator */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Backend Status Section */}
      <div className="p-4 border-t border-neon-purple/10">
        <div className="p-4 bg-cyber-surface/50 rounded-md border border-zinc-800/50">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-medium text-white uppercase tracking-wider">System Status</span>
          </div>

          {/* Status items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-mono">Qwen3-TTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-neon-green font-mono">READY</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-mono">IndexTTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-neon-green font-mono">READY</span>
              </div>
            </div>
          </div>

          {/* Decorative separator */}
          <div className="mt-3 pt-3 border-t border-zinc-800/50">
            <div className="flex items-center justify-between text-[9px] text-zinc-600 font-mono">
              <span>GPU_MEM</span>
              <span>8.2 / 24 GB</span>
            </div>
            <div className="mt-1 h-1 bg-zinc-800/50 rounded-sm overflow-hidden">
              <div className="h-full w-[34%] bg-gradient-to-r from-neon-purple to-neon-cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer tech decoration */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-[9px] text-zinc-700 font-mono">
          <span>v1.0.0</span>
          <span>BUILD_2024</span>
        </div>
      </div>
    </aside>
  );
}
