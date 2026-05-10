import React, { useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import useChatStore from '@/stores/chatStore';
import useAuthStore from '@/stores/authStore';
import { adaptChat, adaptMessage } from '@/lib/adapters';

export const ConversationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { openChat, sendMessage, activeChat, messages, isLoading } = useChatStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (id) openChat(id);
  }, [id, openChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!id) return;
    await sendMessage(id, text);
  };

  const myId = user?._id || (user as any)?.id || '';
  const adapted = activeChat ? adaptChat(activeChat, myId) : null;

  const adaptedMessages = (messages || []).map((m) => adaptMessage(m, myId));

  if (isLoading && !activeChat) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-surface-muted overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-surface-border animate-pulse">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="w-9 h-9 rounded-full bg-slate-200" />
          <div className="h-4 bg-slate-200 rounded w-32" />
        </div>
        <div className="flex-1 px-4 py-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="h-10 w-48 bg-slate-200 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-surface-muted overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-surface-border shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </motion.button>

        {adapted && (
          <>
            <img
              src={adapted.participant.avatar}
              alt={adapted.participant.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm leading-tight">{adapted.participant.name}</p>
              <p className="text-xs text-emerald-500 font-medium">Active</p>
            </div>
          </>
        )}

        <motion.button whileTap={{ scale: 0.9 }}>
          <MoreVertical size={20} className="text-slate-500" />
        </motion.button>
      </div>

      {/* Product banner */}
      {adapted && (
        <div className="shrink-0 mx-4 mt-3 bg-white rounded-2xl px-3 py-2.5 flex items-center gap-3 shadow-card">
          <img
            src={adapted.product.image}
            alt={adapted.product.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShoppingBag size={12} className="text-brand-500" />
              <p className="text-xs text-slate-500 truncate">{adapted.product.title}</p>
            </div>
            <p className="font-bold text-slate-800">₹{adapted.product.price.toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={() => navigate(`/product/${adapted.product.id}`)}
            className="px-4 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-xl shrink-0 shadow-sm shadow-brand-500/30"
          >
            View
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {adaptedMessages.length === 0 && !isLoading && (
          <p className="text-center text-xs text-slate-400 py-8">No messages yet. Start the conversation.</p>
        )}
        {adaptedMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
};
