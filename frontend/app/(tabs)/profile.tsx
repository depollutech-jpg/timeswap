import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const response = await api.get('/exchanges/my/all');
      setRecentActivity(response.data.slice(0, 4));
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const hoursGiven = user?.credits.given || 0;
  const hoursReceived = user?.credits.received || 0;
  const totalExchanges = Math.floor((hoursGiven + hoursReceived) / 2);
  const averageRating = user?.gamification.xp ? (user.gamification.xp / 100).toFixed(1) : '0.0';
  const favoriteCount = user?.gamification.badges.length || 0;

  // Calcul de l'objectif mensuel
  const monthlyGoal = 60;
  const currentHours = hoursGiven;
  const goalProgress = Math.min((currentHours / monthlyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={['#FF6B9D', '#FF4777']} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logo}>TimeSwap</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Carte Solde de temps */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#FF6B9D', '#FF4777']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>Solde de temps</Text>
              <TouchableOpacity>
                <Ionicons name="time-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>{user?.credits.available.toFixed(0)} heures</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Heures données</Text>
                <Text style={styles.balanceStatValue}>~{hoursGiven.toFixed(0)}h</Text>
              </View>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Heures reçues</Text>
                <Text style={styles.balanceStatValue}>~{hoursReceived.toFixed(0)}h</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Objectif mensuel */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Ionicons name="calendar" size={20} color="#A855F7" />
            </View>
            <Text style={styles.goalTitle}>Objectif mensuel</Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>Octobre</Text>
            </View>
          </View>
          <View style={styles.goalProgress}>
            <Text style={styles.goalText}>{currentHours.toFixed(0)}h / {monthlyGoal}h</Text>
            <Text style={styles.goalPercentage}>{goalProgress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
          </View>
          <Text style={styles.goalMessage}>
            Plus que {(monthlyGoal - currentHours).toFixed(0)} heures pour atteindre votre objectif ! 🎯
          </Text>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.statValue}>{totalExchanges}</Text>
            <Text style={styles.statLabel}>Échanges</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.statValue}>{averageRating}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        {/* Activité récente */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <View style={styles.activityIconHeader}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.activityTitle}>Activité récente</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
          ) : recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>Aucune activité récente</Text>
            </View>
          ) : (
            recentActivity.map((activity: any, index) => (
              <View key={activity._id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>
                    {activity.service?.category === 'jardinage' ? '🌱' : 
                     activity.service?.category === 'cuisine' ? '🍳' :
                     activity.service?.category === 'bricolage' ? '🔧' : '⭐'}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityServiceTitle}>
                    {activity.service?.title || 'Service'}
                  </Text>
                  <Text style={styles.activityUser}>
                    {activity.otherUser?.name} · {activity.duration}h · {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.activityBadge,
                    {
                      backgroundColor:
                        activity.status === 'completed'
                          ? '#FEE2E2'
                          : activity.status === 'accepted'
                          ? '#D1FAE5'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.activityBadgeText,
                      {
                        color:
                          activity.status === 'completed'
                            ? '#EF4444'
                            : activity.status === 'accepted'
                            ? '#10B981'
                            : '#F59E0B',
                      },
                    ]}
                  >
                    {activity.status === 'completed'
                      ? 'Donné'
                      : activity.status === 'accepted'
                      ? 'Reçu'
                      : 'En cours'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/buy-hours')}
          >
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Acheter des heures</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: 32,
  },
  balanceStat: {},
  balanceStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  goalBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeText: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '600',
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#1F2937',
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  goalMessage: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  activitySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  activityIconHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityServiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyActivity: {
    padding: 24,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
