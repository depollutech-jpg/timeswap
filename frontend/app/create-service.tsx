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

  // Photo functions
  const pickImage = async () => {
    if (photos.length >= 3) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 3 photos');
      return;
    }

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour acceder a vos photos');
        return;
      }

      // Pick image with base64 option
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true, // Get base64 directly
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Compress and resize if needed
        const manipResult = await manipulateAsync(
          asset.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: SaveFormat.JPEG, base64: true }
        );

        if (manipResult.base64) {
          const base64String = `data:image/jpeg;base64,${manipResult.base64}`;
          
          // Check size (approx 5MB)
          const sizeInMB = (base64String.length * 0.75) / (1024 * 1024);
          if (sizeInMB > 5) {
            Alert.alert('Photo trop volumineuse', 'La photo ne doit pas depasser 5MB apres compression');
            return;
          }

          setPhotos([...photos, base64String]);
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Erreur', 'Impossible de traiter l\'image');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

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

    // Empêcher les multi-clics
    if (loading) {
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
        photos: photos,
      });

      // Redirection automatique immédiate avec message de succès
      Alert.alert(
        'Succès !',
        isOffer
          ? 'Votre offre de service a été publiée avec succès'
          : 'Votre demande a été publiée avec succès'
      );
      
      // Redirection immédiate sans attendre le clic sur OK
      router.replace('/(tabs)/home');
    } catch (error: any) {
      // Réactiver le bouton en cas d'erreur
      setLoading(false);
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de créer le service'
      );
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

            {/* Photos Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photos (optionnel, max 3)</Text>
              <View style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {photos.length < 3 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                    <Ionicons name="camera" size={32} color={Colors.primary} />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.photoHelp}>
                Ajoutez jusqu a 3 photos pour illustrer votre annonce (max 5MB par photo)
              </Text>
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
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  photoHelp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
