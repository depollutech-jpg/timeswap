import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AnimatedTimeBackground({ children }: { children: React.ReactNode }) {
  // Multiples valeurs animées pour créer une fluctuation du temps
  const timeWave1 = useRef(new Animated.Value(0)).current;
  const timeWave2 = useRef(new Animated.Value(0)).current;
  const timeWave3 = useRef(new Animated.Value(0)).current;
  const timeWave4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation qui évoque le temps qui passe - fluctuations douces et continues
    const createTimeFluctuation = (animatedValue: Animated.Value, duration: number, delay: number) => {
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

    // 4 vagues de temps avec des vitesses différentes pour un effet naturel et fluide
    const fluctuation1 = createTimeFluctuation(timeWave1, 12000, 0);      // 12 secondes
    const fluctuation2 = createTimeFluctuation(timeWave2, 15000, 3000);   // 15 secondes, délai 3s
    const fluctuation3 = createTimeFluctuation(timeWave3, 18000, 6000);   // 18 secondes, délai 6s
    const fluctuation4 = createTimeFluctuation(timeWave4, 20000, 9000);   // 20 secondes, délai 9s

    Animated.parallel([fluctuation1, fluctuation2, fluctuation3, fluctuation4]).start();

    return () => {
      fluctuation1.stop();
      fluctuation2.stop();
      fluctuation3.stop();
      fluctuation4.stop();
    };
  }, []);

  // Interpolation des couleurs pour le dégradé (couleurs du header)
  const gradientColor1 = timeWave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#5DBFBF', '#3EADAD', '#2B9F9F'], // Turquoise clair à foncé
  });

  const gradientColor2 = timeWave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#3EADAD', '#2B9F9F', '#5DBFBF'], // Rotation des couleurs
  });

  const gradientColor3 = timeWave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#2B9F9F', '#5DBFBF', '#3EADAD'], // Rotation inverse
  });

  const gradientColor4 = timeWave4.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#79C3B6', '#5DBFBF', '#3EADAD'], // Nuances plus claires
  });

  // Opacités pour créer la fluctuation du temps
  const opacity1 = timeWave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });

  const opacity2 = timeWave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.6, 0.4],
  });

  const opacity3 = timeWave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.7, 0.5],
  });

  const opacity4 = timeWave4.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.8, 0.6],
  });

  // Transformation pour l'effet de fluctuation temporelle
  const scale1 = timeWave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  const scale2 = timeWave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  return (
    <Animated.View style={styles.container}>
      {/* Dégradé de base - toujours présent */}
      <LinearGradient
        colors={['#5DBFBF', '#3EADAD', '#2B9F9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Couche de fluctuation 1 - effet de temps qui ondule */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity1,
            backgroundColor: gradientColor1,
            transform: [{ scale: scale1 }],
          },
        ]}
      />

      {/* Couche de fluctuation 2 - superposition douce */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity2,
            backgroundColor: gradientColor2,
          },
        ]}
      />

      {/* Couche de fluctuation 3 - profondeur */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity3,
            backgroundColor: gradientColor3,
            transform: [{ scale: scale2 }],
          },
        ]}
      />

      {/* Couche de fluctuation 4 - touches finales */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacity4,
            backgroundColor: gradientColor4,
          },
        ]}
      />

      {/* Contenu par-dessus les fluctuations */}
      <Animated.View style={styles.content}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
