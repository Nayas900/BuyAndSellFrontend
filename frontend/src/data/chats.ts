import type { Conversation } from '@/types';
import { mockUsers } from './users';
import { mockProducts } from './products';

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participant: mockUsers[0],
    product: { id: mockProducts[0].id, title: mockProducts[0].title, price: mockProducts[0].price, image: mockProducts[0].image },
    lastMessage: 'Hey, would you be interested in...',
    lastMessageTime: '24m ago',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey, thanks for the interest in my drone. What would you like to know?', timestamp: '10:10 AM', isRead: true },
      { id: 'm2', senderId: 'me', text: 'Nice meeting you, Rahul. I\'m interested and would love to know more about the drone. Is it still under warranty? Do you have the bills and stuff?', timestamp: '10:12 AM', isRead: true },
      { id: 'm3', senderId: 'u1', text: 'For sure, my man. I do have them all. It was bought last year, 24th Mar and still has warranty.', timestamp: '10:15 AM', isRead: false },
      { id: 'm4', senderId: 'u1', text: 'Would you like to meet this weekend to check it out?', timestamp: '10:16 AM', isRead: false },
    ],
  },
  {
    id: 'c2',
    participant: mockUsers[1],
    product: { id: mockProducts[2].id, title: mockProducts[2].title, price: mockProducts[2].price, image: mockProducts[2].image },
    lastMessage: 'How about PayPal? Let me kn...',
    lastMessageTime: '40m ago',
    unreadCount: 1,
    messages: [
      { id: 'm5', senderId: 'me', text: 'Hi! Is the chair still available?', timestamp: '9:45 AM', isRead: true },
      { id: 'm6', senderId: 'u2', text: 'Yes it is! Come check it anytime.', timestamp: '9:50 AM', isRead: true },
      { id: 'm7', senderId: 'u2', text: 'How about PayPal? Let me know if that works for you.', timestamp: '9:55 AM', isRead: false },
    ],
  },
  {
    id: 'c3',
    participant: mockUsers[2],
    product: { id: mockProducts[4].id, title: mockProducts[4].title, price: mockProducts[4].price, image: mockProducts[4].image },
    lastMessage: 'My final price would be 5k. Not m...',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    messages: [
      { id: 'm8', senderId: 'u3', text: 'My final price would be 5k. Not moving further on this.', timestamp: '9:00 AM', isRead: true },
      { id: 'm9', senderId: 'me', text: 'Okay let me think about it.', timestamp: '9:05 AM', isRead: true },
    ],
  },
  {
    id: 'c4',
    participant: mockUsers[3],
    product: { id: mockProducts[3].id, title: mockProducts[3].title, price: mockProducts[3].price, image: mockProducts[3].image },
    lastMessage: "Let's do this. Meet me at Starbucks...",
    lastMessageTime: '3d ago',
    unreadCount: 0,
    messages: [
      { id: 'm10', senderId: 'me', text: 'Can we meet at Starbucks in Park Street?', timestamp: 'Mon', isRead: true },
      { id: 'm11', senderId: 'u4', text: "Let's do this. Meet me at Starbucks Park Street at 4PM.", timestamp: 'Mon', isRead: true },
    ],
  },
  {
    id: 'c5',
    participant: mockUsers[1],
    product: { id: mockProducts[6].id, title: mockProducts[6].title, price: mockProducts[6].price, image: mockProducts[6].image },
    lastMessage: 'Was great dealing with you. Thanks!',
    lastMessageTime: '5d ago',
    unreadCount: 0,
    messages: [
      { id: 'm12', senderId: 'u2', text: 'Was great dealing with you. Thanks!', timestamp: 'Sat', isRead: true },
      { id: 'm13', senderId: 'me', text: 'Same here! Smooth transaction.', timestamp: 'Sat', isRead: true },
    ],
  },
];
