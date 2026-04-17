import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700',
  secondary: 'bg-brand-50 text-brand-600 hover:bg-brand-100',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  onClick,
  disabled,
  type = 'button',
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2 font-semibold rounded-xl
      transition-colors duration-150 select-none cursor-pointer
      ${variants[variant]} ${sizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
  >
    {children}
  </motion.button>
);
