import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../src/utils/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const devCode = params.dev_code as string; // Code de développement

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    setError('');

    if (!code.trim()) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    if (!newPassword.trim()) {
      setError('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        code: code.trim(),
        new_password: newPassword,
      });

      // Succès - rediriger vers la page de login
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3EADAD" />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#3EADAD', '#5FCFCF']}
              style={styles.iconGradient}
            >
              <Ionicons name="key" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Réinitialiser le mot de passe</Text>
          <Text style={styles.subtitle}>
            Entrez le code envoyé à <Text style={styles.emailText}>{email}</Text> et votre nouveau mot de passe.
          </Text>

          {/* Dev Code Display (only in development) */}
          {devCode && (
            <View style={styles.devCodeContainer}>
              <Ionicons name="information-circle" size={20} color="#3EADAD" />
              <Text style={styles.devCodeText}>Code de développement : <Text style={styles.devCodeValue}>{devCode}</Text></Text>
            </View>
          )}

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Code de vérification"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#3EADAD', '#5FCFCF']}
              style={styles.resetButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Réinitialiser le mot de passe</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backToLoginButton}>
            <Text style={styles.backToLoginText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#3EADAD',
  },
  devCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  devCodeText: {
    fontSize: 13,
    color: '#0F766E',
    flex: 1,
  },
  devCodeValue: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#3EADAD',
    fontSize: 15,
    fontWeight: '600',
  },
});
