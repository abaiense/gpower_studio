import { create } from 'zustand';
import { api } from '@/lib/api';
import { clearTokens, setTokens } from '@/lib/auth';
import type { LoginFormData } from '@/lib/validations/login.schema';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studioId: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    if (get().isLoading) return; // prevent double-submit
    set({ isLoading: true, user: null }); // clear previous user
    try {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', credentials);

      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout').catch(() => {
        // Ignore server errors on logout — clear tokens regardless
      });
    } finally {
      clearTokens();
      set({ user: null, isLoading: false });
    }
  },

  register: async (data) => {
    if (get().isLoading) return; // prevent double-submit
    set({ isLoading: true, user: null }); // clear previous user
    try {
      const { data: response } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/register', {
        studioName: data.studioName,
        city: data.city,
        state: data.state,
        plan: data.plan,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user });
    } finally {
      set({ isLoading: false });
    }
  },
}));
