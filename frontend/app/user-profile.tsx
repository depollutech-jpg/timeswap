import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import api from '../src/utils/api';
import { useAuthStore } from '../src/store/authStore';

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'ratings' | 'badges'>('about');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    loadRatings();
  }, [id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${id}/profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const response = await api.get(`/users/${id}/ratings`);
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error('Failed to load ratings:', error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFC107"
        />
      );
    }
    return stars;
  };

  const getBadgeIcon = (badge: string) => {
    const badges: any = {
      verified: { icon: 'checkmark-circle', color: '#10B981' },
      expert: { icon: 'school', color: '#3B82F6' },
      helper: { icon: 'hand-left', color: '#F59E0B' },
      social: { icon: 'people', color: '#EC4899' },
      time_saver: { icon: 'time', color: '#8B5CF6' },
    };
    return badges[badge] || { icon: 'medal', color: Colors.primary };
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.textSecondary} />
          <Text style={styles.errorText}>Profil introuvable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?._id === id;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile.photo ? (
                <Image source={{ uri: profile.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={48} color={Colors.textSecondary} />
                </View>
              )}
              {profile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              )}
            </View>

            <Text style={styles.userName}>{profile.name}</Text>

            {profile.bio && <Text style={styles.userBio}>{profile.bio}</Text>}

            {profile.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.xp}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.completedExchanges || 0}</Text>
                <Text style={styles.statLabel}>Echanges</Text>
              </View>
              <View style={styles.statBox}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={20} color="#FFC107" />
                  <Text style={styles.statValue}>
                    {profile.rating?.average?.toFixed(1) || '0.0'}
                  </Text>
                </View>
                <Text style={styles.statLabel}>
                  {profile.rating?.count || 0} avis
                </Text>
              </View>
            </View>

            {/* Member Since */}
            <Text style={styles.memberSince}>
              Membre depuis {new Date(profile.memberSince).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.tabActive]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
                A propos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'ratings' && styles.tabActive]}
              onPress={() => setActiveTab('ratings')}
            >
              <Text style={[styles.tabText, activeTab === 'ratings' && styles.tabTextActive]}>
                Avis ({ratings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
              onPress={() => setActiveTab('badges')}
            >
              <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
                Badges ({profile.badges?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {/* About Tab */}
            {activeTab === 'about' && (
              <View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Statistiques</Text>
                  {profile.stats && Object.keys(profile.stats).length > 0 ? (
                    <View style={styles.statsGrid}>
                      {Object.entries(profile.stats).map(([key, value]: any) => (
                        <View key={key} style={styles.statCard}>
                          <Text style={styles.statCardValue}>{value}</Text>
                          <Text style={styles.statCardLabel}>
                            {key === 'force' && 'Force'}
                            {key === 'sagesse' && 'Sagesse'}
                            {key === 'charisme' && 'Charisme'}
                            {key === 'agilite' && 'Agilite'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Aucune statistique disponible</Text>
                  )}
                </View>

                {isOwnProfile && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes informations</Text>
                    <View style={styles.infoCard}>
                      <Ionicons name="information-circle" size={20} color={Colors.info} />
                      <Text style={styles.infoText}>
                        Ceci est votre profil public. Les autres utilisateurs voient ces informations.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <View>
                {ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <View key={rating._id} style={styles.ratingCard}>
                      <View style={styles.ratingHeader}>
                        <View style={styles.ratingUserInfo}>
                          {rating.fromUser?.photo ? (
                            <Image
                              source={{ uri: rating.fromUser.photo }}
                              style={styles.ratingAvatar}
                            />
                          ) : (
                            <View style={[styles.ratingAvatar, styles.avatarPlaceholder]}>
                              <Ionicons name="person" size={16} color={Colors.textSecondary} />
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.ratingUserName}>{rating.fromUser?.name}</Text>
                            <View style={styles.starsRow}>{renderStars(rating.rating)}</View>
                          </View>
                        </View>
                        <Text style={styles.ratingDate}>
                          {new Date(rating.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      {rating.review && (
                        <Text style={styles.ratingReview}>{rating.review}</Text>
                      )}
                      <Text style={styles.ratingService}>
                        Service: {rating.serviceTitle}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="star-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
                  </View>
                )}
              </View>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <View>
                {profile.badges && profile.badges.length > 0 ? (
                  <View style={styles.badgesGrid}>
                    {profile.badges.map((badge: string, index: number) => {
                      const badgeInfo = getBadgeIcon(badge);
                      return (
                        <View key={index} style={styles.badgeCard}>
                          <View
                            style={[
                              styles.badgeIcon,
                              { backgroundColor: badgeInfo.color + '20' },
                            ]}
                          >
                            <Ionicons
                              name={badgeInfo.icon as any}
                              size={32}
                              color={badgeInfo.color}
                            />
                          </View>
                          <Text style={styles.badgeName}>
                            {badge.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="medal-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyText}>Aucun badge gagne pour le moment</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberSince: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '20',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ratingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  ratingUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  ratingDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingReview: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  ratingService: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
