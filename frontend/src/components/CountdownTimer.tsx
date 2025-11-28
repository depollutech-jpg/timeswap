import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Typography, BorderRadius } from '../constants/typography';

interface CountdownTimerProps {
  expiresAt: string;
  createdAt: string;
  compact?: boolean;
}

type TimerState = 'normal' | 'warning' | 'danger' | 'expired';

export default function CountdownTimer({ expiresAt, createdAt, compact = false }: CountdownTimerProps) {
  const { colors, mode } = useThemeStore();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [timerState, setTimerState] = useState<TimerState>('normal');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiryDate = new Date(expiresAt).getTime();
      const difference = expiryDate - now;

      if (difference <= 0) {
        setTimeRemaining('Expiré');
        setTimerState('expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Déterminer l'état du timer selon TimeSwap specs
      const totalHours = days * 24 + hours;
      if (totalHours < 2) {
        setTimerState('danger'); // <2h : rouge + pulsation
      } else if (totalHours < 24) {
        setTimerState('warning'); // 2h-24h : orange
      } else {
        setTimerState('normal'); // >24h : bleu
      }

      if (compact) {
        // Format compact: "2j 5h 30m"
        if (days > 0) {
          setTimeRemaining(`${days}j ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      } else {
        // Format complet: "Expire dans : 2j 5h 30m 15s"
        setTimeRemaining(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, compact]);

  // Animation pulsation pour danger
  useEffect(() => {
    if (timerState === 'danger') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerState]);

  const getTimerStyles = () => {
    switch (timerState) {
      case 'expired':
        return {
          backgroundColor: colors.border,
          textColor: colors.textSecondary,
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger + '20',
          textColor: colors.danger,
          icon: 'warning' as keyof typeof Ionicons.glyphMap,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '20',
          textColor: colors.warning,
          icon: 'time' as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          backgroundColor: colors.primary + '20',
          textColor: colors.primary,
          icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const timerStyles = getTimerStyles();

  // Mode daltonien : ajouter motif diagonal
  const isDaltonien = mode === 'colorblind';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: timerStyles.backgroundColor,
          transform: timerState === 'danger' ? [{ scale: pulseAnim }] : [],
        },
        isDaltonien && timerState === 'danger' && styles.daltonienPattern,
      ]}
    >
      <Ionicons name={timerStyles.icon} size={compact ? 12 : 16} color={timerStyles.textColor} />
      <Text
        style={[
          compact ? Typography.small : Typography.label,
          { color: timerStyles.textColor, fontWeight: '600' },
        ]}
      >
        {compact ? timeRemaining : `Expire dans : ${timeRemaining}`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  daltonienPattern: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
});
