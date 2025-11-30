import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useThemeStore } from '../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../src/utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import CountdownTimer from '../src/components/CountdownTimer';
import ConfirmDialog from '../src/components/ConfirmDialog';

export default function MyServicesScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'offer', 'demand'
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    loadMyServices();
  }, []);

  const loadMyServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      // Filtrer pour avoir uniquement les services de l'utilisateur
      // Vérifier différentes propriétés possibles pour l'ID utilisateur
      const myServices = response.data.filter(
        (service) => 
          service.userId === user?._id || 
          service.user_id === user?._id ||
          service.createdBy === user?._id ||
          service.created_by === user?._id ||
          service.author?._id === user?._id ||
          service.user?._id === user?._id
      );
      console.log('Total services:', response.data.length);
      console.log('Mes services:', myServices.length);
      console.log('User ID:', user?._id);
      console.log('User object:', user);
      setServices(myServices);
    } catch (error) {
      console.error('Erreur chargement services:', error);
      Alert.alert('Erreur', 'Impossible de charger vos annonces');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyServices();
  };

  const handleDeletePress = (serviceId: string, title: string) => {
    console.log('🔴 Préparation suppression:', { id: serviceId, title });
    setServiceToDelete({ id: serviceId, title });
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    console.log('✅ Confirmation suppression:', serviceToDelete);
    setDeleteDialogVisible(false);

    try {
      console.log(`🔄 Appel API DELETE /services/${serviceToDelete.id}`);
      await api.delete(`/services/${serviceToDelete.id}`);
      console.log('✅ Suppression réussie');
      Alert.alert('Succès', 'Votre annonce a été supprimée');
      loadMyServices();
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      const errorMsg = error.response?.data?.detail || 'Impossible de supprimer l\'annonce';
      Alert.alert('Erreur', errorMsg);
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('❌ Suppression annulée');
    setDeleteDialogVisible(false);
    setServiceToDelete(null);
  };

  const filteredServices = services.filter((service) => {
    if (filter === 'all') return true;
    if (filter === 'offer') return service.type === 'offer';
    if (filter === 'demand') return service.type === 'demand';
    return true;
  });

  const offersCount = services.filter((s) => s.type === 'offer').length;
  const demandsCount = services.filter((s) => s.type === 'demand').length;

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header fixe avec dégradé */}
      <LinearGradient
        colors={['#3EADAD', '#5FCFCF', '#3EADAD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Annonces</Text>
        <TouchableOpacity
          onPress={() => router.push('/create-service')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats rapides */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
            style={styles.statGradient}
          >
            <Ionicons name="gift" size={24} color="#10B981" />
            <Text style={styles.statValue}>{offersCount}</Text>
            <Text style={styles.statLabel}>Offres</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
            style={styles.statGradient}
          >
            <Ionicons name="hand-left" size={24} color="#FBBF24" />
            <Text style={styles.statValue}>{demandsCount}</Text>
            <Text style={styles.statLabel}>Demandes</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.statGradient}
          >
            <Ionicons name="apps" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'offer' && styles.filterChipActive]}
          onPress={() => setFilter('offer')}
        >
          <Text style={[styles.filterText, filter === 'offer' && styles.filterTextActive]}>
            Offres
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'demand' && styles.filterChipActive]}
          onPress={() => setFilter('demand')}
        >
          <Text style={[styles.filterText, filter === 'demand' && styles.filterTextActive]}>
            Demandes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des services */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3EADAD']} />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Chargement...</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucun service</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Vous n\'avez pas encore publié d\'annonce'
                : filter === 'offer'
                ? 'Vous n\'avez pas d\'offre active'
                : 'Vous n\'avez pas de demande active'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-service')}
            >
              <LinearGradient
                colors={['#3EADAD', '#5FCFCF']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Créer une annonce</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          filteredServices.map((service) => {
            const isOffer = service.type === 'offer';
            const borderColor = isOffer ? '#FBBF24' : '#3EADAD';
            const badgeColor = isOffer ? '#FBBF24' : '#3EADAD';

            return (
              <View
                key={service._id}
                style={[styles.serviceCard, { borderLeftColor: borderColor }]}
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  style={styles.serviceContent}
                  onPress={() => router.push(`/service-details?id=${service._id}`)}
                  activeOpacity={0.7}
                  pointerEvents="auto"
                >
                  {/* Badge type */}
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Ionicons
                      name={isOffer ? 'gift' : 'hand-left'}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.badgeText}>
                      {isOffer ? 'Offre' : 'Demande'}
                    </Text>
                  </View>

                  {/* Titre et catégorie */}
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryIcon}>{service.category?.icon || '📦'}</Text>
                    <Text style={styles.categoryText}>
                      {service.category?.label || 'Autre'}
                    </Text>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.hoursText}>{service.hours}h</Text>
                  </View>

                  {/* Description */}
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>

                  {/* Countdown et localisation */}
                  <View style={styles.infoRow}>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.locationText}>
                        {service.location?.city || 'Non spécifié'}
                      </Text>
                    </View>
                    <CountdownTimer expiresAt={service.expiresAt} />
                  </View>

                  {/* Photos miniatures */}
                  {service.photos && service.photos.length > 0 && (
                    <View style={styles.photosContainer}>
                      {service.photos.slice(0, 3).map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={styles.photoThumb} />
                      ))}
                      {service.photos.length > 3 && (
                        <View style={styles.morePhotos}>
                          <Text style={styles.morePhotosText}>+{service.photos.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {/* Boutons d'action */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
                    pointerEvents="auto"
                  >
                    <Ionicons name="create-outline" size={20} color="#3EADAD" />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>

                  <View style={styles.actionDivider} />

                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.7}
                    onPress={() => handleDeletePress(service._id, service.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Supprimer l'annonce"
        message={`Voulez-vous vraiment supprimer "${serviceToDelete?.title}" ?\n\nCette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    statGradient: {
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: colors.surface,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 12,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: 'rgba(62, 173, 173, 0.1)',
      borderColor: '#3EADAD',
    },
    filterText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#3EADAD',
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
    },
    createButton: {
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#3EADAD',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    createButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    serviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    serviceContent: {
      padding: 16,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
      marginBottom: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    serviceTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    categoryIcon: {
      fontSize: 16,
    },
    categoryText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    separator: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    hoursText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3EADAD',
    },
    serviceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    photosContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    photoThumb: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    morePhotos: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: 'rgba(62, 173, 173, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    morePhotosText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3EADAD',
    },
    actionButtons: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 6,
    },
    actionDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3EADAD',
    },
  });
