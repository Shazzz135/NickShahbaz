import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg cursor-pointer select-none overflow-hidden';
    
    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2.5',
    };

    const variantStyles = {
      primary: 'bg-[#e50914] hover:bg-[#ff1e27] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(255,30,39,0.7)] border border-[#ff3b44]/40 active:scale-95',
      secondary: 'bg-[#141419] hover:bg-[#1c1c24] text-white border border-white/10 hover:border-white/25 active:scale-95',
      outline: 'bg-transparent text-white border border-[#e50914]/60 hover:border-[#ff1e27] hover:bg-[#e50914]/10 shadow-[0_0_15px_rgba(229,9,20,0.2)] active:scale-95',
      ghost: 'bg-transparent text-[#94949e] hover:text-white hover:bg-white/5 active:scale-95',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
