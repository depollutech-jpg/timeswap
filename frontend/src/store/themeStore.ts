import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'night' | 'colorblind';

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

// Définition des palettes TimeNeutral pour chaque mode
const themes: Record<ThemeMode, ThemeColors> = {
  // 🌞 MODE CLAIR (Light Mode)
  light: {
    // Backgrounds
    background: 'rgba(62, 173, 173, 0.07)', // Turquoise du header à 7% d'opacité
    surface: TimeNeutralColors.lightGrey, // #E7E8EB (gris très pâle)
    cardBackground: TimeNeutralColors.lightGrey, // #E7E8EB
    inputBackground: '#F4F5F7', // Gris ultra pâle
    
    // Textes
    text: TimeNeutralColors.dark, // #1C1D21 (noir neutre)
    textSecondary: TimeNeutralColors.grey, // #6E727A
    textTertiary: '#9CA3AF',
    
    // Accents
    primary: TimeAccentBlue, // #3A7AFE
    secondary: '#6E93FF', // Bleu plus clair
    
    // Bordures
    border: TimeNeutralColors.lightGrey, // #E7E8EB
    borderLight: '#F4F5F7',
    
    // Système
    success: SystemColors.successGreen, // #2ECC71
    warning: SystemColors.warningOrange, // #F39C12
    danger: SystemColors.dangerRed, // #E74C3C
    info: TimeAccentBlue,
    
    // Navigation
    tabBarBackground: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: TimeNeutralColors.lightGrey,
    tabIconInactive: TimeNeutralColors.grey, // #6E727A
    
    // Dégradés
    gradientPrimary: TimeGradients.primary, // ['#3A7AFE', '#6E93FF']
    gradientDanger: TimeGradients.danger, // ['#E74C3C', '#F88A7D']
    gradientNeutral: TimeGradients.neutral, // ['#FFFFFF', '#F4F5F7']
  },
  
  // 🌑 MODE NUIT (Night Mode) - Ultra sombre
  night: {
    // Backgrounds
    background: 'rgba(62, 173, 173, 0.07)', // Turquoise du header à 7% d'opacité (sur fond sombre)
    surface: '#141518', // Surfaces
    cardBackground: '#181A1E', // Cartes
    inputBackground: '#1F2125',
    
    // Textes
    text: '#D6D7DA', // Gris clair adouci
    textSecondary: '#9CA3AF',
    textTertiary: '#6E727A',
    
    // Accents
    primary: TimeAccentBlueNight, // #2F6AF0 (légèrement adouci)
    secondary: '#5A7FE6',
    
    // Bordures
    border: '#1F2125',
    borderLight: '#2A2C30',
    
    // Système
    success: '#27A85F', // Vert adouci
    warning: '#D98A10', // Orange adouci
    danger: '#D14437', // Rouge adouci
    info: TimeAccentBlueNight,
    
    // Navigation
    tabBarBackground: 'rgba(40, 40, 40, 0.98)', // Plus clair pour meilleur contraste
    tabBarBorder: '#3A3A3A', // Bordure plus claire et visible
    tabIconInactive: '#FFFFFF', // Blanc pur pour contraste maximum en mode nuit
    
    // Dégradés
    gradientPrimary: ['#2F6AF0', '#4A6FD9'], // Plus sombre
    gradientDanger: ['#D14437', '#E06C5F'], // Adouci
    gradientNeutral: ['#141518', '#1F2125'],
  },
  
  // 👁 MODE DALTONIEN (Colorblind Safe)
  colorblind: {
    // Backgrounds (identiques au mode clair)
    background: TimeNeutralColors.white,
    surface: TimeNeutralColors.lightGrey,
    cardBackground: TimeNeutralColors.lightGrey,
    inputBackground: '#F4F5F7',
    
    // Textes (contraste augmenté +20%)
    text: '#0A0B0D', // Noir plus foncé
    textSecondary: '#5A5E66', // Gris plus foncé
    textTertiary: '#848892',
    
    // Accents
    primary: TimeAccentBlue, // #3A7AFE (garder)
    secondary: '#6E93FF',
    
    // Bordures
    border: TimeNeutralColors.lightGrey,
    borderLight: '#F4F5F7',
    
    // Système (colorblind safe)
    success: SystemColors.successGreenCB, // #4DAF4A
    warning: SystemColors.warningOrangeCB, // #DDAA00 (jaune safe)
    danger: SystemColors.dangerRedCB, // #BB1F2F
    info: TimeAccentBlue,
    
    // Navigation
    tabBarBackground: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: TimeNeutralColors.lightGrey,
    tabIconInactive: '#5A5E66', // Plus foncé pour contraste
    
    // Dégradés
    gradientPrimary: TimeGradients.primary,
    gradientDanger: ['#BB1F2F', '#D84855'], // Rouge CB safe
    gradientNeutral: TimeGradients.neutral,
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
