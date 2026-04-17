import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Star, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/cards/ProductCard';
import api from '@/lib/api';
import { adaptProduct, nameAvatar } from '@/lib/adapters';
import useAuthStore from '@/stores/authStore';
import useChatStore from '@/stores/chatStore';
import useSavedStore from '@/stores/savedStore';
import useProductStore, { type ApiProduct } from '@/stores/productStore';
import type { Product } from '@/types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const closeDeal = useProductStore((s) => s.closeDeal);
  const startChat = useChatStore((s) => s.startChat);
  const savedProducts = useSavedStore((s) => s.savedProducts);
  const ensureSavedUser = useSavedStore((s) => s.ensureUser);
  const clearSavedActive = useSavedStore((s) => s.clearActive);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);

  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (user?._id) ensureSavedUser(user._id);
    else clearSavedActive();
  }, [user?._id, ensureSavedUser, clearSavedActive]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setExpanded(false);

    api.get<ApiProduct>(`/products/${id}`)
      .then(({ data }) => {
        setApiProduct(data);
        // Fetch related products from same category
        return api.get<{ products: ApiProduct[] }>('/products', {
          params: { category: data.category, limit: 4 },
        });
      })
      .then(({ data }) => {
        setRelated(
          data.products
            .filter((p) => p._id !== id)
            .slice(0, 4)
            .map(adaptProduct)
        );
      })
      .catch(() => navigate('/'))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleCloseDeal = async () => {
    if (!apiProduct) return;
    setCloseLoading(true);
    try {
      await closeDeal(apiProduct._id);
      setClosed(true);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) { navigate('/login'); return; }
    if (!apiProduct) return;
    setChatLoading(true);
    try {
      const chat = await startChat(apiProduct._id);
      navigate(`/chat/${chat._id}`);
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell className="bg-surface-muted">
        <div className="px-4 pt-12 space-y-4 animate-pulse">
          <div className="w-full h-72 bg-slate-200 rounded-2xl" />
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-20 bg-slate-200 rounded" />
        </div>
      </PageShell>
    );
  }

  if (!apiProduct) return null;

  const product = adaptProduct(apiProduct);
  const isOwner = user?._id === apiProduct.sellerId._id;
  const liked = !!user && savedProducts.some((p) => p.id === product.id);

  const handleToggleSaved = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isOwner) return;
    toggleSaved(user._id, product);
  };

  return (
    <PageShell hideTabBar={false} className="bg-surface-muted">
      {/* Mobile back */}
      <div className="lg:hidden flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-surface-border">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </motion.button>
        <span className="font-semibold text-slate-800 text-sm truncate flex-1">{product.title}</span>
      </div>

      {/* Desktop breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 px-6 pt-6 pb-2 text-xs text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-brand-600 transition-colors">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate('/search')} className="hover:text-brand-600 transition-colors">{product.category}</button>
        <ChevronRight size={12} />
        <span className="text-slate-600 truncate max-w-xs">{product.title}</span>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] lg:gap-8 lg:px-6 lg:pb-10">
        {/* Left: images + related */}
        <div>
          <div className="relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-72 lg:h-[420px] lg:rounded-2xl object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="hidden lg:flex w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center"
              >
                <ArrowLeft size={18} className="text-white" />
              </motion.button>
              <div className="flex gap-2 ml-auto">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <Share2 size={16} className="text-white" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleToggleSaved}
                  className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center ${
                    isOwner ? 'bg-black/20 cursor-not-allowed' : 'bg-black/30'
                  }`}
                  disabled={isOwner}
                  aria-label={isOwner ? 'You cannot save your own listing' : liked ? 'Remove from saved' : 'Save listing'}
                >
                  <Heart size={16} className={isOwner ? 'text-slate-300' : liked ? 'fill-red-500 text-red-500' : 'text-white'} />
                </motion.button>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="hidden lg:block mt-8">
              <h3 className="font-bold text-slate-800 mb-4">Similar Listings</h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {related.map((p) => <ProductCard key={p.id} product={p} layout="grid" />)}
              </div>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="bg-white lg:rounded-2xl lg:shadow-card lg:self-start lg:sticky lg:top-24">
          <div className="px-5 pt-5 pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="blue">{product.category}</Badge>
                  <Badge variant="green">{product.condition}</Badge>
                </div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">{product.title}</h1>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-brand-600">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs">
              <MapPin size={12} className="text-brand-500" />
              <span>{product.location}</span>
              <span>•</span>
              <span>{product.postedAt}</span>
            </div>

            <div className="mt-5">
              <h2 className="font-semibold text-slate-700 text-sm mb-2">Description</h2>
              <p className={`text-slate-500 text-sm leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
                {product.description}
              </p>
              {!expanded && (
                <button onClick={() => setExpanded(true)} className="text-brand-600 text-xs font-medium mt-1 hover:underline">
                  Read More
                </button>
              )}
            </div>

            {/* Seller */}
            <div className="mt-5 bg-surface-muted rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={product.seller.avatar || nameAvatar(product.seller.name)}
                  name={product.seller.name}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{product.seller.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-400">Seller</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={11} className="text-emerald-500" />
                    <span className="text-xs text-slate-500">Verified seller</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            {!isOwner && (
              <div className="flex gap-3 mt-5">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleMessage}
                  disabled={chatLoading}
                >
                  {chatLoading ? 'Opening…' : 'Message'}
                </Button>
              </div>
            )}
            {isOwner && (
              <div className="mt-5">
                {closed ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-medium">Deal closed — listing removed</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={handleCloseDeal}
                    disabled={closeLoading}
                    className="border-red-200 text-red-500 hover:bg-red-50"
                  >
                    {closeLoading ? 'Closing…' : 'Close Deal'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related — mobile */}
      {related.length > 0 && (
        <div className="lg:hidden px-4 mt-6 mb-4">
          <h3 className="font-bold text-slate-800 mb-3">Similar Listings</h3>
          <div className="grid grid-cols-2 gap-3">
            {related.map((p) => <ProductCard key={p.id} product={p} layout="grid" />)}
          </div>
        </div>
      )}

      {/* Mobile bottom CTA */}
      {!isOwner && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border px-5 py-4 safe-bottom z-40">
          <div className="max-w-lg mx-auto">
            <Button variant="outline" size="lg" className="flex-1" onClick={handleMessage} disabled={chatLoading}>
              {chatLoading ? 'Opening…' : 'Message'}
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
};
