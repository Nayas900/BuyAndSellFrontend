import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Camera, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import useBadgeStore from '@/stores/badgeStore';

const tabs = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
  { icon: Camera, label: 'Sell', path: '/sell' },
  { icon: Heart, label: 'Saved', path: '/saved' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadMessages = useBadgeStore((s) => s.unreadMessages);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-border shadow-bottom safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.label === 'Sell') {
            return (
              <motion.button
                key={tab.path}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(tab.path)}
                className="-mt-5 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Icon size={24} className="text-white" />
                </div>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={tab.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
            >
              <span className="relative">
                <Icon
                  size={22}
                  className={`transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {tab.label === 'Chat' && unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold text-center">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-medium transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
