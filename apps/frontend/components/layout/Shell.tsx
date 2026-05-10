'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/projects', label: '项目' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.75)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--text-primary)] no-underline">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.3)]">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-semibold text-base">明睿创作</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm rounded-[var(--radius-md)] transition-colors duration-150',
                  pathname === item.href
                    ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
