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
      className={`fixed left-0 top-0 bottom-0 w-[260px] ios-sidebar flex flex-col z-50 ${className}`}
    >
      {/* Logo Section */}
      <div className="p-5 pb-4">
        <Link href="/studio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-10 h-10 rounded-ios-sm bg-ios-blue flex items-center justify-center shadow-ios-md">
              <Waves className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-[17px] font-semibold text-text-primary tracking-tight">
              语音合成
            </h1>
            <p className="text-[12px] text-text-tertiary">TTS Gateway</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-separator" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-ios-sm
                  transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-ios-blue text-white'
                    : 'text-text-secondary hover:bg-fill-tertiary hover:text-text-primary'
                  }
                `}
              >
                {/* Icon */}
                <Icon className="w-5 h-5" strokeWidth={1.8} />

                {/* Label */}
                <span className="text-[15px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Backend Status Section */}
      <div className="p-3">
        <div className="ios-card p-4 rounded-ios-md">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-ios-blue" />
            <span className="text-[13px] font-medium text-text-primary">系统状态</span>
          </div>

          {/* Status items */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-tertiary">Qwen3-TTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-ios-green font-medium">就绪</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-tertiary">IndexTTS</span>
              <div className="flex items-center gap-2">
                <div className="status-online" />
                <span className="text-ios-green font-medium">就绪</span>
              </div>
            </div>
          </div>

          {/* GPU Memory */}
          <div className="mt-3 pt-3 border-t border-separator">
            <div className="flex items-center justify-between text-[12px] text-text-tertiary mb-1.5">
              <span>GPU 内存</span>
              <span className="text-text-secondary font-medium">8.2 / 24 GB</span>
            </div>
            <div className="ios-progress">
              <div className="ios-progress-bar-green" style={{ width: '34%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-[11px] text-text-quaternary">
          <span>v1.0.0</span>
          <span>iOS Design</span>
        </div>
      </div>
    </aside>
  );
}
