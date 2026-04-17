import { create } from 'zustand';
import api from '@/lib/api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
  location: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  loginWithGoogle: (credential: string) => Promise<void>;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'bio' | 'phone' | 'location' | 'avatar'>>) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Load persisted auth from localStorage on app start
  hydrate: () => {
    const token = localStorage.getItem('kkr_token');
    const raw = localStorage.getItem('kkr_user');
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ token, user });
      } catch {
        localStorage.removeItem('kkr_token');
        localStorage.removeItem('kkr_user');
      }
    }
  },

  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/google', {
        credential,
      });
      localStorage.setItem('kkr_token', data.token);
      localStorage.setItem('kkr_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Google login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateProfile: async (data: Partial<Pick<AuthUser, 'name' | 'bio' | 'phone' | 'location' | 'avatar'>>) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch<AuthUser>('/user/me', data);
      const updated = res.data;
      localStorage.setItem('kkr_user', JSON.stringify(updated));
      set({ user: updated, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Update failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('kkr_token');
    localStorage.removeItem('kkr_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
