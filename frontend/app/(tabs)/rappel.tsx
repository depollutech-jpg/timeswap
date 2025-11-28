import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function RappelScreen() {
  const { colors } = useThemeStore();
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifAnnonces, setNotifAnnonces] = useState(true);
  const [notifEchanges, setNotifEchanges] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Rappels & Notifications</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Gérez vos notifications pour rester informé des messages, nouvelles annonces et échanges.
          </Text>
        </View>

        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres de notifications</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Messages privés</Text>
                <Text style={styles.settingDescription}>
                  Recevoir une notification pour les nouveaux messages
                </Text>
              </View>
            </View>
            <Switch
              value={notifMessages}
              onValueChange={setNotifMessages}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={notifMessages ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="megaphone" size={24} color={Colors.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Nouvelles annonces</Text>
                <Text style={styles.settingDescription}>
                  Notifications basées sur vos centres d'intérêt
                </Text>
              </View>
            </View>
            <Switch
              value={notifAnnonces}
              onValueChange={setNotifAnnonces}
              trackColor={{ false: Colors.border, true: Colors.secondary + '80' }}
              thumbColor={notifAnnonces ? Colors.secondary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Ionicons name="swap-horizontal" size={24} color={Colors.success} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Échanges</Text>
                <Text style={styles.settingDescription}>
                  Notifications sur l'état de vos échanges
                </Text>
              </View>
            </View>
            <Switch
              value={notifEchanges}
              onValueChange={setNotifEchanges}
              trackColor={{ false: Colors.border, true: Colors.success + '80' }}
              thumbColor={notifEchanges ? Colors.success : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications récentes</Text>

          <View style={styles.notificationCard}>
            <View style={[styles.notifIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="chatbubble" size={20} color={Colors.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>Nouveau message de Marie</Text>
              <Text style={styles.notifTime}>Il y a 5 minutes</Text>
            </View>
          </View>

          <View style={styles.notificationCard}>
            <View style={[styles.notifIcon, { backgroundColor: Colors.secondary + '20' }]}>
              <Ionicons name="megaphone" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>Nouvelle annonce : Cours de cuisine</Text>
              <Text style={styles.notifTime}>Il y a 1 heure</Text>
            </View>
          </View>

          <View style={styles.notificationCard}>
            <View style={[styles.notifIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>Échange complété avec Jean</Text>
              <Text style={styles.notifTime}>Il y a 2 heures</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '20',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.info,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
