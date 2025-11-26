import { create } from 'zustand';
import api from '../utils/api';

// Interface qui correspond à la structure du backend
export interface Notification {
  _id: string;
  userId: string;
  type: 'message' | 'service' | 'system' | 'reward';
  messageId?: string;
  chatId?: string;
  senderId?: string;
  senderName?: string;
  content?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastFetch: number | null;
  
  // Actions
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetch: null,
  
  fetchNotifications: async (unreadOnly = false) => {
    try {
      set({ isLoading: true });
      const response = await api.get(`/notifications${unreadOnly ? '?unread_only=true' : ''}`);
      const notifications = response.data;
      
      set({
        notifications,
        unreadCount: notifications.filter((n: Notification) => !n.read).length,
        lastFetch: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  
  markAsRead: async (id) => {
    try {
      await api.post(`/notifications/${id}/mark-read`);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  
  markAllAsRead: async () => {
    try {
      await api.post('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
  
  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
  
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  
  updateUnreadCount: () => {
    const { notifications } = get();
    set({ unreadCount: notifications.filter((n) => !n.read).length });
  },
}));
