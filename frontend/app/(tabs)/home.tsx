import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Animated,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useNotificationStore } from '../../src/store/notificationStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES } from '../../src/constants/categories';
import api from '../../src/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import CountdownTimer from '../../src/components/CountdownTimer';
import AnimatedHeader from '../../src/components/AnimatedHeader';
import AnimatedFilterChip from '../../src/components/AnimatedFilterChip';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [sortBy, setSortBy] = useState<string>('default'); // default, recent, oldest, personalized
  
  // Couleurs du header pour les badges (gold pour offres, vert pour demandes)
  const headerOfferColor = '#D4A574'; // Gold/Or doré (couleur complémentaire)
  const headerRequestColor = '#79C3B6'; // Vert aqua clair (25% plus clair)

  // Animations
  const bounceCardAnim = React.useRef(new Animated.Value(0)).current;
  const slideFiltersAnim = React.useRef(new Animated.Value(50)).current;
  const bounceServicesAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocationPermission();
    loadServices();

    // Animation Bounce pour le cadre principal "Bonjour Quentin"
    Animated.spring(bounceCardAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
      delay: 200,
    }).start();

    // Animation Slide pour les filtres/catégories
    Animated.timing(slideFiltersAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      delay: 400,
    }).start();

    // Animation Bounce pour les services/posts
    Animated.spring(bounceServicesAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
      delay: 600,
    }).start();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setLocationEnabled(true);
      }
    } catch (error) {
      console.log('Location permission denied or error:', error);
      setLocationEnabled(false);
    }
  };

  const loadServices = async (category?: string, sort?: string) => {
    try {
      let url = '/services?limit=20';
      
      // Add location params if available
      if (location) {
        url += `&lat=${location.latitude}&lon=${location.longitude}`;
      }
      
      // Add category filter if not "Tous"
      if (category && category !== 'Tous') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      // Add sort parameter
      const currentSort = sort || sortBy;
      if (currentSort && currentSort !== 'default') {
        url += `&sort=${currentSort}`;
      }
      
      const response = await api.get(url);
      console.log('Services chargés:', response.data.length);
      
      // Client-side sorting for personalized
      let sortedServices = response.data;
      if (currentSort === 'personalized' && user?.profile?.interests && user.profile.interests.length > 0) {
        // Tri personnalisé basé sur les centres d'intérêt
        const userInterests = user.profile.interests.map((i: string) => i.toLowerCase());
        sortedServices = [...response.data].sort((a: any, b: any) => {
          const aMatch = userInterests.includes(a.category?.toLowerCase());
          const bMatch = userInterests.includes(b.category?.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }
      
      setServices(sortedServices);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Voulez-vous vraiment supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/services/${serviceId}`);
              // Update UI immediately
              setServices(services.filter((s: any) => s._id !== serviceId));
              Alert.alert('Succès', 'Annonce supprimée avec succès');
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.response?.data?.detail || 'Impossible de supprimer l\'annonce'
              );
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices(selectedCategory, sortBy);
    setRefreshing(false);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    loadServices(category, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    loadServices(selectedCategory, newSort);
  };

  // Reload when location changes
  useEffect(() => {
    if (location) {
      loadServices();
    }
  }, [location]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header animé avec couleurs ondulantes - réduit de 20% */}
        <AnimatedHeader height={160}>
          <View style={styles.headerContent}>
            <View style={styles.greetingWrapper}>
              <Text style={styles.greeting}>Bonjour {user?.profile?.firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Credit Card - remonté de 20% */}
          {user && (
            <View style={[styles.creditCard, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="wallet" size={28} color="#FFFFFF" />
              <Text style={[styles.creditText, { color: '#FFFFFF' }]}>
                Vous avez {user?.credits.available.toFixed(0)} heures de crédit disponible
              </Text>
            </View>
          )}
        </AnimatedHeader>

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

        {/* Filtres de tri et catégories avec animation Slide */}
        <Animated.View
          style={[
            styles.filtersSection,
            {
              opacity: slideFiltersAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
              }),
              transform: [{ translateX: slideFiltersAnim }],
            },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Options de tri avec animation */}
            <AnimatedFilterChip
              isActive={sortBy === 'recent'}
              onPress={() => handleSortChange('recent')}
              icon="🕐"
              label="Plus récent"
            />
            <AnimatedFilterChip
              isActive={sortBy === 'oldest'}
              onPress={() => handleSortChange('oldest')}
              icon="📅"
              label="Plus ancien"
            />
            <AnimatedFilterChip
              isActive={sortBy === 'personalized'}
              onPress={() => handleSortChange('personalized')}
              icon="⭐"
              label="Personnalisé"
            />
            
            {/* Séparateur visuel */}
            <View style={styles.filterSeparator} />
            
            {/* Filtre "Tous" avec animation */}
            <AnimatedFilterChip
              isActive={selectedCategory === 'Tous' && sortBy === 'default'}
              onPress={() => {
                handleCategoryPress('Tous');
                setSortBy('default');
              }}
              icon="☀️"
              label="Tous"
            />
            
            {/* Catégories dynamiques avec animation */}
            {CATEGORIES.map((cat) => (
              <AnimatedFilterChip
                key={cat.id}
                isActive={selectedCategory === cat.label}
                onPress={() => handleCategoryPress(cat.label)}
                icon={cat.icon}
                label={cat.label}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Liste des services avec animation Bounce */}
        <Animated.View
          style={[
            styles.servicesSection,
            {
              transform: [
                {
                  scale: bounceServicesAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
              opacity: bounceServicesAnim,
            },
          ]}
        >
          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun service disponible</Text>
            </View>
          ) : (
            services.map((service: any) => {
              const isOffer = service.type === 'offer';
              const cardColor = colors.cardBackground;
              const borderColor = isOffer ? headerOfferColor : headerRequestColor;
              const buttonColor = isOffer ? headerOfferColor : headerRequestColor;

              return (
                <View key={service._id} style={styles.serviceCardWrapper}>
                  <TouchableOpacity 
                    style={[
                      styles.serviceCard,
                      { backgroundColor: cardColor, borderColor: borderColor, borderWidth: 2 },
                    ]}
                    onPress={() => router.push(`/service-details?id=${service._id}`)}
                    activeOpacity={0.7}
                  >
                  <View style={styles.serviceHeader}>
                    <View style={styles.userInfo}>
                      <View style={[styles.userAvatar, { backgroundColor: borderColor }]}>
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
                    <View style={[styles.typeBadge, { backgroundColor: borderColor + '30' }]}>
                      <Text style={[styles.typeText, { color: borderColor }]}>
                        {isOffer ? 'Offre' : 'Demande'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{service.title}</Text>
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {service.description}
                  </Text>

                  {/* Photos miniatures */}
                  {service.photos && service.photos.length > 0 && (
                    <View style={styles.photosContainer}>
                      {service.photos.slice(0, 3).map((photo: string, index: number) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.photoThumbnail}
                          resizeMode="cover"
                        />
                      ))}
                      {service.photos.length > 3 && (
                        <View style={styles.morePhotos}>
                          <Text style={styles.morePhotosText}>+{service.photos.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.serviceFooter}>
                    <View style={styles.serviceInfo}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.serviceInfoText}>{service.duration}h</Text>
                    </View>
                    <View style={styles.serviceInfo}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.serviceInfoText}>{service.location}</Text>
                    </View>
                    {service.distance_km && (
                      <View style={[styles.distanceBadge]}>
                        <Ionicons name="navigate" size={12} color="#10B981" />
                        <Text style={styles.distanceText}>{service.distance_km.toFixed(1)} km</Text>
                      </View>
                    )}
                    <View style={[styles.categoryBadge]}>
                      <Text style={styles.categoryText}>{service.category}</Text>
                    </View>
                  </View>

                  {/* Countdown Timer */}
                  <View style={{ marginTop: 8 }}>
                    {service.expiresAt ? (
                      <CountdownTimer 
                        expiresAt={service.expiresAt}
                        createdAt={service.createdAt}
                        compact={true}
                      />
                    ) : (
                      <View style={styles.legacyServiceBadge}>
                        <Text style={styles.legacyServiceText}>📅 Ancienne annonce</Text>
                      </View>
                    )}
                  </View>

                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </Animated.View>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: -8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.3,
  },
  debugInfo: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  debugText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  serviceCardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  deleteButtonAbsolute: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  deleteButtonDisabledAbsolute: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#10B981',
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
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  morePhotos: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  legacyServiceBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  legacyServiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortChip: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  filterSeparator: {
    width: 2,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  greetingWrapper: {
    marginTop: -8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
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
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  creditText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
