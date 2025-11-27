import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNotificationStore } from '../store/notificationStore';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const [contentWidth, setContentWidth] = useState(0);
  const animationRef = useRef<any>(null);

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const inactivityTimerRef = useRef<any>(null);
  const lastScrollTimeRef = useRef<number>(Date.now());

  // Animation de défilement automatique
  useEffect(() => {
    if (contentWidth <= SCREEN_WIDTH) return;

    const scrollSpeed = 0.3; // Vitesse très lente (pixels par frame)
    
    const startAutoScroll = () => {
      // Ne démarre que si l'utilisateur n'est pas en train de scroller
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }

      animationRef.current = setInterval(() => {
        // Ne scroll que si l'utilisateur n'interagit pas
        if (!isUserScrolling) {
          scrollX.current += scrollSpeed;
          
          // Boucle infinie : retour au début quand on atteint la moitié
          if (scrollX.current >= contentWidth / 2) {
            scrollX.current = 0;
          }
          
          scrollViewRef.current?.scrollTo({
            x: scrollX.current,
            animated: false,
          });
        }
      }, 16); // ~60fps
    };

    // Démarrer l'auto-scroll si l'utilisateur n'est pas actif
    if (!isUserScrolling) {
      startAutoScroll();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [contentWidth, isUserScrolling]);

  // Gestion du scroll manuel avec reprise automatique
  const handleScrollBeginDrag = () => {
    // L'utilisateur commence à scroller
    setIsUserScrolling(true);
    
    // Annuler le timer d'inactivité précédent
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Arrêter l'auto-scroll
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleScrollEndDrag = () => {
    // L'utilisateur a lâché le scroll
    lastScrollTimeRef.current = Date.now();
    
    // Attendre 3.5 secondes d'inactivité avant de reprendre l'auto-scroll
    inactivityTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3500);
  };

  const handleMomentumScrollEnd = (event: any) => {
    // Fin de l'inertie naturelle
    const currentScrollX = event.nativeEvent.contentOffset.x;
    scrollX.current = currentScrollX;
    
    // Attendre encore 3.5 secondes après la fin de l'inertie
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3500);
  };

  const handleScroll = (event: any) => {
    // Mise à jour de la position actuelle pendant le scroll manuel
    if (isUserScrolling) {
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
function TabItem({ route, label, isFocused, options, navigation, unreadCount }: any) {
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
                color: isFocused ? Colors.primary : Colors.textSecondary,
                size: 22,
                focused: isFocused,
              })}
              {showBadge && (
                <View style={styles.badge}>
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
              isFocused && styles.tabLabelActive,
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
