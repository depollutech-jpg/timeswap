import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Colors } from '../../src/constants/colors';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import PageTitle from '../../src/components/PageTitle';

export default function RappelScreen() {
  const { colors } = useThemeStore();
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifAnnonces, setNotifAnnonces] = useState(true);
  const [notifEchanges, setNotifEchanges] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Titre de la page */}
        <PageTitle 
          title="Rappels & Notifications"
          icon={<Ionicons name="notifications" size={28} color={colors.primary} />}
        />

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.info + '20', borderColor: colors.info + '30' }]}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            Gérez vos notifications pour rester informé des messages, nouvelles annonces et échanges.
          </Text>
        </View>

        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres de notifications</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubbles" size={24} color="#3EADAD" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Messages privés</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recevoir une notification pour les nouveaux messages
                </Text>
              </View>
            </View>
            <Switch
              value={notifMessages}
              onValueChange={setNotifMessages}
              trackColor={{ false: colors.border, true: '#3EADAD' + '80' }}
              thumbColor={notifMessages ? '#3EADAD' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="megaphone" size={24} color="#4CAF9D" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Nouvelles annonces</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Notifications basées sur vos centres d'intérêt
                </Text>
              </View>
            </View>
            <Switch
              value={notifAnnonces}
              onValueChange={setNotifAnnonces}
              trackColor={{ false: colors.border, true: '#4CAF9D' + '80' }}
              thumbColor={notifAnnonces ? '#4CAF9D' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="swap-horizontal" size={24} color="#D4A574" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Échanges</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Notifications sur l'état de vos échanges
                </Text>
              </View>
            </View>
            <Switch
              value={notifEchanges}
              onValueChange={setNotifEchanges}
              trackColor={{ false: colors.border, true: '#D4A574' + '80' }}
              thumbColor={notifEchanges ? '#D4A574' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications récentes</Text>

          <View style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.notifIcon}>
              <Ionicons name="chatbubble" size={20} color="#3EADAD" />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>Nouveau message de Marie</Text>
              <Text style={[styles.notifTime, { color: colors.textSecondary }]}>Il y a 5 minutes</Text>
            </View>
          </View>

          <View style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.notifIcon}>
              <Ionicons name="megaphone" size={20} color="#4CAF9D" />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>Nouvelle annonce : Cours de cuisine</Text>
              <Text style={[styles.notifTime, { color: colors.textSecondary }]}>Il y a 1 heure</Text>
            </View>
          </View>

          <View style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.notifIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#D4A574" />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>Échange complété avec Jean</Text>
              <Text style={[styles.notifTime, { color: colors.textSecondary }]}>Il y a 2 heures</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 173, 173, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
  },
});
