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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Paramètres</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personnalisez votre expérience
          </Text>
        </View>

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
              {mode === 'dark' && '🌙 Sombre'}
              {mode === 'night' && '🌑 Nuit'}
              {mode === 'colorblind' && '👁️ Daltonien'}
            </Text>
          </Text>
        </View>

        {/* Aperçu des couleurs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎨 Aperçu des couleurs
          </Text>
          
          <View style={[styles.colorPreview, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.colorRow}>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Primaire</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Secondaire</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.success }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Succès</Text>
              </View>
            </View>
            <View style={styles.colorRow}>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.warning }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Attention</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.error }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Erreur</Text>
              </View>
              <View style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: colors.info }]} />
                <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Info</Text>
              </View>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
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
  colorPreview: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  colorItem: {
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
