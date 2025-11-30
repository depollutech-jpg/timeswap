import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';

/**
 * Hook personnalisé pour gérer le polling des notifications
 * Récupère les notifications toutes les 10 secondes quand l'app est active
 * Affiche une alerte pour les nouvelles notifications
 */
export const useNotificationPolling = () => {
  const { fetchNotifications, notifications, unreadCount } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const previousUnreadCount = useRef(0);
  const lastNotificationId = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Fetch initial notifications
    fetchNotifications();

    // Start polling
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 10000); // Poll every 10 seconds
    };

    // Stop polling
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground, fetch notifications and restart polling
        fetchNotifications();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background, stop polling
        stopPolling();
      }

      appState.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Start polling
    startPolling();

    // Cleanup
    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [isAuthenticated, fetchNotifications]);
};
