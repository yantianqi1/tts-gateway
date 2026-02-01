'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic2, Users, History, Settings } from 'lucide-react';

interface MobileNavProps {
  className?: string;
}

const navItems = [
  { href: '/studio', icon: Mic2, label: 'Studio' },
  { href: '/voices', icon: Users, label: 'Voices' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Config' },
];

export default function MobileNav({ className = '' }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-cyber-bg-secondary/90 backdrop-blur-xl border-t border-neon-purple/10 z-50 ${className}`}
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
                  flex flex-col items-center gap-1 py-2 px-3 rounded-md
                  transition-all duration-300
                  ${isActive
                    ? 'text-neon-purple'
                    : 'text-zinc-500'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <>
                      <div className="absolute inset-0 blur-md bg-neon-purple/50 rounded-full" />
                      <motion.div
                        layoutId="mobileActiveIndicator"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-purple"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </>
                  )}
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-wider ${isActive ? 'text-neon-purple' : ''}`}>
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
