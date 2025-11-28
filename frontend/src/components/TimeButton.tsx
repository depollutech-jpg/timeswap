import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Typography, BorderRadius, Shadows } from '../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface TimeButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function TimeButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: TimeButtonProps) {
  const { colors } = useThemeStore();

  const getButtonStyles = () => {
    const base = {
      borderRadius: BorderRadius.md,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      ...Shadows.md,
    };

    // Tailles
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
      medium: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 48 },
      large: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },
    };

    return { ...base, ...sizeStyles[size], width: fullWidth ? '100%' : 'auto' };
  };

  const getTextStyles = () => {
    const textSize = {
      small: Typography.buttonSmall,
      medium: Typography.button,
      large: Typography.button,
    };

    return textSize[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return iconSizes[size];
  };

  const renderContent = () => {
    const textColor =
      variant === 'primary' || variant === 'danger'
        ? '#FFFFFF'
        : variant === 'secondary'
        ? colors.text
        : colors.primary;

    const iconSize = getIconSize();

    return (
      <>
        {loading && <ActivityIndicator color={textColor} size="small" />}
        {!loading && icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={iconSize} color={textColor} />
        )}
        {!loading && <Text style={[getTextStyles(), { color: textColor }]}>{title}</Text>}
        {!loading && icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={iconSize} color={textColor} />
        )}
      </>
    );
  };

  // Bouton Primary avec dégradé
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyles(), disabled && styles.disabled]}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Bouton Danger avec dégradé
  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyles(), disabled && styles.disabled]}
      >
        <LinearGradient
          colors={colors.gradientDanger}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Bouton Secondary (fond neutre)
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          getButtonStyles(),
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          },
          disabled && styles.disabled,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Bouton Ghost (transparent)
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        getButtonStyles(),
        { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
        disabled && styles.disabled,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.5,
  },
});
