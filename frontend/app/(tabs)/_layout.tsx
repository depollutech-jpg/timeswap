import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { TouchableOpacity, View, StyleSheet, Modal, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FloatingAddButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonInner}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

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
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            height: 60 + insets.bottom,
            backgroundColor: '#FFFFFF',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="solde"
          options={{
            title: 'Solde',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Récompenses',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
          }}
        />
        {/* Espace vide pour le bouton flottant */}
        <Tabs.Screen
          name="placeholder"
          options={{
            title: '',
            tabBarButton: () => <View style={{ width: 50 }} />,
          }}
          listeners={{
            tabPress: (e) => e.preventDefault(),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        {/* Pages cachées */}
        <Tabs.Screen
          name="search"
          options={{
            href: null,
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
    bottom: 20,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
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
