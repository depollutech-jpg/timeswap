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

  // Détecter les nouvelles notifications et afficher une alerte
  useEffect(() => {
    if (notifications.length === 0) return;
    
    const latestNotification = notifications[0];
    
    // Vérifier s'il y a une nouvelle notification non lue
    if (
      latestNotification &&
      !latestNotification.read &&
      latestNotification._id !== lastNotificationId.current
    ) {
      lastNotificationId.current = latestNotification._id;
      
      // Afficher une alerte pour les notifications de message
      if (latestNotification.type === 'message') {
        const message = `${latestNotification.senderName || 'Quelqu\'un'} vous a envoyé un message`;
        
        if (Platform.OS === 'web') {
          // Sur web, utiliser une notification native du navigateur si possible
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouveau message', {
              body: latestNotification.content || message,
              icon: '/icon.png',
            });
          } else {
            // Fallback sur console.log pour le web
            console.log('📬 Nouveau message:', message);
          }
        } else {
          // Sur mobile, utiliser Alert (ou plus tard, des notifications push)
          Alert.alert(
            '📬 Nouveau message',
            message,
            [{ text: 'OK' }]
          );
        }
      }
    }
    
    previousUnreadCount.current = unreadCount;
  }, [notifications, unreadCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Demander la permission pour les notifications web
    if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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
