import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORIES } from '../../src/constants/categories';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmDialog from '../../src/components/ConfirmDialog';

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Form state
  const [firstName, setFirstName] = useState(user?.profile.firstName || '');
  const [lastName, setLastName] = useState(user?.profile.lastName || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [phone, setPhone] = useState(user?.profile.phone || '');
  const [location, setLocation] = useState(user?.profile.location || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [availability, setAvailability] = useState('Disponible');

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulsation pour le statut
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    router.replace('/');
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

  const toggleInterest = (categoryId) => {
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
    } catch (error) {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header moderne avec dégradé */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#3EADAD', '#5FCFCF', '#3EADAD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              {/* Photo de profil grande avec bordure animée */}
              <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
                <LinearGradient
                  colors={['#FFFFFF', 'rgba(255,255,255,0.7)', '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarBorder}
                >
                  <View style={styles.avatarInner}>
                    {user?.profile.photo_base64 ? (
                      <Image source={{ uri: user.profile.photo_base64 }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={60} color="#3EADAD" />
                      </View>
                    )}
                  </View>
                </LinearGradient>
                
                {/* Badge édition */}
                <View style={styles.editBadgeFloat}>
                  <Ionicons name="camera" size={18} color="#3EADAD" />
                </View>
                
                {/* Badge vérifié */}
                {user?.verification.isVerified && (
                  <Animated.View style={[styles.verifiedBadgeFloat, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  </Animated.View>
                )}
              </TouchableOpacity>

              {/* Nom et statut */}
              <Text style={styles.userName}>
                {user?.profile.firstName} {user?.profile.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>

              {/* Statut disponibilité */}
              <View style={styles.statusBadge}>
                <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.statusText}>Disponible</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats modernes avec glassmorphism */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(62, 173, 173, 0.1)', 'rgba(95, 207, 207, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="time-outline" size={28} color="#3EADAD" />
              <Text style={styles.statValue}>{user?.credits.available.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Heures</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="trophy-outline" size={28} color="#FBBF24" />
              <Text style={styles.statValue}>{user?.gamification.level}</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="star-outline" size={28} color="#8B5CF6" />
              <Text style={styles.statValue}>{user?.gamification.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </LinearGradient>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Modifier le profil</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jean"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Dupont"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor={colors.textSecondary}
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
                placeholderTextColor={colors.textSecondary}
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
                placeholderTextColor={colors.textSecondary}
              />
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
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#3EADAD', '#5FCFCF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Bouton éditer moderne */}
            <TouchableOpacity
              style={styles.editButtonModern}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F9FAFB']}
                style={styles.editButtonGradient}
              >
                <Ionicons name="create-outline" size={20} color="#3EADAD" />
                <Text style={styles.editButtonTextModern}>Modifier mon profil</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Menu Items modernes */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.modernMenuItem}
                activeOpacity={0.7}
                onPress={() => router.push('/my-services')}
              >
                <View style={styles.menuIconWrapper}>
                  <Ionicons name="list" size={24} color="#3EADAD" />
                </View>
                <View style={styles.menuTextWrapper}>
                  <Text style={styles.menuTitle}>Mes annonces</Text>
                  <Text style={styles.menuSubtitle}>Gérer mes publications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modernMenuItem} activeOpacity={0.7}>
                <View style={styles.menuIconWrapper}>
                  <Ionicons name="swap-horizontal" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.menuTextWrapper}>
                  <Text style={styles.menuTitle}>Mes échanges</Text>
                  <Text style={styles.menuSubtitle}>Historique des services</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {!user?.verification.isVerified && (
                <TouchableOpacity style={styles.modernMenuItem} activeOpacity={0.7}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  </View>
                  <View style={styles.menuTextWrapper}>
                    <Text style={styles.menuTitle}>Vérifier mon profil</Text>
                    <Text style={styles.menuSubtitle}>Gagner en crédibilité</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>

            {/* Section déconnexion */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.modernMenuItem}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Ionicons name="log-out" size={24} color="#EF4444" />
                </View>
                <View style={styles.menuTextWrapper}>
                  <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Déconnexion</Text>
                  <Text style={styles.menuSubtitle}>Se déconnecter du compte</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Dialogue de confirmation de déconnexion */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnecter"
        cancelText="Annuler"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
        destructive
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerGradient: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#3EADAD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 136,
    height: 136,
    borderRadius: 68,
    padding: 4,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
  },
  editBadgeFloat: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verifiedBadgeFloat: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editButtonModern: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  editButtonTextModern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3EADAD',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modernMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(62, 173, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrapper: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
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
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
    backgroundColor: 'rgba(62, 173, 173, 0.1)',
    borderColor: '#3EADAD',
  },
  interestIcon: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  interestTextActive: {
    color: '#3EADAD',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3EADAD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
