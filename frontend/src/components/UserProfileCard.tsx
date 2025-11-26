import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface UserProfileCardProps {
  user: {
    _id: string;
    name: string;
    photo?: string;
    level: number;
    xp: number;
    rating?: {
      average: number;
      count: number;
    };
    completedExchanges?: number;
    isVerified?: boolean;
  };
  compact?: boolean;
}

export default function UserProfileCard({ user, compact = false }: UserProfileCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFC107" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFC107" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#FFC107" />);
      }
    }
    
    return stars;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.compactAvatar} />
        ) : (
          <View style={[styles.compactAvatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={20} color={Colors.textSecondary} />
          </View>
        )}
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.compactName}>{user.name}</Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            )}
          </View>
          {user.rating && user.rating.count > 0 && (
            <View style={styles.compactRating}>
              {renderStars(user.rating.average)}
              <Text style={styles.ratingText}>({user.rating.count})</Text>
            </View>
          )}
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Niv. {user.level}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={40} color={Colors.textSecondary} />
          </View>
        )}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
          <View style={styles.levelRow}>
            <Ionicons name="flash" size={16} color={Colors.primary} />
            <Text style={styles.levelLabel}>Niveau {user.level}</Text>
            <Text style={styles.xpText}>{user.xp} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        {user.rating && user.rating.count > 0 && (
          <View style={styles.stat}>
            <View style={styles.starsRow}>
              {renderStars(user.rating.average)}
            </View>
            <Text style={styles.statValue}>{user.rating.average.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{user.rating.count} avis</Text>
          </View>
        )}
        
        {user.completedExchanges !== undefined && (
          <View style={styles.stat}>
            <Ionicons name="checkmark-done" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{user.completedExchanges}</Text>
            <Text style={styles.statLabel}>Echanges</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  levelBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
