import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Home, MessageCircle, Heart, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/inputs/SearchBar';
import useAuthStore from '@/stores/authStore';
import { nameAvatar } from '@/lib/adapters';
import appIcon from '@/assets/bc.png';
import useBadgeStore from '@/stores/badgeStore';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const navLinks = [
  { icon: Home,          label: 'Home',     path: '/' },
  { icon: MessageCircle, label: 'Messages', path: '/chat' },
  { icon: Heart,         label: 'Saved',    path: '/saved' },
  { icon: User,          label: 'Profile',  path: '/profile' },
];

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const unreadMessages = useBadgeStore((s) => s.unreadMessages);
  const notificationCount = useBadgeStore((s) => s.notificationCount);
  const refreshBadges = useBadgeStore((s) => s.refreshBadges);

  const avatar = user?.avatar || nameAvatar(user?.name || 'U');

  useEffect(() => {
    refreshBadges(user?._id);
    const interval = setInterval(() => {
      refreshBadges(user?._id);
    }, 15000);
    return () => clearInterval(interval);
  }, [user?._id, refreshBadges]);

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-border shadow-sm h-16 items-center">
      <div className="w-full px-6 flex items-center gap-6">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="shrink-0">
          <img src={appIcon} alt="App icon" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-brand-500/20" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-lg">
          <SearchBar
            value={query}
            onChange={setQuery}
            onFocus={() => navigate('/search')}
            placeholder="Search products, categories..."
          />
        </div>

        {/* Nav links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="relative">
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label === 'Messages' && unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold text-center">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={() => navigate('/search')}
            className="xl:hidden w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center"
          >
            <Search size={16} className="text-slate-600" />
          </button>

          <NotificationDropdown notificationCount={notificationCount} />

          {user ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/sell')}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors"
            >
              <Plus size={16} />
              Sell Now
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors"
            >
              Sign In
            </motion.button>
          )}

          <button onClick={() => navigate(user ? '/profile' : '/login')}>
            <img
              src={avatar}
              alt={user?.name || 'Sign in'}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-surface-border hover:ring-brand-400 transition-all"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
