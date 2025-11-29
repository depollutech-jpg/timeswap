import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, ThemeMode } from '../../src/store/themeStore';
import PageTitle from '../../src/components/PageTitle';

export default function ParametresScreen() {
  const { mode, colors, setTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  const handleThemeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
  };

  const isLightMode = mode === 'light';
  const isNightMode = mode === 'night';
  const isColorblindMode = mode === 'colorblind';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Titre de la page */}
        <PageTitle title="Paramètres" subtitle="Personnalisez votre expérience" />

        {/* Section Apparence */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            👁️ Apparence
          </Text>
          
          {/* Mode Clair */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: isLightMode ? 2 : 1,
              },
            ]}
            onPress={() => handleThemeChange('light')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="sunny" size={24} color="#F59E0B" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Mode Clair
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Thème lumineux pour la journée
                </Text>
              </View>
            </View>
            <Switch
              value={isLightMode}
              onValueChange={() => handleThemeChange('light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isLightMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </TouchableOpacity>

          {/* Mode Nuit */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: isNightMode ? 2 : 1,
              },
            ]}
            onPress={() => handleThemeChange('night')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#1E1E1E' }]}>
                <Ionicons name="moon-outline" size={24} color="#E5E5E5" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Mode Nuit
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Noir pur pour OLED et économie d'énergie
                </Text>
              </View>
            </View>
            <Switch
              value={isNightMode}
              onValueChange={() => handleThemeChange('night')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isNightMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </TouchableOpacity>

          {/* Mode Daltonien */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: isColorblindMode ? 2 : 1,
              },
            ]}
            onPress={() => handleThemeChange('colorblind')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="eye" size={24} color="#0284C7" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Mode Daltonien
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Palette adaptée pour le daltonisme
                </Text>
              </View>
            </View>
            <Switch
              value={isColorblindMode}
              onValueChange={() => handleThemeChange('colorblind')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isColorblindMode ? '#FFFFFF' : '#F3F4F6'}
            />
          </TouchableOpacity>
        </View>

        {/* Info Mode Actuel */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Mode actuel : <Text style={{ fontWeight: 'bold' }}>
              {mode === 'light' && '☀️ Clair'}
              {mode === 'night' && '🌑 Nuit'}
              {mode === 'colorblind' && '👁️ Daltonien'}
            </Text>
          </Text>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔔 Notifications
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="chatbubbles" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Messages privés
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Notifications pour nouveaux messages
                </Text>
              </View>
            </View>
            <Switch
              value={true}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Section Mentions légales */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⚖️ Mentions légales
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => {/* Navigation vers CGU */}}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text" size={24} color={colors.text} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Conditions Générales d'Utilisation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => {/* Navigation vers mentions légales */}}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color={colors.text} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Mentions légales
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => {/* Navigation vers politique */}}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={24} color={colors.text} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Politique de confidentialité
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
