import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

interface FixedAnimatedHeaderProps {
  title?: string;
  showNotification?: boolean;
}

export default function FixedAnimatedHeader({ 
  title = 'TimeSwap',
  showNotification = true 
}: FixedAnimatedHeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  
  // Valeurs animées pour créer l'effet d'ondulation
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation plus visible et fluide des vagues
    const createWaveAnimation = (animatedValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: false,
          }),
        ])
      );
    };

    // Animations plus rapides pour être plus visibles (durées réduites)
    const animation1 = createWaveAnimation(wave1, 4000, 0);      // 4 secondes
    const animation2 = createWaveAnimation(wave2, 5000, 1000);   // 5 secondes, délai 1s
    const animation3 = createWaveAnimation(wave3, 6000, 2000);   // 6 secondes, délai 2s

    Animated.parallel([animation1, animation2, animation3]).start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  // Interpolation des couleurs (mêmes que AnimatedHeader)
  const gradientColors1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#5DBFBF', '#3EADAD', '#2B9F9F'],
  });

  const gradientColors2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3EADAD', '#2B9F9F', '#5DBFBF'],
  });

  const gradientColors3 = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#2B9F9F', '#5DBFBF', '#3EADAD'],
  });

  const opacity1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  const opacity2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.9, 0.5],
  });

  const opacity3 = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Fond de base avec dégradé */}
      <LinearGradient
        colors={['#5DBFBF', '#3EADAD', '#2B9F9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Vague 1 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity1,
            backgroundColor: gradientColors1,
          },
        ]}
      />

      {/* Vague 2 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity2,
            backgroundColor: gradientColors2,
          },
        ]}
      />

      {/* Vague 3 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity3,
            backgroundColor: gradientColors3,
          },
        ]}
      />

      {/* Contenu du header */}
      <View style={styles.content}>
        {/* Logo/Titre à gauche */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>

        {/* Icônes à droite */}
        <View style={styles.actions}>
          {showNotification && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
