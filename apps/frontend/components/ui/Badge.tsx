import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
  accent: 'bg-[var(--accent-glow)] text-[var(--accent-primary)]',
  success: 'bg-[rgba(34,197,94,0.12)] text-[var(--success)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[var(--warning)]',
  error: 'bg-[rgba(239,68,68,0.12)] text-[var(--error)]',
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
