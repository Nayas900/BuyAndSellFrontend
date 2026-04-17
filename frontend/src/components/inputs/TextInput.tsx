import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  ...rest
}) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`
          w-full py-3 bg-surface-muted border border-surface-border rounded-xl text-sm
          text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
          transition-all duration-150
          ${icon ? 'pl-10' : 'pl-4'}
          ${rightIcon ? 'pr-10' : 'pr-4'}
          ${error ? 'border-red-400 focus:ring-red-300/30' : ''}
          ${className}
        `}
        {...rest}
      />
      {rightIcon && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
          {rightIcon}
        </span>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);
