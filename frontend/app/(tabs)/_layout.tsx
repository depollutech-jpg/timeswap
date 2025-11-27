import React, { useState, useEffect, useRef } from 'react';
import { Tabs, useRouter, useSegments, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { TouchableOpacity, View, StyleSheet, Modal, Text, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../../src/components/CustomTabBar';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedGestureHandler,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 64;

function FloatingAddButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Position initiale au centre en bas
  const translateX = useSharedValue(SCREEN_WIDTH / 2 - BUTTON_SIZE / 2);
  const translateY = useSharedValue(SCREEN_HEIGHT - 150 - insets.bottom);
  
  // Charger la position sauvegardée
  useEffect(() => {
    loadSavedPosition();
  }, []);

  const loadSavedPosition = async () => {
    try {
      const savedPosition = await AsyncStorage.getItem('floatingButtonPosition');
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        translateX.value = x;
        translateY.value = y;
      }
    } catch (error) {
      console.log('Error loading button position:', error);
    }
  };

  const savePosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem('floatingButtonPosition', JSON.stringify({ x, y }));
    } catch (error) {
      console.log('Error saving button position:', error);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      // Contraindre le bouton dans les limites de l'écran
      translateX.value = withSpring(
        Math.max(10, Math.min(SCREEN_WIDTH - BUTTON_SIZE - 10, translateX.value))
      );
      translateY.value = withSpring(
        Math.max(10, Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 100, translateY.value))
      );
      
      // Sauvegarder la position
      runOnJS(savePosition)(translateX.value, translateY.value);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.floatingButton, animatedStyle]}>
          <TouchableOpacity
            style={styles.floatingButtonTouchable}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.floatingButtonInner}>
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle action</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowModal(false);
                router.push('/create-service?type=offer');
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="gift" size={24} color={Colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Proposer un service</Text>
                <Text style={styles.optionDescription}>Offrez votre aide à la communauté</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowModal(false);
                router.push('/create-service?type=request');
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="hand-right" size={24} color={Colors.secondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Demander de l'aide</Text>
                <Text style={styles.optionDescription}>Trouvez quelqu'un pour vous aider</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { borderBottomWidth: 0 }]}
              onPress={() => setShowModal(false)}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.textSecondary + '20' }]}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Annuler</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="solde"
          options={{
            title: 'Solde',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Récompenses',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rappel"
          options={{
            title: 'Rappel',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendrier"
          options={{
            title: 'Calendrier',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
      <FloatingAddButton />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 999,
  },
  floatingButtonTouchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
