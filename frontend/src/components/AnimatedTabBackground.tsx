import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedTabBackgroundProps {
  size?: number;
}

export default function AnimatedTabBackground({ size = 40 }: AnimatedTabBackgroundProps) {
  // Valeurs animées pour créer l'effet d'ondulation (mêmes que AnimatedHeader)
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation douce et infinie des vagues (identique à AnimatedHeader)
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

  // Interpolation des couleurs pour créer l'ondulation (mêmes couleurs que AnimatedHeader)
  const backgroundColor1 = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#5DBFBF', '#3EADAD', '#2B9F9F'],
  });

  const backgroundColor2 = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3EADAD', '#2B9F9F', '#5DBFBF'],
  });

  const backgroundColor3 = wave3.interpolate({
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
    <>
      {/* Fond de base */}
      <Animated.View
        style={[
          styles.wave,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#5DBFBF',
          },
        ]}
      />

      {/* Vague 1 - ondulation douce */}
      <Animated.View
        style={[
          styles.wave,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: opacity1,
            backgroundColor: backgroundColor1,
          },
        ]}
      />

      {/* Vague 2 - ondulation moyenne */}
      <Animated.View
        style={[
          styles.wave,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: opacity2,
            backgroundColor: backgroundColor2,
          },
        ]}
      />

      {/* Vague 3 - ondulation profonde */}
      <Animated.View
        style={[
          styles.wave,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: opacity3,
            backgroundColor: backgroundColor3,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
