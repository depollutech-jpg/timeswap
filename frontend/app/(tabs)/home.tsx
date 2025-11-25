import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import api from '../../src/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/services?limit=10');
      setServices(response.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.profile.firstName} !</Text>
            <Text style={styles.subtitle}>
              Vous avez {user?.credits.available.toFixed(1)}h de crédit disponible
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{user?.credits.available.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.secondary + '20' }]}>
            <Ionicons name="star-outline" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{user?.gamification.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]}>
            <Ionicons name="trending-up-outline" size={24} color={Colors.success} />
            <Text style={styles.statValue}>Niveau {user?.gamification.level}</Text>
            <Text style={styles.statLabel}>Progression</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/create-service?type=offer')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="gift-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Proposer un service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/create-service?type=request')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="search-outline" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.actionText}>Demander de l'aide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services récents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun service disponible pour le moment</Text>
            </View>
          ) : (
            services.slice(0, 5).map((service: any) => (
              <TouchableOpacity key={service._id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceUser}>
                    <View style={styles.avatar}>
                      {service.user.photo_base64 ? (
                        <Text>IMG</Text>
                      ) : (
                        <Ionicons name="person" size={20} color={Colors.textSecondary} />
                      )}
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.userName}>{service.user.name}</Text>
                        {service.user.isVerified && (
                          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                        )}
                      </View>
                      <Text style={styles.serviceLocation}>{service.location}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.serviceType,
                      {
                        backgroundColor:
                          service.type === 'offer'
                            ? Colors.primary + '20'
                            : Colors.secondary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.serviceTypeText,
                        {
                          color: service.type === 'offer' ? Colors.primary : Colors.secondary,
                        },
                      ]}
                    >
                      {service.type === 'offer' ? 'Offre' : 'Demande'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceInfo}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.serviceInfoText}>{service.duration}h</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Ionicons name="folder-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.serviceInfoText}>{service.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  serviceType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
