import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNotificationStore } from '../store/notificationStore';
import { useThemeStore } from '../store/themeStore';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationStore();
  const { colors } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const [contentWidth, setContentWidth] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<any>(null);
  const isUserInteractingRef = useRef(false);
  const velocityRef = useRef(0.2); // Vitesse initiale très lente
  const targetVelocity = 0.2; // Vitesse cible pour l'auto-scroll

  // Animation de défilement automatique avec requestAnimationFrame
  const autoScroll = useCallback(() => {
    // STOP COMPLET si l'utilisateur interagit
    if (isUserInteractingRef.current || contentWidth <= SCREEN_WIDTH) {
      // Ne pas continuer l'animation si l'utilisateur touche
      return;
    }

    // Augmenter progressivement la vitesse (ramp-up)
    if (velocityRef.current < targetVelocity) {
      velocityRef.current = Math.min(velocityRef.current + 0.01, targetVelocity);
    }

    scrollX.current += velocityRef.current;
    
    // Boucle infinie : retour au début quand on atteint la moitié (contenu dupliqué)
    if (scrollX.current >= contentWidth / 2) {
      scrollX.current = 0;
    }
    
    scrollViewRef.current?.scrollTo({
      x: scrollX.current,
      animated: false,
    });

    // Continuer l'animation SEULEMENT si l'utilisateur n'interagit pas
    if (!isUserInteractingRef.current) {
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    }
  }, [contentWidth]);

  // Démarrer l'auto-scroll
  const startAutoScroll = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Reset velocity pour ramp-up
    velocityRef.current = 0;
    
    animationFrameRef.current = requestAnimationFrame(autoScroll);
  }, [autoScroll]);

  // Arrêter complètement l'auto-scroll
  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    velocityRef.current = 0;
  }, []);

  // Effet pour démarrer l'auto-scroll initial
  useEffect(() => {
    if (contentWidth > SCREEN_WIDTH) {
      startAutoScroll();
    }

    return () => {
      stopAutoScroll();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [contentWidth, startAutoScroll, stopAutoScroll]);

  // L'utilisateur TOUCHE le footer (premier contact)
  const handleTouchStart = () => {
    // Arrêt IMMÉDIAT à 100% de l'auto-scroll dès le touch
    isUserInteractingRef.current = true;
    stopAutoScroll();
    
    // Annuler tout timer d'inactivité en cours
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  // L'utilisateur commence à drag/scroll
  const handleScrollBeginDrag = () => {
    // Double sécurité : s'assurer que l'auto-scroll est bien arrêté
    isUserInteractingRef.current = true;
    stopAutoScroll();
  };

  // L'utilisateur relâche le doigt
  const handleScrollEndDrag = () => {
    // Marquer que l'utilisateur a relâché
    // On attend juste la fin de l'inertie maintenant
  };

  // Fin de l'inertie naturelle
  const handleMomentumScrollEnd = (event: any) => {
    // Capturer la position finale après l'inertie
    const finalScrollX = event.nativeEvent.contentOffset.x;
    scrollX.current = finalScrollX;
    
    // Attendre 3 secondes après le relâchement avant de reprendre l'auto-scroll
    inactivityTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      startAutoScroll(); // Reprise avec ramp-up
    }, 3000); // 3 secondes d'attente
  };

  // Suivi du scroll manuel (mise à jour de la position)
  const handleScroll = (event: any) => {
    if (isUserInteractingRef.current) {
      scrollX.current = event.nativeEvent.contentOffset.x;
    }
  };

  // Dupliquer les routes pour créer l'effet de boucle infinie
  const duplicatedRoutes = [...state.routes, ...state.routes];

  const renderTabItem = (route: any, index: number, isDuplicate: boolean = false) => {
    const actualIndex = index % state.routes.length;
    const { options } = descriptors[state.routes[actualIndex].key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === actualIndex && !isDuplicate;

    // Ignorer les routes cachées
    if (options.href === null) {
      return null;
    }

    return (
      <TabItem
        key={`${route.key}-${isDuplicate ? 'dup' : 'orig'}`}
        route={route}
        label={label}
        isFocused={isFocused}
        options={options}
        navigation={navigation}
        unreadCount={unreadCount}
        themeColors={colors}
      />
    );
  };

  return (
    <BlurView intensity={80} tint="light" style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onContentSizeChange={(width) => setContentWidth(width)}
        onTouchStart={handleTouchStart}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        decelerationRate="fast"
        bounces={false}
      >
        {duplicatedRoutes.map((route, index) => {
          return renderTabItem(route, index, index >= state.routes.length);
        })}
      </ScrollView>
    </BlurView>
  );
}

// Composant TabItem avec animation de scaling
function TabItem({ route, label, isFocused, options, navigation, unreadCount, themeColors }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    // Animation de scaling au tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  const IconComponent = options.tabBarIcon;
  const showBadge = route.name === 'messages' && unreadCount > 0;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.tab,
          isFocused && styles.tabActive,
        ]}
        activeOpacity={0.7}
      >
        <View style={[
          styles.tabContent,
          isFocused && styles.tabContentActive,
        ]}>
          {IconComponent && (
            <View style={styles.iconContainer}>
              {IconComponent({
                color: isFocused ? themeColors.primary : themeColors.textSecondary,
                size: 22,
                focused: isFocused,
              })}
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Text
            style={[
              styles.tabLabel,
              { color: themeColors.textSecondary },
              isFocused && [styles.tabLabelActive, { color: themeColors.primary }],
            ]}
          >
            {typeof label === 'string' ? label : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function OldCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationStore();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {state.routes.map((route, index) => {
          return null;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 6,
    minWidth: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderColor: 'rgba(255, 107, 157, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tabContent: {
    alignItems: 'center',
    gap: 6,
  },
  tabContentActive: {},
  iconContainer: {
    marginBottom: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
