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

  // Animation de défilement automatique
  useEffect(() => {
    if (contentWidth <= SCREEN_WIDTH) return;

    const scrollSpeed = 0.3; // Vitesse très lente (pixels par frame)
    
    const startAutoScroll = () => {
      animationRef.current = setInterval(() => {
        scrollX.current += scrollSpeed;
        
        // Boucle infinie : retour au début quand on atteint la moitié
        if (scrollX.current >= contentWidth / 2) {
          scrollX.current = 0;
        }
        
        scrollViewRef.current?.scrollTo({
          x: scrollX.current,
          animated: false,
        });
      }, 16); // ~60fps
    };

    startAutoScroll();

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [contentWidth]);

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
        onScrollBeginDrag={() => {
          // Pause auto-scroll quand l'utilisateur swipe
          if (animationRef.current) {
            clearInterval(animationRef.current);
          }
        }}
        onScrollEndDrag={() => {
          // Reprendre l'auto-scroll après 2 secondes
          setTimeout(() => {
            if (contentWidth > SCREEN_WIDTH) {
              const scrollSpeed = 0.3;
              animationRef.current = setInterval(() => {
                scrollX.current += scrollSpeed;
                if (scrollX.current >= contentWidth / 2) {
                  scrollX.current = 0;
                }
                scrollViewRef.current?.scrollTo({
                  x: scrollX.current,
                  animated: false,
                });
              }, 16);
            }
          }, 2000);
        }}
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
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          // Ignorer les routes cachées
          if (options.href === null) {
            return null;
          }

          const onPress = () => {
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

          // Récupérer l'icône depuis les options
          const IconComponent = options.tabBarIcon;

          // Afficher le badge uniquement sur l'onglet Messages
          const showBadge = route.name === 'messages' && unreadCount > 0;

          return (
            <TouchableOpacity
              key={route.key}
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
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: '#FFF1F2',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabContentActive: {},
  iconContainer: {
    marginBottom: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
