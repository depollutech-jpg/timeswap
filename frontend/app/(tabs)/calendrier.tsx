import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import AnimatedHeader from '../../src/components/AnimatedHeader';
import PageTitle from '../../src/components/PageTitle';

interface Exchange {
  _id: string;
  status: string;
  duration: number;
  createdAt: string;
  completedAt?: string;
  service: {
    _id: string;
    title: string;
    photos?: string[];
  };
  otherUser: {
    _id: string;
    name: string;
    photo?: string;
  };
  chatId?: string;
}

export default function CalendrierScreen() {
  const { token } = useAuthStore();
  const { colors } = useThemeStore();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  const fetchExchanges = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/exchanges/my/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exchanges');
      }

      const data = await response.json();
      setExchanges(data);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExchanges();
    }
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExchanges();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'accepted':
        return { label: 'En cours', color: '#3EADAD', icon: 'hourglass-outline' };
      case 'completed':
        return { label: 'Terminé', color: '#10B981', icon: 'checkmark-circle' };
      case 'cancelled':
        return { label: 'Annulé', color: '#EF4444', icon: 'close-circle' };
      case 'pending':
        return { label: 'En attente', color: '#F59E0B', icon: 'time-outline' };
      default:
        return { label: status, color: colors.textSecondary, icon: 'help-circle-outline' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleExchangePress = (exchange: Exchange) => {
    if (exchange.chatId) {
      router.push({
        pathname: '/chat',
        params: {
          chatId: exchange.chatId,
          serviceId: exchange.service._id,
        },
      });
    }
  };

  const renderExchangeCard = (exchange: Exchange) => {
    const statusInfo = getStatusInfo(exchange.status);
    const servicePhoto = exchange.service.photos?.[0];

    return (
      <TouchableOpacity
        key={exchange._id}
        style={[styles.exchangeCard, { backgroundColor: colors.surface }]}
        onPress={() => handleExchangePress(exchange)}
        activeOpacity={0.7}
      >
        {/* Image du service */}
        <View style={styles.exchangeImageContainer}>
          {servicePhoto ? (
            <Image
              source={{ uri: servicePhoto }}
              style={styles.exchangeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.exchangeImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={styles.exchangeContent}>
          {/* Titre du service */}
          <Text style={[styles.exchangeTitle, { color: colors.text }]} numberOfLines={2}>
            {exchange.service.title}
          </Text>

          {/* Utilisateur et durée */}
          <View style={styles.exchangeInfo}>
            <View style={styles.userInfo}>
              {exchange.otherUser.photo ? (
                <Image
                  source={{ uri: exchange.otherUser.photo }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={16} color={colors.textSecondary} />
                </View>
              )}
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {exchange.otherUser.name}
              </Text>
            </View>

            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color="#3EADAD" />
              <Text style={styles.durationText}>{exchange.duration}h</Text>
            </View>
          </View>

          {/* Statut et date */}
          <View style={styles.exchangeFooter}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>

            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(exchange.completedAt || exchange.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <PageTitle title="Calendrier" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3EADAD" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Titre de la page */}
      <PageTitle title="Calendrier" subtitle={`${exchanges.length} échange${exchanges.length > 1 ? 's' : ''}`} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3EADAD"
          />
        }
      >
        {exchanges.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Aucun échange</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Vos échanges apparaîtront ici
            </Text>
          </View>
        ) : (
          <View style={styles.exchangesList}>
            {exchanges.map((exchange) => renderExchangeCard(exchange))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  exchangesList: {
    gap: 16,
  },
  exchangeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exchangeImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  exchangeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  exchangeContent: {
    padding: 16,
  },
  exchangeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exchangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(62, 173, 173, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3EADAD',
  },
  exchangeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
  },
  emptyState: {
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
