import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, ShoppingBag, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { MessageCard } from '@/components/cards/MessageCard';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import useChatStore from '@/stores/chatStore';
import useAuthStore from '@/stores/authStore';
import { adaptChat, adaptMessage } from '@/lib/adapters';
import type { Conversation, Message } from '@/types';

const inboxTabs = ['All', 'Archived', 'Closed'];

export const InboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { chats, isLoading, fetchChats, openChat, sendMessage, messages } = useChatStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const adapted: Conversation[] = chats.map((c) => adaptChat(c, user?._id ?? ''));

  const handleConvClick = (convId: string) => {
    if (window.innerWidth < 1024) {
      navigate(`/chat/${convId}`);
    } else {
      setActiveConvId(convId);
      openChat(convId);
    }
  };

  const activeConv = adapted.find((c) => c.id === activeConvId) ?? null;
  const activeApiChat = chats.find((c) => c._id === activeConvId) ?? null;
  const adaptedMessages: Message[] = messages.map((m) => adaptMessage(m, user?._id ?? ''));

  const handleSend = async (text: string) => {
    if (!activeConvId) return;
    await sendMessage(activeConvId, text);
  };

  return (
    <PageShell className="bg-white pb-0 lg:pb-0 lg:overflow-hidden" maxWidth="full">
      {/* Mobile header */}
      <div className="lg:hidden px-5 pt-12 pb-4 bg-white sticky top-0 z-40 border-b border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center">
            <Search size={17} className="text-slate-600" />
          </motion.button>
        </div>
        <InboxTabs activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      {/* Desktop two-pane layout */}
      <div className="hidden lg:flex h-[calc(100dvh-64px)] overflow-hidden">
        {/* Left pane */}
        <div className="w-80 xl:w-96 shrink-0 flex flex-col border-r border-surface-border bg-white">
          <div className="px-5 pt-6 pb-4 border-b border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-slate-800">Messages</h1>
              <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center">
                <Search size={16} className="text-slate-600" />
              </motion.button>
            </div>
            <InboxTabs activeTab={activeTab} onSelect={setActiveTab} />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : adapted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <p className="text-slate-500 text-sm font-medium">No conversations yet</p>
                <p className="text-slate-400 text-xs mt-1">Message a seller from a product listing</p>
              </div>
            ) : (
              adapted.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`cursor-pointer transition-colors duration-150 ${activeConvId === conv.id ? 'bg-brand-50' : ''}`}
                >
                  <MessageCard conversation={conv} onClick={() => handleConvClick(conv.id)} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="flex-1 flex flex-col bg-surface-muted overflow-hidden">
          {activeConv && activeApiChat ? (
            <DesktopConversationPane
              conv={activeConv}
              messages={adaptedMessages}
              productImage={activeApiChat.productId.images?.[0]}
              onSend={handleSend}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center">
                <Search size={24} className="text-brand-400" />
              </div>
              <p className="font-semibold text-slate-700">Select a conversation</p>
              <p className="text-sm text-slate-400">Choose from your messages on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden divide-y divide-surface-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : adapted.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <MessageCircle size={44} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No messages yet</p>
            <p className="text-sm text-slate-400 mt-1">Start a chat from any product listing</p>
          </div>
        ) : (
          adapted.map((conv, i) => (
            <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MessageCard conversation={conv} onClick={() => navigate(`/chat/${conv.id}`)} />
                </motion.div>
              ))
            )}
      </div>
    </PageShell>
  );
};

const InboxTabs: React.FC<{ activeTab: string; onSelect: (t: string) => void }> = ({ activeTab, onSelect }) => (
  <div className="flex gap-1 border-b border-surface-border -mb-4 pb-0">
    {inboxTabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onSelect(tab)}
        className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 ${activeTab === tab ? 'text-brand-600' : 'text-slate-500'}`}
      >
        {tab}
        {activeTab === tab && (
          <motion.div layoutId="inbox-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
        )}
      </button>
    ))}
  </div>
);

const DesktopConversationPane: React.FC<{
  conv: Conversation;
  messages: Message[];
  productImage?: string;
  onSend: (text: string) => Promise<void>;
}> = ({ conv, messages, productImage, onSend }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 bg-white border-b border-surface-border shadow-sm">
        <img src={conv.participant.avatar} alt={conv.participant.name} className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">{conv.participant.name}</p>
          <p className="text-xs text-emerald-500 font-medium">Active</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }}><MoreVertical size={18} className="text-slate-500" /></motion.button>
      </div>

      <div className="shrink-0 mx-4 mt-3 bg-white rounded-2xl px-3 py-2.5 flex items-center gap-3 shadow-card">
        <img
          src={productImage || conv.product.image}
          alt={conv.product.title}
          className="w-11 h-11 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ShoppingBag size={11} className="text-brand-500" />
            <p className="text-xs text-slate-500 truncate">{conv.product.title}</p>
          </div>
          <p className="font-bold text-slate-800 text-sm">₹{conv.product.price.toLocaleString('en-IN')}</p>
        </div>
        <button
          onClick={() => navigate(`/product/${conv.product.id}`)}
          className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-xl shrink-0"
        >
          View
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSend} />
    </>
  );
};
