import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES } from '../../src/constants/categories';

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(user?.profile.firstName || '');
  const [lastName, setLastName] = useState(user?.profile.lastName || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [phone, setPhone] = useState(user?.profile.phone || '');
  const [location, setLocation] = useState(user?.profile.location || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [availability, setAvailability] = useState('Disponible');

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await api.put('/profile', {
          ...user?.profile,
          photo_base64: base64Image,
        });

        const response = await api.get('/auth/me');
        setUser(response.data);
        Alert.alert('Succès', 'Photo de profil mise à jour');
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
      }
    }
  };

  const toggleInterest = (categoryId: string) => {
    if (interests.includes(categoryId)) {
      setInterests(interests.filter((id) => id !== categoryId));
    } else {
      setInterests([...interests, categoryId]);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        location: location.trim(),
        interests,
      });

      const response = await api.get('/auth/me');
      setUser(response.data);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.profile.firstName || '');
    setLastName(user?.profile.lastName || '');
    setBio(user?.profile.bio || '');
    setPhone(user?.profile.phone || '');
    setLocation(user?.profile.location || '');
    setInterests(user?.interests || []);
    setIsEditing(false);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Photo & Info */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {user?.profile.photo_base64 ? (
              <Image source={{ uri: user.profile.photo_base64 }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
            {user?.verification.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
            )}
          </TouchableOpacity>

          {!isEditing ? (
            <>
              <Text style={styles.name}>
                {user?.profile.firstName} {user?.profile.lastName}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.editButtonText}>Éditer le profil</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jean"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Dupont"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Parlez-nous de vous..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="06 12 34 56 78"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Localisation</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Paris, France"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Disponibilité</Text>
              <View style={styles.availabilityOptions}>
                {['Disponible', 'Occupé', 'Absent'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.availabilityChip,
                      availability === option && styles.availabilityChipActive,
                    ]}
                    onPress={() => setAvailability(option)}
                  >
                    <Text
                      style={[
                        styles.availabilityText,
                        availability === option && styles.availabilityTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Centres d'intérêt</Text>
              <View style={styles.interestsGrid}>
                {CATEGORIES.slice(0, 12).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.interestChip,
                      interests.includes(category.id) && styles.interestChipActive,
                    ]}
                    onPress={() => toggleInterest(category.id)}
                  >
                    <Text style={styles.interestIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.interestText,
                        interests.includes(category.id) && styles.interestTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.credits.available.toFixed(1)}h</Text>
                <Text style={styles.statLabel}>Crédits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.gamification.level}</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.gamification.xp}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="list-outline" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Mes services</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="swap-horizontal-outline" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Mes échanges</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/buy-hours')}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="cart-outline" size={24} color={colors.primary} />
                  <Text style={[styles.menuItemText, { color: colors.primary }]}>
                    Acheter des heures
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>

              {!user?.verification.isVerified && (
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
                    <Text style={[styles.menuItemText, { color: colors.success }]}>
                      Vérifier mon profil
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.success} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.menuSection}>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => router.push('/admin')}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
                    <Text style={[styles.menuItemText, { color: '#8B5CF6' }]}>
                      Dashboard Admin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="settings-outline" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Paramètres</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="help-circle-outline" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Aide</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  editSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  availabilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  availabilityChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  availabilityTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  interestChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  interestTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
});
;
