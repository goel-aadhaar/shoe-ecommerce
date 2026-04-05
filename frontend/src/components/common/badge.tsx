import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'destructive' | 'outline' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
  const variants = {
    default: "bg-brown-800 text-cream hover:bg-brown-900 border border-transparent",
    success: "bg-green-600 text-white border border-transparent",
    destructive: "bg-red-600 text-white border border-transparent",
    outline: "text-brown-800 border border-brown-300 hover:bg-brown-50",
    accent: "bg-copper text-white shadow-sm border border-transparent hover:bg-sienna",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
