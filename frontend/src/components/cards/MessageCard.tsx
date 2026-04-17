import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import type { Conversation } from '@/types';

interface MessageCardProps {
  conversation: Conversation;
  onClick?: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ conversation, onClick }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        navigate(`/chat/${conversation.id}`);
      }}
      className="flex items-center gap-3 bg-white px-4 py-3.5 cursor-pointer hover:bg-surface-muted transition-colors duration-150"
    >
      <div className="relative">
        <Avatar src={conversation.participant.avatar} name={conversation.participant.name} size="md" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 text-sm truncate">
            {conversation.participant.name}
          </span>
          <span className="text-xs text-slate-400 shrink-0">{conversation.lastMessageTime}</span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{conversation.lastMessage}</p>
      </div>

      {conversation.unreadCount > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </motion.div>
  );
};
