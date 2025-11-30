import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/utils/api';
import PageTitle from '../../src/components/PageTitle';
import { LinearGradient } from 'expo-linear-gradient';

interface Appointment {
  _id: string;
  date: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  otherUser: {
    _id: string;
    name: string;
    photo?: string;
  };
  reminderSent: boolean;
}

export default function CalendrierScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      Alert.alert('Succès', 'Rendez-vous mis à jour');
      fetchAppointments();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rendez-vous');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const groupByDate = (appointments: Appointment[]) => {
    const groups: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(appointment => {
      const dateKey = new Date(appointment.date).toLocaleDateString('fr-FR');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    });
    
    return groups;
  };

  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date) && a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => isPast(a.date) || a.status !== 'scheduled');
  const groupedUpcoming = groupByDate(upcomingAppointments);
  const groupedPast = groupByDate(pastAppointments);

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <PageTitle 
          title="Calendrier"
          icon={<Ionicons name="calendar" size={28} color={colors.primary} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3EADAD" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3EADAD']} />
        }
      >
        <PageTitle 
          title="Calendrier"
          subtitle={`${appointments.length} rendez-vous`}
          icon={<Ionicons name="calendar" size={28} color={colors.primary} />}
        />

        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['rgba(62, 173, 173, 0.05)', 'rgba(95, 207, 207, 0.02)']}
              style={styles.emptyIconWrapper}
            >
              <Ionicons name="calendar-outline" size={64} color="#3EADAD" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
            <Text style={styles.emptyText}>
              Vos rendez-vous planifiés avec d'autres utilisateurs apparaîtront ici.
            </Text>
          </View>
        ) : (
          <>
            {/* Rendez-vous à venir */}
            {upcomingAppointments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#3EADAD" />
                  <Text style={styles.sectionTitle}>À venir ({upcomingAppointments.length})</Text>
                </View>

                {Object.keys(groupedUpcoming).map(dateKey => (
                  <View key={dateKey}>
                    <Text style={styles.dateHeader}>{dateKey}</Text>
                    {groupedUpcoming[dateKey].map(appointment => (
                      <View key={appointment._id} style={styles.appointmentCard}>
                        <View style={styles.appointmentHeader}>
                          <View style={styles.timeIcon}>
                            <Ionicons name="time" size={16} color="#3EADAD" />
                            <Text style={styles.timeText}>{formatTime(appointment.date)}</Text>
                          </View>
                          <View style={[styles.statusBadge, styles.statusScheduled]}>
                            <Text style={styles.statusText}>Planifié</Text>
                          </View>
                        </View>

                        <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                        
                        {appointment.description && (
                          <Text style={styles.appointmentDescription} numberOfLines={2}>
                            {appointment.description}
                          </Text>
                        )}

                        <View style={styles.participantInfo}>
                          <Ionicons name="person-outline" size={16} color="#6B7280" />
                          <Text style={styles.participantText}>
                            Avec {appointment.otherUser?.name || 'Utilisateur'}
                          </Text>
                        </View>

                        <View style={styles.appointmentActions}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleUpdateStatus(appointment._id, 'completed')}
                          >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Terminé</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleUpdateStatus(appointment._id, 'cancelled')}
                          >
                            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Annuler</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Rendez-vous passés */}
            {pastAppointments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-done-outline" size={20} color="#6B7280" />
                  <Text style={[styles.sectionTitle, { color: '#6B7280' }]}>Passés ({pastAppointments.length})</Text>
                </View>

                {Object.keys(groupedPast).slice(0, 5).map(dateKey => (
                  <View key={dateKey}>
                    <Text style={styles.dateHeader}>{dateKey}</Text>
                    {groupedPast[dateKey].map(appointment => (
                      <View key={appointment._id} style={[styles.appointmentCard, styles.appointmentCardPast]}>
                        <View style={styles.appointmentHeader}>
                          <View style={styles.timeIcon}>
                            <Ionicons name="time" size={16} color="#9CA3AF" />
                            <Text style={[styles.timeText, { color: '#9CA3AF' }]}>{formatTime(appointment.date)}</Text>
                          </View>
                          <View style={[
                            styles.statusBadge,
                            appointment.status === 'completed' ? styles.statusCompleted : styles.statusCancelled
                          ]}>
                            <Text style={styles.statusText}>
                              {appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.appointmentTitle, { color: '#6B7280' }]}>{appointment.title}</Text>
                        
                        <View style={styles.participantInfo}>
                          <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                          <Text style={[styles.participantText, { color: '#9CA3AF' }]}>
                            Avec {appointment.otherUser?.name || 'Utilisateur'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3EADAD',
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3EADAD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentCardPast: {
    opacity: 0.7,
    borderLeftColor: '#9CA3AF',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3EADAD',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusScheduled: {
    backgroundColor: 'rgba(62, 173, 173, 0.1)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3EADAD',
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  appointmentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  participantText: {
    fontSize: 14,
    color: '#6B7280',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
