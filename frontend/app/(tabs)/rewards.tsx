import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';

export default function RewardsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaderboardRes, badgesRes] = await Promise.all([
        api.get('/leaderboard?limit=10'),
        api.get('/badges'),
      ]);
      setLeaderboard(leaderboardRes.data);
      setBadges(badgesRes.data);
    } catch (error) {
      console.error('Failed to load rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressToNextLevel = user ? ((user.gamification.xp % 100) / 100) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Récompenses</Text>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Niveau {user?.gamification.level}</Text>
              <Text style={styles.levelSubtitle}>{user?.gamification.xp} XP</Text>
            </View>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => router.push('/buy-hours')}
            >
              <Ionicons name="cart" size={20} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Acheter</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressToNextLevel}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {100 - (user?.gamification.xp % 100)} XP pour le niveau suivant
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques RPG</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flash" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{user?.gamification.stats.force}</Text>
              <Text style={styles.statLabel}>Force</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bulb" size={32} color={Colors.secondary} />
              <Text style={styles.statValue}>{user?.gamification.stats.sagesse}</Text>
              <Text style={styles.statLabel}>Sagesse</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="hand-right" size={32} color={Colors.success} />
              <Text style={styles.statValue}>{user?.gamification.stats.dexterite}</Text>
              <Text style={styles.statLabel}>Dextérité</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges disponibles</Text>
          {badges.map((badge: any) => (
            <View key={badge.id} style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                <Text style={styles.badgeXP}>{badge.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classement</Text>
          {leaderboard.map((entry: any) => (
            <View key={entry.userId} style={styles.leaderboardCard}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.rankText}>#{entry.rank}</Text>
              </View>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.leaderboardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.leaderboardName}>{entry.name}</Text>
                  {entry.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  )}
                </View>
                <Text style={styles.leaderboardLevel}>Niveau {entry.level}</Text>
              </View>
              <Text style={styles.leaderboardXP}>{entry.xp} XP</Text>
            </View>
          ))}
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  levelCard: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  badgeXP: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  leaderboardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  leaderboardLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
