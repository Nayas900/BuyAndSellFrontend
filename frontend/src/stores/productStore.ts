import { create } from 'zustand';
import api from '@/lib/api';

export interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  location: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  sellerId: {
    _id: string;
    name: string;
    avatar: string;
    location: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  location: string;
  condition: string;
}

interface ProductState {
  products: ApiProduct[];
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchProducts: (params?: { search?: string; category?: string; page?: number }) => Promise<void>;
  createProduct: (data: CreateProductInput) => Promise<ApiProduct>;
  closeDeal: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<{ products: ApiProduct[]; total: number }>(
        '/products',
        { params }
      );
      set({ products: data.products, total: data.total, isLoading: false });
    } catch {
      set({ error: 'Failed to load products', isLoading: false });
    }
  },

  createProduct: async (input) => {
    const { data } = await api.post<ApiProduct>('/products', input);
    set((s) => ({ products: [data, ...s.products], total: s.total + 1 }));
    return data;
  },

  closeDeal: async (id: string) => {
    await api.patch(`/products/${id}/close`);
    set((s) => ({
      products: s.products.filter((p) => p._id !== id),
      total: Math.max(0, s.total - 1),
    }));
  },

  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
    set((s) => ({
      products: s.products.filter((p) => p._id !== id),
      total: Math.max(0, s.total - 1),
    }));
    // Keep get in closure to avoid lint warning
    void get;
  },
}));

export default useProductStore;
