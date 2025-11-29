import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/utils/api';
import PageTitle from '../../src/components/PageTitle';

const { width } = Dimensions.get('window');

// Partenaires locaux fictifs
const LOCAL_PARTNERS = [
  {
    id: '1',
    name: 'IKEA',
    description: '10% de réduction sur l\'achat',
    requiredLevel: 5,
    icon: '🪩1',
    color: '#0051BA',
  },
  {
    id: '2',
    name: 'Boulangerie du Coin',
    description: '1 croissant offert',
    requiredLevel: 3,
    icon: '🥐',
    color: '#F59E0B',
  },
  {
    id: '3',
    name: 'Café des Arts',
    description: 'Café gratuit',
    requiredLevel: 2,
    icon: '☕',
    color: '#8B4513',
  },
  {
    id: '4',
    name: 'Librairie Martin',
    description: '5€ de réduction',
    requiredLevel: 4,
    icon: '📚',
    color: '#10B981',
  },
  {
    id: '5',
    name: 'Restaurant Le Jardin',
    description: '15% sur l\'addition',
    requiredLevel: 6,
    icon: '🍽️',
    color: '#EF4444',
  },
  {
    id: '6',
    name: 'Cinéma Palace',
    description: 'Place à tarif réduit',
    requiredLevel: 5,
    icon: '🎥',
    color: '#8B5CF6',
  },
];

import { useThemeStore } from '../../src/store/themeStore';

export default function RewardsScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const progressToNextLevel = user ? ((user.gamification.xp % 100) / 100) * 100 : 0;
  const userRank = leaderboard.findIndex((u: any) => u.userId === user?._id) + 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
        <PageTitle title="Récompenses" subtitle={`Niveau ${user?.gamification.level} - ${user?.gamification.xp} XP`} />
        
        {/* Level Card */}
        <View style={[styles.levelCardContainer, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.levelCardContent}>
              <View style={styles.levelHeader}>
                <View>
                  <Text style={[styles.levelBadge, { color: '#3EADAD' }]}>Niveau {user?.gamification.level}</Text>
                  <Text style={[styles.levelXP, { color: '#3EADAD', opacity: 0.8 }]}>{user?.gamification.xp} XP</Text>
                </View>
                {userRank > 0 && (
                  <View style={styles.rankBadge}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                    <Text style={styles.rankText}>#{userRank}</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressToNextLevel}%` }]} />
                </View>
              </View>
              <Text style={[styles.progressText, { color: '#3EADAD', opacity: 0.7 }]}>
                {100 - (user?.gamification.xp % 100)} XP pour le niveau {(user?.gamification.level || 0) + 1}
              </Text>

              {/* Stats RPG */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="flash" size={20} color="#3EADAD" />
                  <Text style={[styles.statLabel, { color: '#3EADAD' }]}>Force</Text>
                  <Text style={[styles.statValue, { color: '#3EADAD' }]}>{user?.gamification.stats.force}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="bulb" size={20} color="#3EADAD" />
                  <Text style={[styles.statLabel, { color: '#3EADAD' }]}>Sagesse</Text>
                  <Text style={[styles.statValue, { color: '#3EADAD' }]}>{user?.gamification.stats.sagesse}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="hand-right" size={20} color="#3EADAD" />
                  <Text style={[styles.statLabel, { color: '#3EADAD' }]}>Dextérité</Text>
                  <Text style={[styles.statValue, { color: '#3EADAD' }]}>{user?.gamification.stats.dexterite}</Text>
                </View>
              </View>
            </View>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medal" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Mes badges</Text>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map((badge: any) => {
              const isEarned = user?.gamification.badges.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    !isEarned && styles.badgeCardLocked,
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeXP}>{badge.xp} XP</Text>
                  {isEarned && (
                    <View style={styles.earnedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Partenaires Locaux */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Partenaires locaux</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Débloquez des réductions et bons d'achat chez nos partenaires en montant de niveau
          </Text>
          {LOCAL_PARTNERS.map((partner) => {
            const isUnlocked = (user?.gamification.level || 0) >= partner.requiredLevel;
            return (
              <TouchableOpacity
                key={partner.id}
                style={[
                  styles.partnerCard,
                  !isUnlocked && styles.partnerCardLocked,
                ]}
                disabled={!isUnlocked}
              >
                <View
                  style={[
                    styles.partnerIcon,
                    { backgroundColor: isUnlocked ? partner.color + '20' : Colors.border },
                  ]}
                >
                  <Text style={styles.partnerEmoji}>{partner.icon}</Text>
                </View>
                <View style={styles.partnerInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    {!isUnlocked && (
                      <View style={styles.levelRequiredBadge}>
                        <Ionicons name="lock-closed" size={12} color={Colors.textSecondary} />
                        <Text style={styles.levelRequiredText}>Niv. {partner.requiredLevel}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.partnerDescription,
                      !isUnlocked && styles.partnerDescriptionLocked,
                    ]}
                  >
                    {partner.description}
                  </Text>
                </View>
                {isUnlocked && (
                  <Ionicons name="chevron-forward" size={20} color={partner.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Classement</Text>
          </View>
          {leaderboard.map((entry: any, index) => {
            const isCurrentUser = entry.userId === user?._id;
            const rankColor =
              index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#CD7F32' : Colors.textSecondary;

            return (
              <View
                key={entry.userId}
                style={[
                  styles.leaderboardCard,
                  isCurrentUser && styles.leaderboardCardHighlight,
                ]}
              >
                <View style={[styles.leaderboardRank, { backgroundColor: rankColor + '20' }]}>
                  <Text style={[styles.rankNumber, { color: rankColor }]}>#{entry.rank}</Text>
                </View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {entry.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.leaderboardName, isCurrentUser && styles.leaderboardNameHighlight]}>
                      {entry.name}
                      {isCurrentUser && ' (Vous)'}
                    </Text>
                    {entry.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    )}
                  </View>
                  <Text style={styles.leaderboardLevel}>Niveau {entry.level}</Text>
                </View>
                <View style={styles.leaderboardXP}>
                  <Text style={styles.leaderboardXPValue}>{entry.xp}</Text>
                  <Text style={styles.leaderboardXPLabel}>XP</Text>
                </View>
              </View>
            );
          })}
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
    paddingBottom: 100,
  },
  levelCardContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  levelCard: {
    padding: 20,
  },
  levelCardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelBadge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelXP: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeXP: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  partnerCardLocked: {
    opacity: 0.6,
  },
  partnerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerEmoji: {
    fontSize: 28,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  partnerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  partnerDescriptionLocked: {
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  levelRequiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  levelRequiredText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  leaderboardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  leaderboardCardHighlight: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  leaderboardNameHighlight: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  leaderboardLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leaderboardXP: {
    alignItems: 'flex-end',
  },
  leaderboardXPValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  leaderboardXPLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
