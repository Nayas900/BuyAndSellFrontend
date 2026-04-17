import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  onFocus?: () => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'What are you looking for?',
  value,
  onChange,
  onFocus,
  readOnly,
  autoFocus,
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    <input
      type="text"
      readOnly={readOnly}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-150"
    />
  </div>
);
