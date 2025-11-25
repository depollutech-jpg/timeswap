import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/utils/api';
import { useAuthStore } from '../src/store/authStore';

interface Package {
  hours: number;
  price: number;
}

interface Packages {
  [key: string]: Package;
}

export default function BuyHoursScreen() {
  const router = useRouter();
  const { session_id } = useLocalSearchParams();
  const { user, setUser } = useAuthStore();
  const [packages, setPackages] = useState<Packages | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    loadPackages();
    if (session_id) {
      checkPaymentStatus(session_id as string);
    }
  }, [session_id]);

  const loadPackages = async () => {
    try {
      const response = await api.get('/payments/packages');
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to load packages:', error);
      Alert.alert('Erreur', 'Impossible de charger les forfaits');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (sessionId: string, attempt = 0) => {
    if (attempt >= 5) {
      Alert.alert('Timeout', 'Vérification du paiement expirée');
      return;
    }

    setCheckingPayment(true);
    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        // Refresh user data
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
        
        Alert.alert(
          'Paiement réussi !',
          `Vous avez reçu ${response.data.hours} heures de crédit.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
        );
      } else if (response.data.status === 'expired') {
        Alert.alert('Paiement expiré', 'La session de paiement a expiré');
      } else {
        // Still pending, check again
        setTimeout(() => checkPaymentStatus(sessionId, attempt + 1), 2000);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le statut du paiement');
    } finally {
      setCheckingPayment(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (typeof window === 'undefined') {
      Alert.alert('Erreur', 'Cette fonctionnalité est disponible uniquement sur le web');
      return;
    }

    setPurchasing(true);
    try {
      const originUrl = window.location.origin;
      const response = await api.post('/payments/checkout', {
        package_id: packageId,
        origin_url: originUrl,
      });

      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de créer la session de paiement'
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (checkingPayment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Vérification du paiement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acheter des heures</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Achetez des heures pour échanger des services même si vous n'avez pas encore donné de votre temps.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choisissez votre forfait</Text>

        {packages && Object.entries(packages).map(([key, pkg]) => (
          <TouchableOpacity
            key={key}
            style={styles.packageCard}
            onPress={() => handlePurchase(key)}
            disabled={purchasing}
          >
            <View style={styles.packageInfo}>
              <View>
                <Text style={styles.packageHours}>{pkg.hours} heures</Text>
                <Text style={styles.packageDesc}>
                  {pkg.price / pkg.hours}€ par heure
                </Text>
              </View>
              <View style={styles.packagePriceContainer}>
                <Text style={styles.packagePrice}>{pkg.price}€</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Avantages</Text>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Paiement sécurisé avec Stripe</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Crédits immédiatement disponibles</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Pas de date d'expiration</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '20',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.info,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  packageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageHours: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  packagePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  featuresCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
});
