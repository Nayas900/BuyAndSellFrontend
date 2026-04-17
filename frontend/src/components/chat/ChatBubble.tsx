import React from 'react';
import { CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
      <div
        className={`
          px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-white text-slate-800 shadow-card rounded-bl-md'
          }
        `}
      >
        {message.text}
      </div>
      <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <span className="text-[10px] text-slate-400">{message.timestamp}</span>
        {isOwn && (
          <CheckCheck
            size={12}
            className={message.isRead ? 'text-brand-500' : 'text-slate-400'}
          />
        )}
      </div>
    </div>
  </motion.div>
);
