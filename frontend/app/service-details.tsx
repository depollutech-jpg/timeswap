import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import api from '../src/utils/api';
import { useAuthStore } from '../src/store/authStore';
import { useExchangeStore } from '../src/store/exchangeStore';
import UserProfileCard from '../src/components/UserProfileCard';
import ReportModal from '../src/components/ReportModal';
import ConfirmationModal from '../src/components/ConfirmationModal';

const { width } = Dimensions.get('window');

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { acceptExchange } = useExchangeStore();
  const [service, setService] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      setService(response.data);
      
      // Load user profile
      if (response.data.userId) {
        loadUserProfile(response.data.userId);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Service introuvable');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleContact = async () => {
    if (!service) return;

    if (service.userId === user?._id) {
      Alert.alert('Impossible', 'Vous ne pouvez pas contacter votre propre annonce');
      return;
    }

    setContactLoading(true);
    try {
      const response = await api.post('/chats', {
        serviceId: service._id,
        participantId: service.userId,
      });

      router.push(`/chat?id=${response.data._id}`);
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de creer la conversation'
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleAcceptExchange = async () => {
    try {
      const result = await acceptExchange(service._id, 'Je suis interesse par cet echange');
      Alert.alert(
        'Succes',
        'Echange accepte ! L annonce est maintenant verrouillee.',
        [
          {
            text: 'Aller au chat',
            onPress: () => router.push(`/chat?id=${result.chatId}`),
          },
        ]
      );
      setShowAcceptModal(false);
      await loadService(); // Reload to show locked status
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d accepter l echange');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return null;
  }

  const isOffer = service.type === 'offer';
  const badgeColor = isOffer ? Colors.primary : Colors.secondary;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        {service.status === 'locked' && (
          <View style={styles.statusBanner}>
            <Ionicons name="lock-closed" size={20} color="#F59E0B" />
            <Text style={styles.statusText}>Annonce verrouillee - Echange en cours</Text>
          </View>
        )}
        {service.status === 'completed' && (
          <View style={[styles.statusBanner, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981' }]}>Echange termine</Text>
          </View>
        )}

        {/* Photos Carousel */}
        {service.photos && service.photos.length > 0 && (
          <View style={styles.photosContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentPhotoIndex(index);
              }}
            >
              {service.photos.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {service.photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {service.photos.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      index === currentPhotoIndex && styles.photoIndicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.typeBadgeText}>
            {isOffer ? 'OFFRE DE SERVICE' : 'DEMANDE DE SERVICE'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{service.title}</Text>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{service.duration}h</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{service.location}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* User Profile Card */}
        {userProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propose par</Text>
            <UserProfileCard user={userProfile} />
          </View>
        )}

        {/* Distance if available */}
        {service.distance_km && (
          <View style={styles.distanceCard}>
            <Ionicons name="navigate" size={24} color="#10B981" />
            <Text style={styles.distanceText}>
              A {service.distance_km.toFixed(1)} km de vous
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Actions Footer */}
      {service.userId !== user?._id && service.status === 'active' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, contactLoading && styles.contactButtonDisabled]}
            onPress={handleContact}
            disabled={contactLoading}
          >
            {contactLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Contacter</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => setShowAcceptModal(true)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.acceptButtonText}>Accepter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <ReportModal
        visible={showReportModal}
        targetType="service"
        targetId={service._id}
        onClose={() => setShowReportModal(false)}
      />

      <ConfirmationModal
        visible={showAcceptModal}
        title="Accepter l'echange"
        message={`Voulez-vous accepter cet echange de ${service.duration}h ? L'annonce sera verrouillee et vous pourrez discuter avec ${userProfile?.name || 'l utilisateur'}.`}
        confirmText="Accepter"
        cancelText="Annuler"
        icon="handshake"
        iconColor={Colors.primary}
        onConfirm={handleAcceptExchange}
        onCancel={() => setShowAcceptModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  typeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  creatorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creatorAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  creatorAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  creatorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  creatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    gap: 12,
  },
  distanceText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contactButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonDisabled: {
    opacity: 0.6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
