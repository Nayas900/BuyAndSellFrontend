export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  location: string;
  postedAt: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  description: string;
  seller: User;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  trades: number;
  responseTime: string;
  location: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  product: Pick<Product, 'id' | 'title' | 'price' | 'image'>;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

import type { LucideIcon } from 'lucide-react';

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
};
