import { create } from 'zustand';
import api from '../utils/api';

export interface Exchange {
  _id: string;
  serviceId: string;
  providerId: string;
  requesterId: string;
  duration: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  providerConfirmed: boolean;
  requesterConfirmed: boolean;
  cancelledBy: string | null;
  cancellationReason: string | null;
  penaltyApplied: boolean;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  xpAwarded: number;
  service?: any;
  provider?: any;
  requester?: any;
}

interface ExchangeState {
  currentExchange: Exchange | null;
  myExchanges: Exchange[];
  isLoading: boolean;
  
  // Actions
  fetchExchange: (exchangeId: string) => Promise<void>;
  fetchMyExchanges: () => Promise<void>;
  acceptExchange: (serviceId: string, message?: string) => Promise<{ exchangeId: string; chatId: string }>;
  confirmCompletion: (exchangeId: string) => Promise<any>;
  cancelExchange: (exchangeId: string, reason: string) => Promise<void>;
  rateExchange: (exchangeId: string, rating: number, review?: string) => Promise<void>;
  clearCurrentExchange: () => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  currentExchange: null,
  myExchanges: [],
  isLoading: false,
  
  fetchExchange: async (exchangeId: string) => {
    try {
      set({ isLoading: true });
      const response = await api.get(`/exchanges/${exchangeId}`);
      set({ currentExchange: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch exchange:', error);
      set({ isLoading: false });
    }
  },
  
  fetchMyExchanges: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/exchanges/my/all');
      set({ myExchanges: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my exchanges:', error);
      set({ isLoading: false });
    }
  },
  
  acceptExchange: async (serviceId: string, message?: string) => {
    try {
      const response = await api.post(`/services/${serviceId}/accept-exchange`, {
        message: message || ''
      });
      return {
        exchangeId: response.data.exchangeId,
        chatId: response.data.chatId
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to accept exchange');
    }
  },
  
  confirmCompletion: async (exchangeId: string) => {
    try {
      const response = await api.post(`/exchanges/${exchangeId}/confirm-completion`);
      
      // Refresh current exchange
      if (get().currentExchange?._id === exchangeId) {
        await get().fetchExchange(exchangeId);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to confirm completion');
    }
  },
  
  cancelExchange: async (exchangeId: string, reason: string) => {
    try {
      await api.post(`/exchanges/${exchangeId}/cancel`, { reason });
      
      // Refresh current exchange
      if (get().currentExchange?._id === exchangeId) {
        await get().fetchExchange(exchangeId);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to cancel exchange');
    }
  },
  
  rateExchange: async (exchangeId: string, rating: number, review?: string) => {
    try {
      await api.post(`/exchanges/${exchangeId}/rate`, {
        rating,
        review: review || ''
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to rate exchange');
    }
  },
  
  clearCurrentExchange: () => set({ currentExchange: null }),
}));
