/**
 * 🔤 TYPOGRAPHIE TIMESWAP
 * Police : Inter
 * Hiérarchie complète pour tous les modes
 */

export const Typography = {
  // Titres
  h1: {
    fontSize: 30,
    fontWeight: '700' as const, // Bold
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const, // Bold
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '500' as const, // Medium
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  
  // Corps de texte
  body: {
    fontSize: 16,
    fontWeight: '400' as const, // Regular
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const, // Medium
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Labels et boutons
  label: {
    fontSize: 14,
    fontWeight: '500' as const, // Medium
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelBold: {
    fontSize: 14,
    fontWeight: '700' as const, // Bold
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Timer spécifique
  timer: {
    fontSize: 14,
    fontWeight: '500' as const, // Medium
    lineHeight: 20,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'] as const, // Chiffres alignés
  },
  timerLarge: {
    fontSize: 18,
    fontWeight: '600' as const, // SemiBold
    lineHeight: 24,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'] as const,
  },
  
  // Textes secondaires
  caption: {
    fontSize: 14,
    fontWeight: '300' as const, // Light
    lineHeight: 20,
    letterSpacing: 0,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const, // Regular
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  
  // Boutons
  button: {
    fontSize: 16,
    fontWeight: '600' as const, // SemiBold
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const, // SemiBold
    lineHeight: 20,
    letterSpacing: 0.2,
  },
};

/**
 * Espacement vertical standardisé (8pt grid)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius standardisés
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

/**
 * Ombres standardisées
 */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
