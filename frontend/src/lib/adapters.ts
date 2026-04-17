import type { Product, Conversation, Message } from '@/types';
import type { ApiProduct } from '@/stores/productStore';
import type { ApiChat, ApiMessage } from '@/stores/chatStore';

// ── Relative time helper ───────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Fallback avatar from name ──────────────────────────────────────
export function nameAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=128`;
}

// ── ApiProduct → Product (UI shape) ───────────────────────────────
export const adaptProduct = (p: ApiProduct): Product => ({
  id: p._id,
  title: p.title,
  price: p.price,
  image: p.images[0] || 'https://placehold.co/600x400?text=No+Image',
  category: p.category,
  location: p.location,
  postedAt: relativeTime(p.createdAt),
  condition: p.condition,
  description: p.description,
  seller: {
    id: p.sellerId._id,
    name: p.sellerId.name,
    avatar: p.sellerId.avatar || nameAvatar(p.sellerId.name),
    rating: 0,
    trades: 0,
    responseTime: 'N/A',
    location: p.sellerId.location || '',
    joinedAt: '',
  },
});

// ── ApiChat → Conversation (UI shape) ─────────────────────────────
export const adaptChat = (chat: ApiChat, myId: string): Conversation => {
  const other =
    chat.buyerId._id === myId ? chat.sellerId : chat.buyerId;
  return {
    id: chat._id,
    participant: {
      id: other._id,
      name: other.name,
      avatar: other.avatar || nameAvatar(other.name),
      rating: 0,
      trades: 0,
      responseTime: 'N/A',
      location: '',
      joinedAt: '',
    },
    product: {
      id: chat.productId._id,
      title: chat.productId.title,
      price: chat.productId.price,
      image: chat.productId.images?.[0] || 'https://placehold.co/400x300?text=No+Image',
    },
    messages: [],
    lastMessage: chat.lastMessage || 'No messages yet',
    lastMessageTime: relativeTime(chat.lastMessageAt),
    unreadCount: chat.unreadCount ?? 0,
  };
};

// ── ApiMessage → Message (UI shape) ───────────────────────────────
export const adaptMessage = (m: ApiMessage, myId: string): Message => ({
  id: m._id,
  senderId: m.senderId._id === myId ? 'me' : m.senderId._id,
  text: m.text,
  timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  isRead: m.isRead,
});
