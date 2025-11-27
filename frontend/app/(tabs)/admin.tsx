import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';

// Import conditionnel pour éviter les problèmes sur mobile
let PieChart: any = null;
let BarChart: any = null;

try {
  const charts = require('react-native-chart-kit');
  PieChart = charts.PieChart;
  BarChart = charts.BarChart;
} catch (error) {
  console.log('Charts library not available, using fallback');
}

const { width } = Dimensions.get('window');

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [servicesStats, setServicesStats] = useState<any>(null);
  const [exchangesFlow, setExchangesFlow] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      setLoading(false);
      return;
    }
    
    if (user?.role !== 'admin') {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions nécessaires');
      router.back();
      return;
    }
    
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [
        statsRes,
        usersRes,
        servicesStatsRes,
        exchangesFlowRes,
        transactionsRes,
      ] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=20'),
        api.get('/admin/services/stats'),
        api.get('/admin/exchanges/flow'),
        api.get('/admin/transactions?limit=20'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setServicesStats(servicesStatsRes.data);
      setExchangesFlow(exchangesFlowRes.data);
      setTransactions(transactionsRes.data);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      if (error.response?.status === 403) {
        Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions nécessaires');
        router.back();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBanUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Bannir l\'utilisateur',
      `Êtes-vous sûr de vouloir bannir ${userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bannir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/admin/users/${userId}/ban`);
              Alert.alert('Succès', 'Utilisateur banni');
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de bannir l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  const handleVerifyUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Vérifier l\'utilisateur',
      `Vérifier le profil de ${userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vérifier',
          onPress: async () => {
            try {
              await api.put(`/admin/users/${userId}/verify`);
              Alert.alert('Succès', 'Utilisateur vérifié');
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de vérifier l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Prepare chart data
  const servicesCategoryData = servicesStats?.byCategory.slice(0, 5).map((cat: any) => ({
    name: cat._id,
    population: cat.count,
    color: Colors.primary,
    legendFontColor: Colors.text,
    legendFontSize: 12,
  })) || [];

  const userBalancesData = {
    labels: exchangesFlow?.userBalances.slice(0, 8).map((u: any) => u.name.split(' ')[0]) || [],
    datasets: [
      {
        data: exchangesFlow?.userBalances.slice(0, 8).map((u: any) => u.given) || [],
        color: () => Colors.primary,
      },
      {
        data: exchangesFlow?.userBalances.slice(0, 8).map((u: any) => u.received) || [],
        color: () => Colors.secondary,
      },
    ],
    legend: ['Heures données', 'Heures reçues'],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Vue d'ensemble
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Utilisateurs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="people" size={32} color="#3B82F6" />
                <Text style={styles.statValue}>{stats?.users.total}</Text>
                <Text style={styles.statLabel}>Utilisateurs</Text>
                <Text style={styles.statSubtext}>{stats?.users.verified} vérifiés</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="list" size={32} color="#10B981" />
                <Text style={styles.statValue}>{stats?.services.total}</Text>
                <Text style={styles.statLabel}>Services</Text>
                <Text style={styles.statSubtext}>{stats?.services.active} actifs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="swap-horizontal" size={32} color="#F59E0B" />
                <Text style={styles.statValue}>{stats?.exchanges.total}</Text>
                <Text style={styles.statLabel}>Échanges</Text>
                <Text style={styles.statSubtext}>{stats?.exchanges.completed} complétés</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="cash" size={32} color="#EF4444" />
                <Text style={styles.statValue}>{stats?.revenue.toFixed(2)}€</Text>
                <Text style={styles.statLabel}>Revenus</Text>
                <Text style={styles.statSubtext}>{stats?.transactions.paid} paiements</Text>
              </View>
            </View>

            {/* Services by Category Chart */}
            {servicesCategoryData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Répartition des services par catégorie</Text>
                {PieChart ? (
                  <PieChart
                    data={servicesCategoryData}
                    width={width - 48}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                ) : (
                  <View style={styles.fallbackChart}>
                    {servicesCategoryData.map((item: any, index: number) => (
                      <View key={index} style={styles.fallbackChartItem}>
                        <Text style={styles.fallbackChartLabel}>{item.name}</Text>
                        <Text style={styles.fallbackChartValue}>{item.population}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* User Balances Chart */}
            {exchangesFlow && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Heures données vs reçues (Top 8)</Text>
                {BarChart ? (
                  <BarChart
                    data={userBalancesData}
                    width={width - 48}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="h"
                    chartConfig={{
                      backgroundColor: Colors.surface,
                      backgroundGradientFrom: Colors.surface,
                      backgroundGradientTo: Colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.fallbackChart}>
                    {exchangesFlow?.userBalances.slice(0, 8).map((u: any, index: number) => (
                      <View key={index} style={styles.fallbackChartItem}>
                        <Text style={styles.fallbackChartLabel}>{u.name}</Text>
                        <Text style={styles.fallbackChartValue}>
                          Données: {u.given}h | Reçues: {u.received}h
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Exchanges Flow */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Flux d'échanges</Text>
              <View style={styles.flowStat}>
                <Ionicons name="infinite" size={24} color={Colors.primary} />
                <Text style={styles.flowValue}>{exchangesFlow?.totalHoursExchanged.toFixed(0)}h</Text>
                <Text style={styles.flowLabel}>Total échangé</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'users' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gestion des utilisateurs</Text>
            {users.map((u: any) => (
              <View key={u._id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {u.profile.firstName} {u.profile.lastName}
                  </Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <View style={styles.userStats}>
                    <Text style={styles.userStat}>
                      Niveau {u.gamification.level} • {u.credits.available.toFixed(1)}h
                    </Text>
                    {u.verification.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    )}
                    {u.isBanned && (
                      <View style={styles.bannedBadge}>
                        <Text style={styles.bannedText}>Banni</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.userActions}>
                  {!u.verification.isVerified && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleVerifyUser(u._id, `${u.profile.firstName} ${u.profile.lastName}`)}
                    >
                      <Ionicons name="checkmark" size={20} color={Colors.success} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleBanUser(u._id, `${u.profile.firstName} ${u.profile.lastName}`)}
                  >
                    <Ionicons name="ban" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dernières transactions</Text>
            {transactions.map((t: any) => (
              <View key={t._id} style={styles.transactionCard}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionUser}>{t.userName}</Text>
                  <Text style={styles.transactionEmail}>{t.userEmail}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.transactionHours}>{t.hours}h</Text>
                  <Text style={styles.transactionPrice}>{t.amount.toFixed(2)}€</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          t.payment_status === 'paid'
                            ? Colors.success + '20'
                            : Colors.warning + '20',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: t.payment_status === 'paid' ? Colors.success : Colors.warning,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {t.payment_status === 'paid' ? 'Payé' : 'En attente'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  flowStat: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  flowValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  flowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  userStat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bannedBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bannedText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: Colors.error + '20',
  },
  transactionCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionHours: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  fallbackChart: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  fallbackChartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fallbackChartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  fallbackChartValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
