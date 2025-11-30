import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics_service } from '../services/analytics';

interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
    location?: string;
    photo_base64?: string;
  };
  credits: {
    available: number;
    given: number;
    received: number;
  };
  gamification: {
    xp: number;
    level: number;
    badges: string[];
    stats: {
      force: number;
      sagesse: number;
      dexterite: number;
    };
  };
  verification: {
    isVerified: boolean;
    idDocument_base64?: string;
    verifiedAt?: string;
  };
  interests?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
    set({ token });
  },
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },
}));
