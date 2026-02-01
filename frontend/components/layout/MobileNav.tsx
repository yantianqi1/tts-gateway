'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic2, Users, History, Settings } from 'lucide-react';

interface MobileNavProps {
  className?: string;
}

const navItems = [
  { href: '/studio', icon: Mic2, label: '工作室' },
  { href: '/voices', icon: Users, label: '音色库' },
  { href: '/history', icon: History, label: '历史' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export default function MobileNav({ className = '' }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 frosted-glass border-t border-white/20 z-50 ${className}`}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  flex flex-col items-center gap-1 py-2 px-3 rounded-glass-sm
                  transition-all duration-300
                  ${isActive
                    ? 'text-dopamine-accent'
                    : 'text-gray-400'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <>
                      <div className="absolute inset-0 blur-md bg-dopamine-purple/30 rounded-full" />
                      <motion.div
                        layoutId="mobileActiveIndicator"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-dopamine-purple"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-dopamine-accent' : ''}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
