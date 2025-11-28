import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';

export default function MentionsLegalesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Mentions Légales</Text>
          <Text style={styles.subtitle}>Conformément à la Loi pour la Confiance dans l'Économie Numérique (LCEN)</Text>

          {/* Éditeur */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Éditeur de l'Application</Text>
            
            <Text style={styles.label}>Dénomination Sociale :</Text>
            <Text style={styles.value}>SAS CDP</Text>

            <Text style={styles.label}>Forme Juridique :</Text>
            <Text style={styles.value}>Société par Actions Simplifiée (SAS)</Text>

            <Text style={styles.label}>Siège Social :</Text>
            <Text style={styles.value}>[Adresse à compléter]</Text>

            <Text style={styles.label}>Numéro d'immatriculation :</Text>
            <Text style={styles.value}>RCS/SIRET : [Numéro à compléter]</Text>

            <Text style={styles.label}>Email de contact :</Text>
            <Text style={styles.value}>[Email à compléter]</Text>

            <Text style={styles.label}>Directeur de la Publication :</Text>
            <Text style={styles.value}>[Nom à compléter]</Text>
          </View>

          {/* Hébergeur */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Hébergeur de l'Application</Text>
            
            <Text style={styles.label}>Hébergeur :</Text>
            <Text style={styles.value}>Emergent - Infrastructure Cloud Managée</Text>

            <Text style={styles.label}>Type d'hébergement :</Text>
            <Text style={styles.value}>Infrastructure cloud sécurisée avec gestion automatique des services backend (FastAPI), frontend (React Native Expo) et base de données (MongoDB).</Text>
          </View>

          {/* Propriété intellectuelle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Propriété Intellectuelle</Text>
            <Text style={styles.paragraph}>
              L'ensemble des éléments constituant l'application "Coup de Pouce" (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, noms, logos, marques, créations et données) sont la propriété exclusive de SAS CDP ou font l'objet d'une autorisation d'utilisation.
            </Text>
            <Text style={styles.paragraph}>
              Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle de l'application ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans l'autorisation écrite préalable de SAS CDP.
            </Text>
          </View>

          {/* Responsabilité */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Limitation de Responsabilité</Text>
            <Text style={styles.paragraph}>
              L'application "Coup de Pouce" agit en tant qu'intermédiaire technique facilitant la mise en relation entre utilisateurs pour l'échange de services non monétaires.
            </Text>
            <Text style={styles.paragraph}>
              SAS CDP ne peut être tenue responsable de l'exécution, de la qualité ou des conséquences des services échangés entre utilisateurs. La responsabilité de l'éditeur ne saurait être engagée en cas de défaillance, panne, difficulté ou interruption de fonctionnement, empêchant l'accès à l'application.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Contact</Text>
            <Text style={styles.paragraph}>
              Pour toute question relative aux mentions légales ou à l'application, vous pouvez nous contacter à l'adresse email : [Email à compléter]
            </Text>
          </View>

          <Text style={styles.footer}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</Text>
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
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
