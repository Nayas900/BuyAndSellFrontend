import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import useAuthStore from '@/stores/authStore';
import useSavedStore from '@/stores/savedStore';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const savedProducts = useSavedStore((s) => s.savedProducts);
  const ensureUser = useSavedStore((s) => s.ensureUser);
  const clearActive = useSavedStore((s) => s.clearActive);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);

  React.useEffect(() => {
    if (user?._id) ensureUser(user._id);
    else clearActive();
  }, [user?._id, ensureUser, clearActive]);

  const isOwner = user?._id === product.seller.id;
  const liked = !!user && savedProducts.some((p) => p.id === product.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isOwner) return;
    toggleSaved(user._id, product);
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="flex gap-3 bg-white rounded-2xl p-3 shadow-card cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-24 h-24 rounded-xl object-cover shrink-0"
        />
        <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
          <div>
            <p className="text-xs text-slate-400">{product.postedAt}</p>
            <h3 className="font-semibold text-slate-800 text-sm truncate mt-0.5">{product.title}</h3>
            <p className="text-brand-600 font-bold text-base mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin size={11} />
            <span className="text-xs truncate">{product.location}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm ${
            isOwner ? 'bg-white/60 cursor-not-allowed' : 'bg-white/80'
          }`}
          disabled={isOwner}
          aria-label={isOwner ? 'You cannot save your own listing' : liked ? 'Remove from saved' : 'Save listing'}
        >
          <Heart
            size={14}
            className={isOwner ? 'text-slate-300' : liked ? 'fill-red-500 text-red-500' : 'text-slate-500'}
          />
        </motion.button>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-slate-800 text-sm truncate">{product.title}</h3>
        <p className="text-brand-600 font-bold text-base mt-0.5">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-slate-400">
          <MapPin size={11} />
          <span className="text-xs truncate">{product.location}</span>
          <span className="ml-auto text-xs text-slate-400">{product.postedAt}</span>
        </div>
      </div>
    </motion.div>
  );
};
