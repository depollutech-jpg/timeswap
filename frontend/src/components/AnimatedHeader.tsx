import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnimatedHeaderProps {
  children?: React.ReactNode;
  height?: number;
}

export default function AnimatedHeader({ children, height = 200 }: AnimatedHeaderProps) {
  // Valeurs animées pour créer l'effet d'ondulation
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation douce et infinie des vagues
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

    // 3 vagues avec des vitesses différentes pour un effet naturel
    const animation1 = createWaveAnimation(wave1, 8000, 0);      // 8 secondes
    const animation2 = createWaveAnimation(wave2, 10000, 2000);  // 10 secondes, délai 2s
    const animation3 = createWaveAnimation(wave3, 12000, 4000);  // 12 secondes, délai 4s

    Animated.parallel([animation1, animation2, animation3]).start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  // Interpolation des couleurs pour créer l'ondulation (tons plus foncés pour visibilité du texte blanc)
  const gradientColors1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#5DBFBF', '#3EADAD', '#2B9F9F'], // Plus foncé, meilleure visibilité
  });

  const gradientColors2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3EADAD', '#2B9F9F', '#5DBFBF'],
  });

  const gradientColors3 = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#2B9F9F', '#5DBFBF', '#3EADAD'],
  });

  // Opacité des vagues pour l'effet de superposition
  const opacity1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const opacity2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.7, 0.4],
  });

  const opacity3 = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.8, 0.5],
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Fond de base avec dégradé */}
      <LinearGradient
        colors={['#DAF2E3', '#7DCFCF', '#2B9F9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Vague 1 - ondulation douce */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity1,
            backgroundColor: gradientColors1,
          },
        ]}
      />

      {/* Vague 2 - ondulation moyenne */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity2,
            backgroundColor: gradientColors2,
          },
        ]}
      />

      {/* Vague 3 - ondulation profonde */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity3,
            backgroundColor: gradientColors3,
          },
        ]}
      />

      {/* Contenu par-dessus l'animation */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
});
