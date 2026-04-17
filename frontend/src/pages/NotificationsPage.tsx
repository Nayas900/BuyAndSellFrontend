import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShoppingBag, Tag, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
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
  if (type === 'product_posted') return <ShoppingBag size={16} className="text-brand-600" />;
  if (type === 'deal_closed')    return <CheckCircle2 size={16} className="text-emerald-500" />;
  return <Tag size={16} className="text-amber-500" />;
};

const typeBg = (type: ApiNotification['type']) => {
  if (type === 'product_posted') return 'bg-brand-50';
  if (type === 'deal_closed')    return 'bg-emerald-50';
  return 'bg-amber-50';
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const markNotificationsSeen = useBadgeStore((s) => s.markNotificationsSeen);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ notifications: ApiNotification[] }>('/notifications')
      .then(({ data }) => setNotifications(data.notifications))
      .finally(() => setIsLoading(false));

    // Mark all read when page opens
    markNotificationsSeen(user?._id);
  }, [markNotificationsSeen, user?._id]);

  const handleClick = (n: ApiNotification) => {
    if (n.productId) {
      // Mark single as read then navigate
      api.patch(`/notifications/${n._id}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
      );
      navigate(`/product/${n.productId}`);
    }
  };

  return (
    <PageShell className="bg-surface-muted">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-surface-border sticky top-0 z-40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </motion.button>
        <h1 className="font-bold text-slate-800">Notifications</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 lg:py-10">
        {/* Desktop heading */}
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="font-bold text-slate-800 text-lg">Notifications</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-card" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Bell size={24} className="text-brand-400" />
            </div>
            <p className="font-semibold text-slate-700">No notifications yet</p>
            <p className="text-sm text-slate-400 mt-1">
              You'll see updates here when you post or close a deal.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-3 p-4 rounded-2xl shadow-card transition-colors duration-150 ${
                  n.productId ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                } ${n.isRead ? 'bg-white' : 'bg-brand-50/60'}`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg(n.type)}`}>
                  {typeIcon(n.type)}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold text-slate-800 ${!n.isRead ? 'font-bold' : ''}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{relativeTime(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};
