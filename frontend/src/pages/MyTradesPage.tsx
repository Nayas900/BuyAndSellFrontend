import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import api from '@/lib/api';
import { adaptProduct } from '@/lib/adapters';
import type { ApiProduct } from '@/stores/productStore';
import type { Product } from '@/types';

type Tab = 'active' | 'closed';

export const MyTradesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('active');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<ApiProduct[]>('/products/my')
      .then(({ data }) => setProducts(data))
      .finally(() => setIsLoading(false));
  }, []);

  const active = products.filter((p) => p.isActive);
  const closed = products.filter((p) => !p.isActive);
  const list   = tab === 'active' ? active : closed;

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
        <h1 className="font-bold text-slate-800">My Trades</h1>
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
          <h1 className="font-bold text-slate-800 text-lg">My Trades</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-card">
          {(['active', 'closed'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                tab === t
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-surface-muted'
              }`}
            >
              {t === 'active' ? `Active (${active.length})` : `Closed (${closed.length})`}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-card" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Tag size={24} className="text-brand-400" />
            </div>
            <p className="font-semibold text-slate-700">
              {tab === 'active' ? 'No active listings' : 'No closed deals yet'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {tab === 'active' ? 'Post an ad to start selling.' : 'Closed deals will appear here.'}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate('/sell')}
                className="mt-5 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/25 hover:bg-brand-700 transition-colors"
              >
                Post an Ad
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((p, i) => (
              <TradeCard
                key={p._id}
                apiProduct={p}
                index={i}
                isClosed={!p.isActive}
                onClick={() => p.isActive && navigate(`/product/${p._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

interface TradeCardProps {
  apiProduct: ApiProduct;
  index: number;
  isClosed: boolean;
  onClick: () => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ apiProduct, index, isClosed, onClick }) => {
  const product: Product = adaptProduct(apiProduct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={`flex gap-3 bg-white rounded-2xl p-3 shadow-card ${
        isClosed ? 'opacity-60 cursor-default' : 'cursor-pointer hover:shadow-card-hover transition-shadow'
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={product.image}
          alt={product.title}
          className="w-20 h-20 rounded-xl object-cover"
        />
        {isClosed && (
          <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-sm truncate">{product.title}</h3>
            {isClosed && (
              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                CLOSED
              </span>
            )}
          </div>
          <p className="text-brand-600 font-bold text-base mt-0.5">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin size={11} />
            <span className="text-xs truncate">{product.location}</span>
          </div>
          <span className="text-xs text-slate-400 shrink-0">{product.postedAt}</span>
        </div>
      </div>
    </motion.div>
  );
};
