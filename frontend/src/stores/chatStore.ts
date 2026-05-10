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

  // ✅ FETCH CHATS (SAFE + FLEXIBLE)
  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<any[]>('/chat');

      const chats: ApiChat[] = (data || []).map((item) => ({
        _id: item._id || item.id,
        productId: item.productId || {},
        buyerId: item.buyerId || {},
        sellerId: item.sellerId || {},
        lastMessage: item.lastMessage || '',
        lastMessageAt: item.lastMessageAt || new Date().toISOString(),
        unreadCount: item.unreadCount || 0,
      }));

      set({ chats, isLoading: false });
    } catch (err) {
      console.error("❌ fetchChats error:", err);
      set({ isLoading: false });
    }
  },

  // ✅ START CHAT (ID SAFE)
  startChat: async (productId: string) => {
    const { data } = await api.post<any>('/chat/start', { productId });

    const chat: ApiChat = {
      ...data,
      _id: data._id || data.id,
    };

    set((s) => {
      const exists = s.chats.find((c) => c._id === chat._id);
      return exists ? {} : { chats: [chat, ...s.chats] };
    });

    return chat;
  },

  // ✅ OPEN CHAT (SAFE ARRAY + UNREAD FIX)
  openChat: async (chatId: string) => {
    set({ isLoading: true });

    try {
      const { data } = await api.get<any>(`/chat/${chatId}`);

      // 🔥 backend returns List<Map> → normalize
      const messages: ApiMessage[] = Array.isArray(data)
        ? data.map((m) => ({
            _id: m._id,
            chatId: m.chatId,
            text: m.text,
            isRead: m.isRead,
            createdAt: m.createdAt,
            senderId:
              typeof m.senderId === 'object'
                ? m.senderId
                : { _id: m.senderId, name: '', avatar: '' },
          }))
        : [];

      let consumedUnread = 0;

      set((s) => {
        consumedUnread =
          s.chats.find((c) => c._id === chatId)?.unreadCount || 0;

        return {
          activeChat: s.chats.find((c) => c._id === chatId) || null,
          messages,
          isLoading: false,
          chats: s.chats.map((c) =>
            c._id === chatId ? { ...c, unreadCount: 0 } : c
          ),
        };
      });

      if (consumedUnread > 0) {
        useBadgeStore.getState().consumeUnread(consumedUnread);
      }
    } catch (err) {
      console.error("❌ openChat error:", err);
      set({ isLoading: false });
    }
  },

  // ✅ SEND MESSAGE (FULLY SAFE)
  sendMessage: async (chatId: string, text: string) => {
    try {
      const { data } = await api.post<any>('/chat/message', { chatId, text });

      const formatted: ApiMessage = {
        _id: data._id,
        chatId: data.chatId,
        text: data.text,
        isRead: data.isRead,
        createdAt: data.createdAt,
        senderId:
          typeof data.senderId === 'object'
            ? data.senderId
            : { _id: data.senderId, name: '', avatar: '' },
      };

      set((s) => ({
        messages: [...(s.messages || []), formatted],
        chats: s.chats.map((c) =>
          c._id === chatId
            ? {
                ...c,
                lastMessage: text,
                lastMessageAt: data.createdAt,
              }
            : c
        ),
      }));
    } catch (err) {
      console.error("❌ sendMessage error:", err);
    }
  },
}));

export default useChatStore;