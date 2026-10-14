'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark border-transparent shadow-sm',
  secondary: 'bg-white text-gray-700 border-border hover:bg-gray-50 shadow-sm',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100',
  danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  accent: 'bg-accent text-gray-900 border-accent-dark hover:bg-accent-dark shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-xl',
};

export function Button({
  className, variant = 'primary', size = 'md', loading, disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow" />
      )}
      {children}
    </button>
  );
}
