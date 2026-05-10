'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover = true, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] p-5 transition-all duration-200',
        glass
          ? 'glass-card'
          : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)]',
        hover && 'hover:border-[rgba(79,70,229,0.25)] hover:shadow-[var(--shadow-glow)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
