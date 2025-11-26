import { create } from 'zustand';

export interface Notification {
  _id: string;
  type: 'message' | 'service' | 'system' | 'reward';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    name: string;
    avatar?: string;
  };
  relatedService?: {
    id: string;
    title: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif._id === id ? { ...notif, isRead: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        isRead: true,
      })),
      unreadCount: 0,
    })),
  
  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
  
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
}));
