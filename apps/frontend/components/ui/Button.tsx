'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-[12px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none active:scale-[0.97] hover:scale-[1.02]',
          variant === 'primary' && [
            'bg-[var(--accent-primary)] text-white',
            'hover:bg-[#4338CA] hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]',
          ],
          variant === 'secondary' && [
            'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
            'hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]',
          ],
          variant === 'ghost' && [
            'bg-transparent text-[var(--text-tertiary)]',
            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
