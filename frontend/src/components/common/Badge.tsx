import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  variant?: 'crimson' | 'emerald' | 'subtle' | 'outline';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'crimson',
  dot = false,
  children,
  className,
}) => {
  const variantStyles = {
    crimson: 'bg-[#e50914]/10 text-[#ff4d55] border-[#e50914]/30 shadow-[0_0_12px_rgba(229,9,20,0.15)]',
    emerald: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    subtle: 'bg-[#181820] text-[#a1a1aa] border-white/10',
    outline: 'bg-transparent text-white border-white/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border tracking-wide uppercase select-none',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'emerald' ? 'bg-emerald-400' : 'bg-[#ff1e27]'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'emerald' ? 'bg-emerald-500' : 'bg-[#e50914]'
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};
