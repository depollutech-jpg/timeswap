import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../src/store/notificationStore';
import { useAuthStore } from '../../src/store/authStore';

export default function MessagesScreen() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Générer des notifications de démonstration basées sur les intérêts de l'utilisateur
  useEffect(() => {
    const demoNotifications = [
      {
        _id: '1',
        type: 'service' as const,
        title: '🌱 Nouveau service correspondant !',
        message: 'Marie propose un service de jardinage dans votre quartier',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        relatedUser: {
          name: 'Marie Dupont',
        },
        relatedService: {
          id: 'service-1',
          title: 'Aide au jardinage',
        },
      },
      {
        _id: '2',
        type: 'message' as const,
        title: '💬 Nouveau message',
        message: 'Pierre vous a envoyé un message concernant votre offre',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        relatedUser: {
          name: 'Pierre Martin',
        },
      },
      {
        _id: '3',
        type: 'reward' as const,
        title: '🎁 Nouvelle récompense débloquée !',
        message: 'Vous avez atteint le niveau 3 et gagné 50 XP',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: '4',
        type: 'system' as const,
        title: '⭐ Échange confirmé',
        message: 'Votre échange avec Sophie a été confirmé avec succès',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        relatedUser: {
          name: 'Sophie Leblanc',
        },
      },
    ];

    useNotificationStore.getState().setNotifications(demoNotifications);

    // Animation de slide au montage
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'message':
        return { name: 'chatbubble', color: '#3B82F6' };
      case 'service':
        return { name: 'leaf', color: '#10B981' };
      case 'reward':
        return { name: 'gift', color: '#F59E0B' };
      case 'system':
        return { name: 'checkmark-circle', color: Colors.primary };
      default:
        return { name: 'notifications', color: Colors.primary };
    }
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
              Vos notifications apparaîtront ici : nouveaux messages, services correspondants et récompenses.
            </Text>
          </View>
        ) : (
          notifications.map((notification, index) => {
            const icon = getIconForType(notification.type);
            const animatedStyle = {
              opacity: slideAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            };

            return (
              <Animated.View
                key={notification._id}
                style={[animatedStyle, { transitionDelay: `${index * 50}ms` }]}
              >
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.notificationUnread,
                  ]}
                  onPress={() => markAsRead(notification._id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>

                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
                  </View>

                  {!notification.isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
