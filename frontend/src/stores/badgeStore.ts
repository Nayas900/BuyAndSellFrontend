import { create } from 'zustand';
import api from '@/lib/api';

interface ChatBadgeItem {
  unreadCount?: number;
}

interface BadgeState {
  unreadMessages: number;
  notificationCount: number;
  refreshBadges: (userId?: string) => Promise<void>;
  markNotificationsSeen: (userId?: string) => void;
  consumeUnread: (amount: number) => void;
}

const useBadgeStore = create<BadgeState>((set) => ({
  unreadMessages: 0,
  notificationCount: 0,

  refreshBadges: async (userId?: string) => {
    let unreadMessages = 0;
    let notificationCount = 0;

    if (userId) {
      // Unread chat messages
      try {
        const { data } = await api.get<ChatBadgeItem[]>('/chat');
        unreadMessages = data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      } catch {
        unreadMessages = 0;
      }

      // Unread notifications
      try {
        const { data } = await api.get<{ unreadCount: number }>('/notifications');
        notificationCount = data.unreadCount;
      } catch {
        notificationCount = 0;
      }
    }

    set({ unreadMessages, notificationCount });
  },

  markNotificationsSeen: async (userId?: string) => {
    set({ notificationCount: 0 });
    if (userId) {
      try {
        await api.patch('/notifications/read-all');
      } catch {
        // Non-critical
      }
    }
  },

  consumeUnread: (amount: number) => {
    if (amount <= 0) return;
    set((s) => ({ unreadMessages: Math.max(0, s.unreadMessages - amount) }));
  },
}));

export default useBadgeStore;
