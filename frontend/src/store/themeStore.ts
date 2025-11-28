import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'night' | 'colorblind';

// Palette TimeNeutral
export const TimeNeutralColors = {
  dark: '#1C1D21',
  grey: '#6E727A',
  lightGrey: '#E7E8EB',
  white: '#FFFFFF',
};

// Couleur d'accent
export const TimeAccentBlue = '#3A7AFE';
export const TimeAccentBlueNight = '#2F6AF0';

// Couleurs système
export const SystemColors = {
  successGreen: '#2ECC71',
  successGreenCB: '#4DAF4A', // Colorblind safe
  warningOrange: '#F39C12',
  warningOrangeCB: '#DDAA00', // Colorblind safe
  dangerRed: '#E74C3C',
  dangerRedCB: '#BB1F2F', // Colorblind safe
};

// Dégradés officiels
export const TimeGradients = {
  primary: ['#3A7AFE', '#6E93FF'], // TimeGradient principal
  primaryDark: ['#2F6AF0', '#5A7FE6'], // Version sombre (-20% luminosité)
  danger: ['#E74C3C', '#F88A7D'], // Expiration <2h
  neutral: ['#FFFFFF', '#F4F5F7'], // Background neutre
  neutralDark: ['#1C1D21', '#2A2C30'], // Background sombre
};

interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  cardBackground: string;
  inputBackground: string;
  
  // Textes
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accents
  primary: string;
  secondary: string;
  
  // Bordures
  border: string;
  borderLight: string;
  
  // Système
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Navigation
  tabBarBackground: string;
  tabBarBorder: string;
  tabIconInactive: string;
  
  // Dégradés (arrays de couleurs)
  gradientPrimary: string[];
  gradientDanger: string[];
  gradientNeutral: string[];
}

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

// Définition des palettes de couleurs pour chaque mode
const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#FF6B9D',
    secondary: '#A855F7',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    cardBackground: '#FFFFFF',
    inputBackground: '#F3F4F6',
    tabBarBackground: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: '#E5E7EB',
    tabIconInactive: '#9CA3AF', // Gris moyen bien visible sur fond clair
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    primary: '#FF6B9D',
    secondary: '#A855F7',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    cardBackground: '#1F2937',
    inputBackground: '#374151',
    tabBarBackground: 'rgba(31, 41, 55, 0.95)',
    tabBarBorder: '#374151',
    tabIconInactive: '#E5E7EB', // Gris très clair pour contraster avec le fond sombre
  },
  night: {
    background: '#000000',
    surface: '#1A1A1A',
    primary: '#FF4D7D',
    secondary: '#9333EA',
    text: '#E5E5E5',
    textSecondary: '#A3A3A3',
    border: '#2A2A2A',
    error: '#DC2626',
    success: '#059669',
    warning: '#D97706',
    info: '#2563EB',
    cardBackground: '#1A1A1A',
    inputBackground: '#2A2A2A',
    tabBarBackground: 'rgba(26, 26, 26, 0.98)',
    tabBarBorder: '#2A2A2A',
    tabIconInactive: '#F5F5F5', // Blanc cassé pour contraster avec le noir
  },
  colorblind: {
    // Palette adaptée pour le daltonisme (deutéranopie/protanopie)
    // Utilise du bleu et du jaune au lieu du rouge et du vert
    background: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#0284C7', // Bleu au lieu du rose
    secondary: '#7C3AED', // Violet maintenu
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626', // Rouge maintenu (visible pour la plupart)
    success: '#0891B2', // Cyan au lieu du vert
    warning: '#F59E0B', // Jaune/orange (bien visible)
    info: '#1D4ED8', // Bleu foncé
    cardBackground: '#FFFFFF',
    inputBackground: '#F3F4F6',
    tabBarBackground: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: '#E5E7EB',
    tabIconInactive: '#9CA3AF', // Gris moyen bien visible sur fond clair
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  colors: themes.light,
  
  setTheme: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme_mode', mode);
      set({ mode, colors: themes[mode] });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  },
  
  loadTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem('theme_mode');
      if (savedMode && (savedMode as ThemeMode)) {
        const mode = savedMode as ThemeMode;
        set({ mode, colors: themes[mode] });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  },
}));
