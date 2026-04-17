import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, SlidersHorizontal, LayoutGrid, List, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { SearchBar } from '@/components/inputs/SearchBar';
import { ProductCard } from '@/components/cards/ProductCard';
import { categories } from '@/data/products';
import useProductStore from '@/stores/productStore';
import { adaptProduct } from '@/lib/adapters';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeCategory, setActiveCategory] = useState('all');

  const { products, total, isLoading, fetchProducts } = useProductStore();

  const doSearch = useCallback(() => {
    const selectedCategory = categories.find((c) => c.id === activeCategory);
    fetchProducts({
      search: query || undefined,
      category: activeCategory === 'all' ? undefined : selectedCategory?.label,
    });
  }, [query, activeCategory, fetchProducts]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(doSearch, 350);
    return () => clearTimeout(t);
  }, [doSearch]);

  const results = products.map(adaptProduct);

  return (
    <PageShell>
      {/* Sticky search header */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-4 bg-white sticky top-0 lg:top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="lg:hidden w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-slate-700" />
          </motion.button>
          <SearchBar
            className="flex-1"
            value={query}
            onChange={setQuery}
            autoFocus
            placeholder="Search products, categories..."
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-surface-muted border border-surface-border rounded-xl flex items-center justify-center shrink-0"
          >
            <SlidersHorizontal size={16} className="text-slate-600" />
          </motion.button>
          <div className="hidden lg:flex items-center gap-1 bg-surface-muted rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150 ${
                  activeCategory === cat.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-muted text-slate-600 border border-surface-border hover:border-brand-300'
                }`}
              >
                <cat.icon size={12} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} className="text-brand-500" />
            <span>
              <span className="font-semibold text-slate-700">{total}</span> results
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 lg:px-6 pt-5 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
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
            {results.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${viewMode}-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {results.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProductCard product={product} layout={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-24 text-center"
              >
                <SearchX size={44} className="mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">No results found</p>
                <p className="text-sm text-slate-400 mt-1">Try different keywords or categories</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </PageShell>
  );
};
