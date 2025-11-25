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
import { LinearGradient } from 'expo-linear-gradient';
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
        {/* Header avec gradient rose */}
        <LinearGradient
          colors={['#FF6B9D', '#FF4777']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.logo}>TimeSwap</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.greetingCard}>
            <View style={styles.greetingIcon}>
              <Ionicons name="hand-right" size={32} color="#FF6B9D" />
            </View>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingTitle}>Bonjour {user?.profile.firstName} ! 👋</Text>
              <Text style={styles.greetingSubtitle}>
                Vous avez {user?.credits.available.toFixed(0)} heures de crédit disponible
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Barre de recherche */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un service, une compétence..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Filtres de catégories */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
              <Text style={styles.filterIcon}>☀️</Text>
              <Text style={[styles.filterText, styles.filterTextActive]}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterIcon}>🌱</Text>
              <Text style={styles.filterText}>Jardinage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterIcon}>🔧</Text>
              <Text style={styles.filterText}>Bricolage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterIcon}>🔍</Text>
              <Text style={styles.filterText}>Cuisine</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Liste des services */}
        <View style={styles.servicesSection}>
          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun service disponible</Text>
            </View>
          ) : (
            services.map((service: any) => (
              <TouchableOpacity key={service._id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>
                        {service.user.name.split(' ').map((n: string) => n[0]).join('')}
                      </Text>
                    </View>
                    <View>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{service.user.name}</Text>
                        {service.user.isVerified && (
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        )}
                      </View>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.rating}>{service.user.rating.toFixed(1)}</Text>
                        <Text style={styles.exchanges}>
                          · {(service.user.rating * 5).toFixed(0)} échanges
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.searchIcon}>
                    <Ionicons name="search" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>

                <View style={styles.serviceFooter}>
                  <View style={styles.serviceInfo}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.serviceInfoText}>{service.duration}h</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.serviceInfoText}>{service.location}</Text>
                  </View>
                  <View style={[styles.categoryBadge]}>
                    <Text style={styles.categoryText}>{service.category}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.proposeButton}>
                  <Text style={styles.proposeButtonText}>Proposer un échange</Text>
                </TouchableOpacity>
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
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  greetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  greetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContent: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#EF4444',
  },
  filtersSection: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#FFF1F2',
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  servicesSection: {
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  exchanges: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  categoryText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  proposeButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proposeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});
