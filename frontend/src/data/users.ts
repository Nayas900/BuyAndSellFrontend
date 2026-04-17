import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Rahul Sharma',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 4.8,
    trades: 312,
    responseTime: '15m',
    location: 'Kolkata, WB',
    joinedAt: '2022-03-10',
  },
  {
    id: 'u2',
    name: 'Priya Das',
    avatar: 'https://i.pravatar.cc/150?img=47',
    rating: 4.6,
    trades: 178,
    responseTime: '30m',
    location: 'Howrah, WB',
    joinedAt: '2023-01-05',
  },
  {
    id: 'u3',
    name: 'Amit Roy',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 4.9,
    trades: 520,
    responseTime: '10m',
    location: 'Salt Lake, WB',
    joinedAt: '2021-08-20',
  },
  {
    id: 'u4',
    name: 'Sneha Ghosh',
    avatar: 'https://i.pravatar.cc/150?img=25',
    rating: 4.3,
    trades: 95,
    responseTime: '1h',
    location: 'Dum Dum, WB',
    joinedAt: '2023-06-15',
  },
  {
    id: 'u5',
    name: 'Debashis Mondal',
    avatar: 'https://i.pravatar.cc/150?img=52',
    rating: 4.7,
    trades: 425,
    responseTime: '20m',
    location: 'Barasat, WB',
    joinedAt: '2022-11-01',
  },
];

export const currentUser = mockUsers[4];
