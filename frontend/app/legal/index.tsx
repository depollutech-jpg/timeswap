import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { router } from 'expo-router';

export default function LegalIndexScreen() {
  const legalDocs = [
    {
      id: 'mentions',
      title: 'Mentions Légales',
      description: 'Informations légales sur l\'éditeur et l\'hébergeur de l\'application',
      icon: 'document-text',
      route: '/legal/mentions-legales',
    },
    {
      id: 'cgu',
      title: 'Conditions Générales d\'Utilisation (CGU)',
      description: 'Règles d\'utilisation de la plateforme Coup de Pouce',
      icon: 'clipboard',
      route: '/legal/cgu',
    },
    {
      id: 'confidentialite',
      title: 'Politique de Confidentialité',
      description: 'Protection de vos données personnelles (RGPD)',
      icon: 'shield-checkmark',
      route: '/legal/confidentialite',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.mainTitle}>Mentions Légales</Text>
            <Text style={styles.subtitle}>
              Informations légales et protection des données
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {legalDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.card}
                onPress={() => router.push(doc.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={doc.icon as any} size={32} color={Colors.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{doc.title}</Text>
                  <Text style={styles.cardDescription}>{doc.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>
              Ces documents sont obligatoires et régissent l'utilisation de l'application Coup de Pouce. Nous vous recommandons de les lire attentivement.
            </Text>
          </View>

          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
            <Text style={styles.contactText}>
              Pour toute question concernant ces documents légaux, contactez-nous à :
            </Text>
            <Text style={styles.contactEmail}>[Email à compléter]</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
  contactBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  contactEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});