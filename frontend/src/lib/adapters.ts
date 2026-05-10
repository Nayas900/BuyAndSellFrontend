import type { Product, Conversation, Message } from '@/types';
import type { ApiProduct } from '@/stores/productStore';
import type { ApiMessage } from '@/stores/chatStore';

// ── Relative time helper ───────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// ── Fallback avatar ───────────────────────────────
export function nameAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=2563eb&color=fff&size=128`;
}

// ── ApiProduct → Product ──────────────────────────
export const adaptProduct = (p: ApiProduct): Product => ({
  id: p._id,
  title: p.title,
  price: p.price,
  image: p.images?.[0] || 'https://placehold.co/600x400?text=No+Image',
  category: p.category,
  location: p.location,
  postedAt: relativeTime(p.createdAt),
  condition: p.condition,
  description: p.description,

  seller: p.sellerId
    ? {
        id: p.sellerId._id,
        name: p.sellerId.name,
        avatar:
          p.sellerId.avatar || nameAvatar(p.sellerId.name),
        rating: 0,
        trades: 0,
        responseTime: 'N/A',
        location: p.sellerId.location || '',
        joinedAt: '',
      }
    : {
        id: 'unknown',
        name: 'Unknown Seller',
        avatar: nameAvatar('Unknown'),
        rating: 0,
        trades: 0,
        responseTime: 'N/A',
        location: '',
        joinedAt: '',
      },
});

// ── ApiChat → Conversation ────────────────────────
export const adaptChat = (chat: any, myId: string): Conversation => {
  if (!chat) return null as any;

  const buyer = chat.buyerId || {};
  const seller = chat.sellerId || {};

  const other =
    buyer?._id === myId ? seller : buyer;

  return {
    id: chat._id,

    participant: {
      id: other?._id || '',
      name: other?.name || 'Unknown',
      avatar:
        other?.avatar ||
        nameAvatar(other?.name || 'User'),
      rating: 0,
      trades: 0,
      responseTime: 'N/A',
      location: '',
      joinedAt: '',
    },

    product: {
      id: chat.productId?._id || '',
      title: chat.productId?.title || 'Unknown',
      price: chat.productId?.price || 0,
      image:
        chat.productId?.images?.[0] ||
        'https://placehold.co/400x300?text=No+Image',
    },

    messages: [],

    lastMessage: chat.lastMessage || 'No messages yet',

    lastMessageTime: chat.lastMessageAt
      ? relativeTime(chat.lastMessageAt)
      : '',

    unreadCount: chat.unreadCount ?? 0,
  };
};
// ── ApiMessage → Message ──────────────────────────
export const adaptMessage = (m: ApiMessage, myId: string): Message => ({
  id: m._id,

  senderId: m.senderId?._id === myId ? 'me' : 'other',

  text: m.text,

  timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }),

  isRead: m.isRead,
});
