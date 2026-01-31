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
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: '/studio', icon: Mic2, label: '语音工作室' },
  { href: '/voices', icon: Users, label: '音色管理' },
  { href: '/history', icon: History, label: '生成历史' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-64 bg-cyber-bg-secondary/80 backdrop-blur-xl border-r border-neon-cyan/20 flex flex-col z-50 ${className}`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-neon-cyan/10">
        <Link href="/studio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <Waves className="w-5 h-5 text-cyber-bg" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple opacity-50 blur-lg" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text">TTS Gateway</h1>
            <p className="text-xs text-slate-500">Cyberpunk Voice Studio</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300 cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-neon-cyan to-neon-purple"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon with glow */}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-neon-cyan' : ''}`} />
                  {isActive && (
                    <div className="absolute inset-0 blur-md bg-neon-cyan/50 rounded-full" />
                  )}
                </div>

                <span className="font-medium">{item.label}</span>

                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute right-4 w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Status Section */}
      <div className="p-4 border-t border-neon-cyan/10">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium text-white">后端状态</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Qwen3-TTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-neon-green">在线</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">IndexTTS 2.0</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-neon-green">在线</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
