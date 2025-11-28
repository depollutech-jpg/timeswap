import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';

export default function ConfidentialiteScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Politique de Confidentialité</Text>
          <Text style={styles.subtitle}>Protection des Données Personnelles (RGPD)</Text>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.paragraph}>
              La présente Politique de Confidentialité décrit comment SAS CDP (ci-après "nous", "notre") collecte, utilise, stocke et protège vos données personnelles dans le cadre de l'utilisation de l'application "Coup de Pouce" (ci-après "l'Application").
            </Text>
            <Text style={styles.paragraph}>
              Nous nous engageons à protéger votre vie privée et à traiter vos données conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation française applicable.
            </Text>
          </View>

          {/* Article 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Responsable du Traitement</Text>
            <Text style={styles.paragraph}>
              Le responsable du traitement de vos données personnelles est :
            </Text>
            <Text style={styles.value}>Dénomination : SAS CDP</Text>
            <Text style={styles.value}>Siège social : [Adresse à compléter]</Text>
            <Text style={styles.value}>Email : [Email à compléter]</Text>
          </View>

          {/* Article 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Données Collectées</Text>
            <Text style={styles.paragraph}>
              Dans le cadre de l'utilisation de l'Application, nous collectons les données suivantes :
            </Text>
            
            <Text style={styles.subsectionTitle}>2.1. Données de Profil</Text>
            <Text style={styles.listItem}>• Nom et prénom</Text>
            <Text style={styles.listItem}>• Adresse email</Text>
            <Text style={styles.listItem}>• Photo de profil (optionnelle)</Text>
            <Text style={styles.listItem}>• Numéro de téléphone (optionnel)</Text>

            <Text style={styles.subsectionTitle}>2.2. Compétences et Besoins</Text>
            <Text style={styles.listItem}>• Services proposés (descriptions, catégories, durée)</Text>
            <Text style={styles.listItem}>• Services recherchés</Text>
            <Text style={styles.listItem}>• Photos des services (optionnelles)</Text>

            <Text style={styles.subsectionTitle}>2.3. Historique d'Échanges</Text>
            <Text style={styles.listItem}>• Services fournis et reçus</Text>
            <Text style={styles.listItem}>• Dates et durées des échanges</Text>
            <Text style={styles.listItem}>• Portefeuille de temps (solde d'heures)</Text>
            <Text style={styles.listItem}>• Historique des transactions</Text>

            <Text style={styles.subsectionTitle}>2.4. Localisation Approximative</Text>
            <Text style={styles.listItem}>• Ville ou code postal (pour le matching géographique)</Text>
            <Text style={styles.listItem}>• Coordonnées GPS approximatives (si consentement)</Text>

            <Text style={styles.subsectionTitle}>2.5. Données de Réputation et Notation</Text>
            <Text style={styles.listItem}>• Évaluations reçues et données</Text>
            <Text style={styles.listItem}>• Commentaires et notes</Text>
            <Text style={styles.listItem}>• Badges et récompenses</Text>

            <Text style={styles.subsectionTitle}>2.6. Données de Communication</Text>
            <Text style={styles.listItem}>• Messages échangés via le chat intégré</Text>
            <Text style={styles.listItem}>• Notifications et alertes</Text>

            <Text style={styles.subsectionTitle}>2.7. Données de Paiement</Text>
            <Text style={styles.listItem}>• Informations de paiement (traitées par Stripe)</Text>
            <Text style={styles.listItem}>• Historique des achats d'heures</Text>
          </View>

          {/* Article 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Finalités et Bases Légales du Traitement</Text>
            <Text style={styles.paragraph}>
              Vos données personnelles sont collectées et traitées pour les finalités suivantes :
            </Text>

            <Text style={styles.subsectionTitle}>3.1. Exécution du Contrat (CGU)</Text>
            <Text style={styles.listItem}>• Création et gestion de votre compte</Text>
            <Text style={styles.listItem}>• Mise en relation avec d'autres utilisateurs</Text>
            <Text style={styles.listItem}>• Gestion du portefeuille de temps</Text>
            <Text style={styles.listItem}>• Facilitation des échanges de services</Text>
            <Text style={styles.listItem}>• Système de notation et réputation</Text>

            <Text style={styles.subsectionTitle}>3.2. Consentement</Text>
            <Text style={styles.listItem}>• Géolocalisation pour le matching géographique</Text>
            <Text style={styles.listItem}>• Envoi de notifications push</Text>
            <Text style={styles.listItem}>• Communications marketing (newsletters)</Text>

            <Text style={styles.subsectionTitle}>3.3. Intérêt Légitime</Text>
            <Text style={styles.listItem}>• Amélioration de l'Application</Text>
            <Text style={styles.listItem}>• Analyse de l'utilisation et statistiques</Text>
            <Text style={styles.listItem}>• Prévention de la fraude et des abus</Text>

            <Text style={styles.subsectionTitle}>3.4. Obligation Légale</Text>
            <Text style={styles.listItem}>• Conservation des données de facturation</Text>
            <Text style={styles.listItem}>• Réponse aux demandes des autorités compétentes</Text>
          </View>

          {/* Article 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Destinataires des Données</Text>
            <Text style={styles.paragraph}>
              Vos données personnelles peuvent être communiquées aux destinataires suivants :
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Autres utilisateurs :</Text> Profil public, évaluations, services proposés</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Prestataires techniques :</Text> Hébergement (Emergent), paiement (Stripe)</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Autorités légales :</Text> En cas de réquisition judiciaire</Text>
            <Text style={styles.paragraph}>
              Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales.
            </Text>
          </View>

          {/* Article 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Durée de Conservation</Text>
            <Text style={styles.paragraph}>
              Vos données personnelles sont conservées pour les durées suivantes :
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Compte actif :</Text> Tant que votre compte est actif</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Après suppression :</Text> 30 jours (durée légale de rétractation)</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Données de facturation :</Text> 10 ans (obligation légale)</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Historique d'échanges :</Text> 3 ans après la dernière activité</Text>
          </View>

          {/* Article 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Sécurité des Données</Text>
            <Text style={styles.paragraph}>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération :
            </Text>
            <Text style={styles.listItem}>• Chiffrement des données en transit (HTTPS/TLS)</Text>
            <Text style={styles.listItem}>• Chiffrement des mots de passe (hashing sécurisé)</Text>
            <Text style={styles.listItem}>• Authentification JWT avec tokens sécurisés</Text>
            <Text style={styles.listItem}>• Infrastructure cloud managée et sécurisée (Emergent)</Text>
            <Text style={styles.listItem}>• Accès restreint aux données par les employés autorisés</Text>
          </View>

          {/* Article 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Vos Droits (RGPD)</Text>
            <Text style={styles.paragraph}>
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </Text>

            <Text style={styles.subsectionTitle}>7.1. Droit d'Accès</Text>
            <Text style={styles.paragraph}>
              Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.
            </Text>

            <Text style={styles.subsectionTitle}>7.2. Droit de Rectification</Text>
            <Text style={styles.paragraph}>
              Vous pouvez corriger ou mettre à jour vos données personnelles à tout moment depuis votre profil.
            </Text>

            <Text style={styles.subsectionTitle}>7.3. Droit à l'Effacement ("Droit à l'oubli")</Text>
            <Text style={styles.paragraph}>
              Vous pouvez demander la suppression de vos données personnelles, sous réserve de nos obligations légales.
            </Text>

            <Text style={styles.subsectionTitle}>7.4. Droit à la Portabilité</Text>
            <Text style={styles.paragraph}>
              Vous pouvez recevoir vos données dans un format structuré et couramment utilisé.
            </Text>

            <Text style={styles.subsectionTitle}>7.5. Droit d'Opposition</Text>
            <Text style={styles.paragraph}>
              Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct.
            </Text>

            <Text style={styles.subsectionTitle}>7.6. Droit de Limitation</Text>
            <Text style={styles.paragraph}>
              Vous pouvez demander la limitation du traitement de vos données dans certaines circonstances.
            </Text>

            <Text style={styles.subsectionTitle}>7.7. Droit de Déposer une Plainte</Text>
            <Text style={styles.paragraph}>
              Vous pouvez déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            </Text>
            <Text style={styles.value}>Site web : www.cnil.fr</Text>
            <Text style={styles.value}>Adresse : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</Text>
          </View>

          {/* Article 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Exercice de Vos Droits</Text>
            <Text style={styles.paragraph}>
              Pour exercer l'un de vos droits, vous pouvez :
            </Text>
            <Text style={styles.listItem}>• Modifier vos informations directement depuis votre profil</Text>
            <Text style={styles.listItem}>• Nous contacter par email à : [Email à compléter]</Text>
            <Text style={styles.paragraph}>
              Nous nous engageons à répondre à toute demande dans un délai maximum de 30 jours.
            </Text>
          </View>

          {/* Article 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Cookies et Technologies Similaires</Text>
            <Text style={styles.paragraph}>
              L'Application utilise des technologies locales (AsyncStorage, tokens JWT) pour assurer son bon fonctionnement et améliorer l'expérience utilisateur.
            </Text>
            <Text style={styles.paragraph}>
              Ces données sont stockées localement sur votre appareil et ne sont pas partagées avec des tiers à des fins publicitaires.
            </Text>
          </View>

          {/* Article 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Modifications de la Politique</Text>
            <Text style={styles.paragraph}>
              Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. Toute modification substantielle fera l'objet d'une notification dans l'Application.
            </Text>
            <Text style={styles.paragraph}>
              Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques en matière de protection des données.
            </Text>
          </View>

          {/* Article 11 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contact</Text>
            <Text style={styles.paragraph}>
              Pour toute question concernant cette Politique de Confidentialité ou le traitement de vos données personnelles, vous pouvez nous contacter à :
            </Text>
            <Text style={styles.value}>Email : [Email à compléter]</Text>
            <Text style={styles.value}>Adresse : [Adresse à compléter]</Text>
          </View>

          <Text style={styles.footer}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</Text>
          <Text style={styles.footer}>Version 1.0</Text>
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
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: '600',
    color: Colors.text,
  },
  value: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});