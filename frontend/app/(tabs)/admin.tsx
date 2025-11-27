import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/utils/api';
import { useRouter, Link } from 'expo-router';

// Liste blanche des emails autorisés
const AUTHORIZED_ADMIN_EMAILS = [
  'quentinraffalli@hotmail.com',
  'depollutech@gmail.com',
];

export default function AdminTabScreen() {
  const { user, setUser, setToken } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Vérifier si déjà admin au montage
  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdminLoggedIn(true);
    }
  }, [user]);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!AUTHORIZED_ADMIN_EMAILS.includes(trimmedEmail)) {
      Alert.alert(
        'Accès refusé',
        "Vous n'êtes pas autorisé à utiliser l'espace administrateur."
      );
      return;
    }

    setLoginLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: trimmedEmail,
        password,
      });

      if (response.data.user.role !== 'admin') {
        Alert.alert(
          'Accès refusé',
          "Vous n'êtes pas autorisé à utiliser l'espace administrateur."
        );
        setLoginLoading(false);
        return;
      }

      await setToken(response.data.token);
      setUser(response.data.user);
      setIsAdminLoggedIn(true);
      Alert.alert('Connexion réussie', "Bienvenue dans l'espace administrateur !");
    } catch (error: any) {
      Alert.alert(
        'Erreur de connexion',
        error.response?.data?.detail || 'Email ou mot de passe incorrect'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Si l'utilisateur est admin connecté, afficher le dashboard simplifié
  if (isAdminLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>🛡️ Dashboard Admin</Text>
          <Text style={styles.dashboardSubtitle}>Bienvenue {user?.profile.firstName}</Text>
        </View>
        <ScrollView style={styles.dashboardContent}>
          <View style={styles.statsCard}>
            <Ionicons name="people" size={32} color={Colors.primary} />
            <Text style={styles.statsTitle}>Gestion</Text>
            <Text style={styles.statsSubtitle}>Accès complet aux fonctionnalités admin</Text>
          </View>
          
          <View style={styles.statsCard}>
            <Ionicons name="stats-chart" size={32} color={Colors.secondary} />
            <Text style={styles.statsTitle}>Statistiques</Text>
            <Text style={styles.statsSubtitle}>Tableaux de bord détaillés</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text style={styles.infoCardText}>
              Accédez au dashboard complet avec graphiques et outils de gestion.
            </Text>
          </View>

          <Link href="/admin" asChild>
            <TouchableOpacity style={styles.fullDashboardButton}>
              <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
              <Text style={styles.fullDashboardButtonText}>
                Accéder au Dashboard Complet
              </Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sinon, afficher le formulaire de connexion
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Espace Administrateur</Text>
            <Text style={styles.subtitle}>
              Accès réservé aux administrateurs autorisés
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="admin@timeswap.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loginLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loginLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loginLoading && styles.buttonDisabled]}
              onPress={handleAdminLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Accéder au Dashboard</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                Seuls les administrateurs autorisés peuvent accéder à cet espace.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  // Styles dashboard
  dashboardHeader: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dashboardContent: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  fullDashboardButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  fullDashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
