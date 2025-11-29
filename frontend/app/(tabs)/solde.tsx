import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import PageTitle from '../../src/components/PageTitle';

export default function SoldeScreen() {
  const { user, setUser } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();

    // Animation bounce pour la carte de solde
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation slide pour les actions rapides et l'historique
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      const [exchangesRes, userRes] = await Promise.all([
        api.get('/exchanges/my/all'),
        api.get('/auth/me'),
      ]);
      setExchanges(exchangesRes.data);
      setUser(userRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const hoursGiven = user?.credits.given || 0;
  const hoursReceived = user?.credits.received || 0;
  const monthlyGoal = 60;
  const goalProgress = Math.min((hoursGiven / monthlyGoal) * 100, 100);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Titre de la page */}
        <PageTitle title="Solde de temps" />
        
        {/* Carte Solde Principal */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: bounceAnim,
            },
          ]}
        >
          <View style={[styles.balanceGradient, { backgroundColor: colors.surface }]}>
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceTitle, { color: colors.text }]}>Solde actuel</Text>
              <TouchableOpacity>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.balanceAmount, { color: colors.primary }]}>{user?.credits.available.toFixed(1)} heures</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={[styles.balanceStatLabel, { color: colors.textSecondary }]}>Heures données</Text>
                <Text style={[styles.balanceStatValue, { color: colors.text }]}>↑ {hoursGiven.toFixed(0)}h</Text>
              </View>
              <View style={styles.balanceStat}>
                <Text style={[styles.balanceStatLabel, { color: colors.textSecondary }]}>Heures reçues</Text>
                <Text style={[styles.balanceStatValue, { color: colors.text }]}>↓ {hoursReceived.toFixed(0)}h</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Actions Rapides avec animation slide */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/buy-hours')}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Acheter des heures</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/create-service?type=offer')}
          >
            <Ionicons name="gift" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Donner des heures</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Objectif mensuel */}
        <View style={[styles.goalCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIcon}>
              <Ionicons name="calendar" size={20} color="#A855F7" />
            </View>
            <Text style={[styles.goalTitle, { color: colors.text }]}>Objectif mensuel</Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>
                {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
              </Text>
            </View>
          </View>
          <View style={styles.goalProgress}>
            <Text style={styles.goalText}>{hoursGiven.toFixed(0)}h / {monthlyGoal}h</Text>
            <Text style={styles.goalPercentage}>{goalProgress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
          </View>
          <Text style={styles.goalMessage}>
            Plus que {(monthlyGoal - hoursGiven).toFixed(0)} heures pour atteindre votre objectif ! 🎯
          </Text>
        </View>

        {/* Historique des échanges */}
        <View style={[styles.historySection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconHeader}>
              <Ionicons name="time" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique des échanges</Text>
          </View>

          {exchanges.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="swap-horizontal-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun échange pour le moment</Text>
              <Text style={styles.emptySubtext}>
                Commencez par proposer ou demander un service
              </Text>
            </View>
          ) : (
            exchanges.map((exchange) => (
              <View key={exchange._id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={
                      exchange.status === 'completed'
                        ? 'checkmark-circle'
                        : exchange.status === 'accepted'
                        ? 'time'
                        : 'hourglass'
                    }
                    size={24}
                    color={
                      exchange.status === 'completed'
                        ? Colors.success
                        : exchange.status === 'accepted'
                        ? Colors.info
                        : Colors.warning
                    }
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>
                    {exchange.service?.title || 'Service'}
                  </Text>
                  <Text style={styles.historyUser}>
                    {exchange.otherUser?.name}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(exchange.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text
                    style={[
                      styles.historyHours,
                      {
                        color:
                          exchange.providerId === user?._id
                            ? Colors.primary
                            : Colors.success,
                      },
                    ]}
                  >
                    {exchange.providerId === user?._id ? '+' : '-'}
                    {exchange.duration}h
                  </Text>
                  {exchange.xpAwarded > 0 && (
                    <View style={styles.xpBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.xpText}>+{exchange.xpAwarded} XP</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 60, // Espace pour le header fixe
    paddingBottom: 100,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  balanceContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: 32,
  },
  balanceStat: {},
  balanceStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
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
    color: Colors.text,
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
    textTransform: 'capitalize',
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: Colors.text,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
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
    color: Colors.textSecondary,
  },
  historySection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionIconHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  historyUser: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyHours: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
