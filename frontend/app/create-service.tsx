import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Colors } from '../src/constants/colors';
import { CATEGORIES } from '../src/constants/categories';
import api from '../src/utils/api';
import { useAuthStore } from '../src/store/authStore';

export default function CreateServiceScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState(user?.profile.location || '');
  const [photos, setPhotos] = useState<string[]>([]);

  const isOffer = type === 'offer';

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !duration || !location.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Erreur', 'La durée doit être un nombre positif');
      return;
    }

    // Pour les demandes, vérifier qu'on a assez de crédits
    if (!isOffer && user && user.credits.available < durationNum) {
      Alert.alert(
        'Crédits insuffisants',
        `Vous avez besoin de ${durationNum}h mais vous n'avez que ${user.credits.available.toFixed(1)}h disponible.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Acheter des heures',
            onPress: () => router.push('/buy-hours'),
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/services', {
        title: title.trim(),
        description: description.trim(),
        category,
        duration: durationNum,
        type: isOffer ? 'offer' : 'request',
        location: location.trim(),
        coordinates: null,
      });

      Alert.alert(
        'Succès !',
        isOffer
          ? 'Votre offre de service a été publiée avec succès'
          : 'Votre demande d\'aide a été publiée avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de créer le service'
      );
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
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isOffer ? 'Proposer un service' : 'Demander de l\'aide'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: isOffer ? Colors.primary + '20' : Colors.secondary + '20' },
            ]}
          >
            <Ionicons
              name={isOffer ? 'gift' : 'hand-right'}
              size={24}
              color={isOffer ? Colors.primary : Colors.secondary}
            />
            <Text style={styles.infoText}>
              {isOffer
                ? 'Proposez vos compétences et gagnez des heures en aidant la communauté'
                : 'Décrivez ce dont vous avez besoin et trouvez quelqu\'un pour vous aider'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={isOffer ? 'Ex: Cours de cuisine italienne' : 'Ex: Besoin d\'aide pour déménager'}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez en détail votre service ou votre besoin..."
                multiline
                numberOfLines={6}
                maxLength={500}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        category === cat.id && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat.id && styles.categoryTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Durée (heures) *</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="2.5"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Localisation *</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Paris 11e"
                />
              </View>
            </View>

            {/* Credits Warning */}
            {!isOffer && user && (
              <View style={styles.creditsCard}>
                <Ionicons name="wallet" size={20} color={Colors.info} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.creditsText}>
                    Vous avez {user.credits.available.toFixed(1)}h de crédit disponible
                  </Text>
                  {duration && parseFloat(duration) > user.credits.available && (
                    <Text style={styles.warningText}>
                      ⚠️ Crédits insuffisants. Vous devez acheter des heures.
                    </Text>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isOffer ? Colors.primary : Colors.secondary,
                },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name={isOffer ? 'checkmark' : 'send'} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isOffer ? 'Publier mon offre' : 'Publier ma demande'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  infoCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  creditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  creditsText: {
    fontSize: 14,
    color: Colors.info,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
