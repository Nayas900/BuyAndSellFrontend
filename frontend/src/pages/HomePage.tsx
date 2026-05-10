import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, SlidersHorizontal, TrendingUp, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { SearchBar } from '@/components/inputs/SearchBar';
import { ProductCard } from '@/components/cards/ProductCard';
import { categories } from '@/data/products';
import useProductStore from '@/stores/productStore';
import useAuthStore from '@/stores/authStore';
import { adaptProduct } from '@/lib/adapters';
import appIcon from '@/assets/bc.png';
import useBadgeStore from '@/stores/badgeStore';
import { MobileNotificationSheet } from '@/components/notifications/MobileNotificationSheet';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const { products, isLoading, fetchProducts } = useProductStore();
  const user = useAuthStore((s) => s.user);
  const notificationCount = useBadgeStore((s) => s.notificationCount);

  useEffect(() => {
    const selectedCategory = categories.find((c) => c.id === activeCategory);
    const category = activeCategory === 'all' ? undefined : selectedCategory?.label;
    fetchProducts({ category });
  }, [activeCategory, fetchProducts]);

  const adapted = products.map(adaptProduct);

  return (
    <>
    <PageShell>
      {/* ── Mobile header ── */}
      <div className="lg:hidden px-4 pt-12 pb-4 bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img src={appIcon} alt="App icon" className="w-9 h-9 rounded-xl object-cover shadow-sm shadow-brand-500/20" />
            {user?.location && (
              <div className="flex items-center gap-1 text-slate-500 text-xs mb-0.5">
                <MapPin size={12} className="text-brand-500" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifSheetOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center"
            >
              <Bell size={18} className="text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold text-center">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </motion.button>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff`}
              alt=""
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl object-cover cursor-pointer"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <SearchBar className="flex-1" readOnly onFocus={() => navigate('/search')} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-500/30"
          >
            <SlidersHorizontal size={16} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* ── Desktop hero banner ── */}
      <div className="hidden lg:block px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 h-52">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-400 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">
                {products.length > 0 ? `${products.length}+ listings` : 'Loading listings…'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-1">
              Buy & sell anything,<br />
              <span className="text-brand-400">locally.</span>
            </h2>
            <p className="text-slate-400 text-sm mb-5">Kurukshetra's trusted marketplace</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/search')}
                className="px-5 py-2.5 bg-white text-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Browse Listings
              </button>
              <button
                onClick={() => navigate('/sell')}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
              >
                <Plus size={15} />
                Post Ad
              </button>
            </div>
          </div>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-2 border-white/10" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-white/5" />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 lg:px-6 pt-5">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0
                transition-all duration-150
                ${activeCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : 'bg-white text-slate-600 border border-surface-border hover:border-brand-300 hover:text-brand-600'
                }
              `}
            >
              <cat.icon size={14} />
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="lg:flex lg:gap-8 mt-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                    <div className="w-full h-36 bg-slate-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4"
                >
                  {adapted.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <ProductCard product={product} layout="grid" />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {!isLoading && adapted.length === 0 && (
              <div className="flex flex-col items-center py-24 text-center">
                <ShoppingBag size={44} className="mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">No listings yet</p>
                <p className="text-sm text-slate-400 mt-1">Be the first to post an ad!</p>
                <button
                  onClick={() => navigate('/sell')}
                  className="mt-4 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold"
                >
                  Post a Free Ad
                </button>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="font-bold text-slate-800 mb-1">Sell something today</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                List your item in under 2 minutes and reach thousands of buyers.
              </p>
              <button
                onClick={() => navigate('/sell')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/25"
              >
                <Plus size={16} />
                Post a Free Ad
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h3 className="font-bold text-slate-800 mb-3">Browse Categories</h3>
              <ul className="space-y-1">
                {categories.slice(1).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-muted transition-colors text-sm text-slate-700"
                    >
                      <cat.icon size={14} />
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>

    <MobileNotificationSheet open={notifSheetOpen} onClose={() => setNotifSheetOpen(false)} />
    </>
  );
};
