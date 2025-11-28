import React, { useState, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { TouchableOpacity, View, StyleSheet, Modal, Text, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import CustomTabBar from '../../src/components/CustomTabBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 64;

function FloatingAddButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  
  // Position initiale au centre en bas
  const initialX = SCREEN_WIDTH / 2 - BUTTON_SIZE / 2;
  const initialY = SCREEN_HEIGHT - 130;
  
  const translateX = useRef(new Animated.Value(initialX)).current;
  const translateY = useRef(new Animated.Value(initialY)).current;
  
  const lastOffset = useRef({ x: initialX, y: initialY });
  const dragOffset = useRef({ x: 0, y: 0 });

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        // Mettre à jour la position en temps réel pendant le drag
        const newX = lastOffset.current.x + event.nativeEvent.translationX;
        const newY = lastOffset.current.y + event.nativeEvent.translationY;
        
        // Appliquer les contraintes
        const constrainedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE));
        const constrainedY = Math.max(50, Math.min(newY, SCREEN_HEIGHT - BUTTON_SIZE - 50));
        
        translateX.setValue(constrainedX);
        translateY.setValue(constrainedY);
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) {
      // Gesture ended (state 5 = END)
      let finalX = lastOffset.current.x + event.nativeEvent.translationX;
      let finalY = lastOffset.current.y + event.nativeEvent.translationY;

      // Contraintes pour rester dans l'écran
      finalX = Math.max(0, Math.min(finalX, SCREEN_WIDTH - BUTTON_SIZE));
      finalY = Math.max(50, Math.min(finalY, SCREEN_HEIGHT - BUTTON_SIZE - 50));

      lastOffset.current = { x: finalX, y: finalY };
      
      // Mettre les valeurs finales
      translateX.setValue(finalX);
      translateY.setValue(finalY);
    } else if (event.nativeEvent.state === 2) {
      // Gesture started (state 2 = BEGAN)
      dragOffset.current = { x: 0, y: 0 };
    }
  };

  return (
    <>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [{ translateX }, { translateY }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
            style={styles.floatingButtonTouchable}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          name="parametres"
          options={{
            title: 'Paramètres',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="legal"
          options={{
            title: 'Mentions',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={22} color={color} />
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 999,
  },
  floatingButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
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
