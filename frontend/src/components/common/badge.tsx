import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'destructive' | 'outline' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 transition-colors';

  const variants: Record<BadgeVariant, string> = {
    default: 'bg-ink text-bone',
    success: 'bg-cobalt text-white',
    destructive: 'bg-destructive text-white',
    outline: 'border border-ink/40 text-ink',
    accent: 'bg-volt text-ink',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
