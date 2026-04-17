import React, { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/cards/ProductCard';
import useAuthStore from '@/stores/authStore';
import useSavedStore from '@/stores/savedStore';

export const SavedPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const savedProducts = useSavedStore((s) => s.savedProducts);
  const ensureUser = useSavedStore((s) => s.ensureUser);
  const clearActive = useSavedStore((s) => s.clearActive);

  useEffect(() => {
    if (user?._id) ensureUser(user._id);
    else clearActive();
  }, [user?._id, ensureUser, clearActive]);

  return (
    <PageShell className="bg-surface-muted">
      <div className="px-4 lg:px-6 pt-12 lg:pt-6 pb-6">
        <div className="mb-5">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Saved</h1>
          <p className="text-sm text-slate-500 mt-1">Your liked products are stored here.</p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-card">
            <Heart size={44} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No saved products yet</p>
            <p className="text-sm text-slate-400 mt-1">Tap the heart icon on listings to save them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} layout="grid" />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};
