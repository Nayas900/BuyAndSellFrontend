import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, Tag, CheckCircle2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useBadgeStore from '@/stores/badgeStore';
import useAuthStore from '@/stores/authStore';

interface ApiNotification {
  _id: string;
  type: 'product_posted' | 'deal_closed' | 'new_listing';
  title: string;
  body: string;
  productId: string | null;
  isRead: boolean;
  createdAt: string;
}

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

const typeIcon = (type: ApiNotification['type']) => {
  if (type === 'product_posted') return <ShoppingBag size={15} className="text-brand-600" />;
  if (type === 'deal_closed')    return <CheckCircle2 size={15} className="text-emerald-500" />;
  return <Tag size={15} className="text-amber-500" />;
};

const typeBg = (type: ApiNotification['type']) => {
  if (type === 'product_posted') return 'bg-brand-50';
  if (type === 'deal_closed')    return 'bg-emerald-50';
  return 'bg-amber-50';
};

interface Props {
  notificationCount: number;
}

export const NotificationDropdown: React.FC<Props> = ({ notificationCount }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const markNotificationsSeen = useBadgeStore((s) => s.markNotificationsSeen);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fetchAndOpen = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const { data } = await api.get<{ notifications: ApiNotification[] }>('/notifications');
      setNotifications(data.notifications);
      // Mark all read
      markNotificationsSeen(user?._id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (n: ApiNotification) => {
    setOpen(false);
    if (n.productId) {
      api.patch(`/notifications/${n._id}/read`).catch(() => {});
      navigate(`/product/${n.productId}`);
    }
  };

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markNotificationsSeen(user?._id);
  };

  const unreadInList = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={fetchAndOpen}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          open ? 'bg-brand-50' : 'bg-surface-muted'
        }`}
      >
        <Bell size={16} className={open ? 'text-brand-600' : 'text-slate-600'} />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold text-center">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-surface-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {unreadInList > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                    <Bell size={18} className="text-brand-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No notifications yet.</p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {notifications.map((n) => (
                    <motion.button
                      key={n._id}
                      layout
                      onClick={() => handleItemClick(n)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors duration-100 ${
                        !n.isRead ? 'bg-brand-50/70 hover:bg-brand-100/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${typeBg(n.type)}`}>
                        {typeIcon(n.type)}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug text-slate-800 ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{relativeTime(n.createdAt)}</p>
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
