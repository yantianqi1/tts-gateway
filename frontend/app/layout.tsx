'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import CyberBackground from '@/components/layout/CyberBackground';
import MobileNav from '@/components/layout/MobileNav';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="zh-CN">
      <head>
        <title>TTS Gateway - Cyberpunk Voice Studio</title>
        <meta name="description" content="Unified TTS Gateway with Qwen3-TTS and IndexTTS 2.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <CyberBackground />
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex" />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
              <div className="relative z-10 min-h-screen">
                {children}
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav className="lg:hidden" />
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
