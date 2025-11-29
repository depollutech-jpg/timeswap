import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface AnimatedFilterChipProps {
  isActive: boolean;
  onPress: () => void;
  icon: string;
  label: string;
}

export default function AnimatedFilterChip({ 
  isActive, 
  onPress, 
  icon, 
  label 
}: AnimatedFilterChipProps) {
  // Valeurs animées pour l'ondulation (similaire au header, mais plus subtile)
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // Animation ondulante très subtile
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

      // Pulsation très légère et imperceptible
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02, // Seulement 2% d'agrandissement (presque imperceptible)
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const animation1 = createWaveAnimation(wave1, 8000, 0);
      const animation2 = createWaveAnimation(wave2, 10000, 2000);

      animation1.start();
      animation2.start();
      pulseAnimation.start();

      return () => {
        animation1.stop();
        animation2.stop();
        pulseAnimation.stop();
      };
    } else {
      // Reset à la position normale si inactif
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  // Interpolation des couleurs (mêmes que le header)
  const backgroundColor1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#5DBFBF', '#3EADAD', '#2B9F9F'],
  });

  const backgroundColor2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3EADAD', '#2B9F9F', '#5DBFBF'],
  });

  const opacity1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.7, 0.5],
  });

  const opacity2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.8, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.chip,
          isActive && styles.chipActive,
        ]}
        activeOpacity={0.7}
      >
        {/* Fond animé uniquement si actif */}
        {isActive && (
          <>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.wave,
                {
                  backgroundColor: '#5DBFBF',
                  borderRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.wave,
                {
                  opacity: opacity1,
                  backgroundColor: backgroundColor1,
                  borderRadius: 20,
                },
              ]}
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.wave,
                {
                  opacity: opacity2,
                  backgroundColor: backgroundColor2,
                  borderRadius: 20,
                },
              ]}
            />
          </>
        )}

        {/* Contenu par-dessus */}
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: '#5DBFBF',
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    fontSize: 16,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    zIndex: 10,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
