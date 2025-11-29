import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function PageTitle({ title, subtitle, icon }: PageTitleProps) {
  const { colors } = useThemeStore();
  
  return (
    <View style={styles.wrapper}>
      {/* Bande décorative avec dégradé turquoise */}
      <LinearGradient
        colors={['#5DBFBF', '#3EADAD', '#2B9F9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.decorativeBand}
      />
      
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 80, // Espace pour le header fixe
  },
  decorativeBand: {
    height: 4,
    width: '100%',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
    lineHeight: 20,
  },
});
