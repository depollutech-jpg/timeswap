import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'night' | 'colorblind';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  cardBackground: string;
  inputBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabIconInactive: string; // Couleur pour les icônes inactives dans la TabBar
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
