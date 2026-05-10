'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--glass-border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:border-[var(--accent-primary)]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
