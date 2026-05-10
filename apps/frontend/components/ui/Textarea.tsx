'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--glass-border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:border-[var(--accent-primary)] resize-vertical',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
