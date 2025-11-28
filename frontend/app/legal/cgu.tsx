import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';

export default function CGUScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Conditions Générales d'Utilisation</Text>
          <Text style={styles.subtitle}>Application Coup de Pouce</Text>

          {/* Article 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 1 - Objet et Principe</Text>
            <Text style={styles.paragraph}>
              L'application "Coup de Pouce" (ci-après "l'Application") est une plateforme d'intermédiation permettant aux utilisateurs (ci-après "les Utilisateurs") d'échanger des services non monétaires basés sur le temps.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Principe fondamental :</Text> 1 heure donnée = 1 heure reçue, indépendamment de la nature du service échangé.
            </Text>
            <Text style={styles.paragraph}>
              L'Application facilite la mise en relation entre les Utilisateurs mais n'intervient pas dans l'exécution des services échangés.
            </Text>
          </View>

          {/* Article 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 2 - Système d'Échange et Portefeuille de Temps</Text>
            <Text style={styles.paragraph}>
              Chaque Utilisateur dispose d'un "Portefeuille de Temps" virtuel qui comptabilise les heures de services :
            </Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Crédit d'heures :</Text> Lorsqu'un Utilisateur fournit un service, son portefeuille est crédité du nombre d'heures correspondantes.</Text>
            <Text style={styles.listItem}>• <Text style={styles.bold}>Débit d'heures :</Text> Lorsqu'un Utilisateur bénéficie d'un service, son portefeuille est débité du nombre d'heures correspondantes.</Text>
            <Text style={styles.paragraph}>
              Les heures accumulées peuvent être utilisées pour bénéficier de services proposés par d'autres Utilisateurs de la communauté.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Achat d'heures :</Text> Les Utilisateurs peuvent acheter des heures via le système de paiement intégré (Stripe) pour alimenter leur portefeuille initial ou en cas de solde insuffisant.
            </Text>
          </View>

          {/* Article 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 3 - Inscription et Compte Utilisateur</Text>
            <Text style={styles.paragraph}>
              L'inscription sur l'Application est gratuite et requiert la fourniture d'informations exactes et à jour (nom, email, localisation approximative).
            </Text>
            <Text style={styles.paragraph}>
              Chaque Utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toutes les activités effectuées depuis son compte.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Acceptation des CGU :</Text> En cochant la case lors de l'inscription, l'Utilisateur déclare avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation.
            </Text>
          </View>

          {/* Article 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 4 - Règles de la Communauté</Text>
            <Text style={styles.paragraph}>
              Chaque Utilisateur s'engage à :
            </Text>
            <Text style={styles.listItem}>• Être ponctuel et respecter les horaires convenus pour les échanges</Text>
            <Text style={styles.listItem}>• Faire preuve de courtoisie et de respect envers les autres Utilisateurs</Text>
            <Text style={styles.listItem}>• Fournir des services de qualité conforme aux descriptions publiées</Text>
            <Text style={styles.listItem}>• Communiquer de manière claire et honnête via la messagerie intégrée</Text>
            <Text style={styles.listItem}>• Ne pas utiliser l'Application à des fins commerciales ou illégales</Text>
            <Text style={styles.listItem}>• Ne pas publier de contenus offensants, diffamatoires ou inappropriés</Text>
            <Text style={styles.paragraph}>
              Le non-respect de ces règles peut entraîner des sanctions allant jusqu'à la suspension ou la résiliation du compte.
            </Text>
          </View>

          {/* Article 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 5 - Rôle et Responsabilité de la Plateforme</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>L'Application "Coup de Pouce" agit uniquement en tant qu'intermédiaire technique</Text> facilitant la mise en relation entre Utilisateurs.
            </Text>
            <Text style={styles.paragraph}>
              SAS CDP ne peut être tenue responsable :
            </Text>
            <Text style={styles.listItem}>• De l'exécution, de la qualité ou de la non-exécution des services échangés entre Utilisateurs</Text>
            <Text style={styles.listItem}>• Des dommages directs ou indirects résultant d'un échange de services</Text>
            <Text style={styles.listItem}>• Des litiges entre Utilisateurs concernant les services échangés</Text>
            <Text style={styles.listItem}>• De l'exactitude des informations fournies par les Utilisateurs dans leurs profils ou annonces</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Clause de limitation de responsabilité :</Text> L'éditeur met à disposition un outil de mise en relation mais ne garantit pas la réalisation effective des services ni leur conformité aux attentes des Utilisateurs.
            </Text>
          </View>

          {/* Article 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 6 - Système de Notation et Réputation</Text>
            <Text style={styles.paragraph}>
              Après chaque échange confirmé, les Utilisateurs peuvent s'évaluer mutuellement via un système de notation et de commentaires.
            </Text>
            <Text style={styles.paragraph}>
              La réputation d'un Utilisateur est calculée sur la base de ses évaluations et est visible publiquement sur son profil.
            </Text>
            <Text style={styles.paragraph}>
              Les évaluations frauduleuses, abusives ou diffamatoires peuvent être signalées et supprimées par l'éditeur.
            </Text>
          </View>

          {/* Article 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 7 - Signalement et Sanctions</Text>
            <Text style={styles.paragraph}>
              Un système de signalement permet aux Utilisateurs de signaler tout comportement inapproprié, service non conforme ou abus.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Sanctions applicables :</Text>
            </Text>
            <Text style={styles.listItem}>• Avertissement</Text>
            <Text style={styles.listItem}>• Suspension temporaire du compte</Text>
            <Text style={styles.listItem}>• Résiliation définitive du compte en cas de manquements graves ou répétés</Text>
            <Text style={styles.paragraph}>
              L'éditeur se réserve le droit de suspendre ou de résilier un compte sans préavis ni indemnité en cas de violation des présentes CGU.
            </Text>
          </View>

          {/* Article 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 8 - Données Personnelles et Confidentialité</Text>
            <Text style={styles.paragraph}>
              Les données personnelles collectées et traitées dans le cadre de l'utilisation de l'Application sont régies par notre Politique de Confidentialité, accessible via le menu "Mentions Légales".
            </Text>
            <Text style={styles.paragraph}>
              L'Utilisateur dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données personnelles conformément au RGPD.
            </Text>
          </View>

          {/* Article 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 9 - Propriété Intellectuelle</Text>
            <Text style={styles.paragraph}>
              Tous les éléments de l'Application (design, logo, textes, graphismes, code source) sont la propriété exclusive de SAS CDP ou font l'objet d'une autorisation d'utilisation.
            </Text>
            <Text style={styles.paragraph}>
              Toute reproduction, représentation, modification ou distribution non autorisée est strictement interdite.
            </Text>
          </View>

          {/* Article 10 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 10 - Modification des CGU</Text>
            <Text style={styles.paragraph}>
              L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront informés de toute modification substantielle via une notification dans l'Application.
            </Text>
            <Text style={styles.paragraph}>
              La poursuite de l'utilisation de l'Application après modification des CGU vaut acceptation des nouvelles conditions.
            </Text>
          </View>

          {/* Article 11 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 11 - Droit Applicable et Juridiction</Text>
            <Text style={styles.paragraph}>
              Les présentes CGU sont régies par le droit français.
            </Text>
            <Text style={styles.paragraph}>
              En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut d'accord amiable, les tribunaux français seront seuls compétents.
            </Text>
          </View>

          {/* Article 12 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article 12 - Contact</Text>
            <Text style={styles.paragraph}>
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter à : [Email à compléter]
            </Text>
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