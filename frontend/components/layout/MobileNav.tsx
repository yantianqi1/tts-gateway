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
      className={`fixed bottom-0 left-0 right-0 bg-material-thick backdrop-blur-ios border-t border-separator z-50 ${className}`}
    >
      <div className="flex items-center justify-around h-[83px] px-2 pb-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`
                  flex flex-col items-center gap-1 py-2 px-3
                  transition-all duration-150
                  ${isActive
                    ? 'text-ios-blue'
                    : 'text-text-tertiary'
                  }
                `}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
