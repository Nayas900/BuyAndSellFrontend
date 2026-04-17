import React, { useState } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 flex items-end gap-2 px-4 py-3 bg-white border-t border-surface-border safe-bottom">
      <button className="text-slate-400 hover:text-slate-600 p-1 transition-colors">
        <Paperclip size={20} />
      </button>
      <div className="flex-1 relative">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full pl-4 pr-10 py-2.5 bg-surface-muted border border-surface-border rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all duration-150 leading-5 max-h-28"
          style={{ scrollbarWidth: 'none' }}
        />
        <button className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600 transition-colors">
          <Smile size={18} />
        </button>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSend}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150 ${
          value.trim() ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'bg-slate-100 text-slate-400'
        }`}
      >
        <Send size={18} />
      </motion.button>
    </div>
  );
};
