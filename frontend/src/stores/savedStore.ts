import { create } from 'zustand';
import type { Product } from '@/types';

type SavedByUser = Record<string, Product[]>;

interface SavedState {
  activeUserId: string | null;
  savedProducts: Product[];
  ensureUser: (userId: string) => void;
  clearActive: () => void;
  isSaved: (productId: string) => boolean;
  toggleSaved: (userId: string, product: Product) => void;
}

const STORAGE_KEY = 'kkr_saved_products';

const readSavedMap = (): SavedByUser => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SavedByUser;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeSavedMap = (data: SavedByUser) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const useSavedStore = create<SavedState>((set, get) => ({
  activeUserId: null,
  savedProducts: [],

  ensureUser: (userId: string) => {
    const map = readSavedMap();
    set({
      activeUserId: userId,
      savedProducts: map[userId] || [],
    });
  },

  clearActive: () => {
    set({ activeUserId: null, savedProducts: [] });
  },

  isSaved: (productId: string) => {
    return get().savedProducts.some((p) => p.id === productId);
  },

  toggleSaved: (userId: string, product: Product) => {
    const map = readSavedMap();
    const current = map[userId] || [];
    const exists = current.some((p) => p.id === product.id);
    const next = exists
      ? current.filter((p) => p.id !== product.id)
      : [product, ...current];

    map[userId] = next;
    writeSavedMap(map);
    set({ activeUserId: userId, savedProducts: next });
  },
}));

export default useSavedStore;
