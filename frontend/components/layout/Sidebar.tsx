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
  Activity,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: '/studio', icon: Mic2, label: '工作室' },
  { href: '/voices', icon: Users, label: '音色库' },
  { href: '/history', icon: History, label: '历史记录' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-64 frosted-glass border-r border-white/20 flex flex-col z-50 ${className}`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <Link href="/studio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-glass-sm bg-gradient-dopamine flex items-center justify-center shadow-dopamine">
              <Waves className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">语音合成</h1>
            <p className="text-[11px] text-gray-500">TTS Gateway</p>
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
                  relative flex items-center gap-3 px-4 py-3 rounded-glass-sm
                  transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-dopamine-purple/15 text-dopamine-accent'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-dopamine rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <Icon className={`w-5 h-5 ${isActive ? 'text-dopamine-accent' : ''}`} />

                {/* Label */}
                <span className="font-medium text-sm">{item.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-dopamine-purple animate-pulse-soft" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Backend Status Section */}
      <div className="p-4 border-t border-white/10">
        <div className="p-4 glass-card rounded-glass-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-dopamine-purple" />
            <span className="text-xs font-medium text-gray-700">系统状态</span>
          </div>

          {/* Status items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Qwen3-TTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-dopamine-success font-medium">就绪</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">IndexTTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-dopamine-success font-medium">就绪</span>
              </div>
            </div>
          </div>

          {/* GPU Memory */}
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>GPU 内存</span>
              <span>8.2 / 24 GB</span>
            </div>
            <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full w-[34%] bg-gradient-dopamine rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>v1.0.0</span>
          <span>多巴胺主题</span>
        </div>
      </div>
    </aside>
  );
}
