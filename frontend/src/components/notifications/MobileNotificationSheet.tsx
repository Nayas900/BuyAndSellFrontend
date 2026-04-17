import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ShoppingBag, Tag, CheckCircle2, CheckCheck } from 'lucide-react';
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
  open: boolean;
  onClose: () => void;
}

export const MobileNotificationSheet: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const markNotificationsSeen = useBadgeStore((s) => s.markNotificationsSeen);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<{ notifications: ApiNotification[] }>('/notifications')
      .then(({ data }) => {
        setNotifications(data.notifications);
        markNotificationsSeen(user?._id);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .finally(() => setLoading(false));
  }, [open, markNotificationsSeen, user?._id]);

  const handleItemClick = (n: ApiNotification) => {
    onClose();
    if (n.productId) {
      api.patch(`/notifications/${n._id}/read`).catch(() => {});
      navigate(`/product/${n.productId}`);
    }
  };

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markNotificationsSeen(user?._id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl lg:hidden"
            style={{ maxHeight: '80vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border">
              <h2 className="font-bold text-slate-800">Notifications</h2>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-xs text-brand-600 font-medium"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 90px)' }}>
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-brand-400" />
                  </div>
                  <p className="font-semibold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No notifications yet.</p>
                </div>
              ) : (
                <div className="p-3 space-y-1 pb-8">
                  {notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleItemClick(n)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        !n.isRead ? 'bg-brand-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg(n.type)}`}>
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-slate-800 leading-snug ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{relativeTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
