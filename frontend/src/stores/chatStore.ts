import { create } from 'zustand';
import api from '@/lib/api';
import useBadgeStore from '@/stores/badgeStore';

export interface ApiMessage {
  _id: string;
  chatId: string;
  senderId: { _id: string; name: string; avatar: string };
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiChat {
  _id: string;
  productId: { _id: string; title: string; price: number; images: string[] };
  buyerId: { _id: string; name: string; avatar: string };
  sellerId: { _id: string; name: string; avatar: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
}

interface ChatState {
  chats: ApiChat[];
  activeChat: ApiChat | null;
  messages: ApiMessage[];
  isLoading: boolean;

  fetchChats: () => Promise<void>;
  startChat: (productId: string) => Promise<ApiChat>;
  openChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
}

const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<ApiChat[]>('/chat');
      set({ chats: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  startChat: async (productId: string) => {
    const { data } = await api.post<ApiChat>('/chat/start', { productId });
    set((s) => {
      const exists = s.chats.find((c) => c._id === data._id);
      return exists ? {} : { chats: [data, ...s.chats] };
    });
    return data;
  },

  openChat: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{ chat: ApiChat; messages: ApiMessage[] }>(
        `/chat/${chatId}`
      );
      let consumedUnread = 0;
      set((s) => {
        consumedUnread = s.chats.find((c) => c._id === chatId)?.unreadCount || 0;
        return {
          activeChat: data.chat,
          messages: data.messages,
          isLoading: false,
          chats: s.chats.map((c) =>
            c._id === chatId ? { ...c, unreadCount: 0 } : c
          ),
        };
      });
      if (consumedUnread > 0) {
        useBadgeStore.getState().consumeUnread(consumedUnread);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (chatId: string, text: string) => {
    const { data } = await api.post<ApiMessage>('/chat/message', { chatId, text });
    set((s) => ({
      messages: [...s.messages, data],
      chats: s.chats.map((c) =>
        c._id === chatId ? { ...c, lastMessage: text, lastMessageAt: data.createdAt } : c
      ),
    }));
  },
}));

export default useChatStore;
