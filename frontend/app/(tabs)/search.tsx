import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES } from '../../src/constants/categories';
import api from '../../src/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [selectedCategory, selectedType]);

  const loadServices = async () => {
    try {
      let url = '/services?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedType) url += `type=${selectedType}&`;
      
      const response = await api.get(url);
      setServices(response.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service: any) =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rechercher</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un service..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedType && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedType && styles.filterChipTextActive,
              ]}
            >
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedType === 'offer' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType('offer')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedType === 'offer' && styles.filterChipTextActive,
              ]}
            >
              Offres
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedType === 'request' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType('request')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedType === 'request' && styles.filterChipTextActive,
              ]}
            >
              Demandes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.slice(0, 8).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )
              }
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun service trouvé</Text>
          </View>
        ) : (
          filteredServices.map((service: any) => (
            <TouchableOpacity key={service._id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceUser}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} color={Colors.textSecondary} />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.userName}>{service.user.name}</Text>
                      {service.user.isVerified && (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      )}
                    </View>
                    <Text style={styles.serviceLocation}>{service.location}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.serviceType,
                    {
                      backgroundColor:
                        service.type === 'offer'
                          ? Colors.primary + '20'
                          : Colors.secondary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.serviceTypeText,
                      {
                        color: service.type === 'offer' ? Colors.primary : Colors.secondary,
                      },
                    ]}
                  >
                    {service.type === 'offer' ? 'Offre' : 'Demande'}
                  </Text>
                </View>
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {service.description}
              </Text>
              <View style={styles.serviceFooter}>
                <View style={styles.serviceInfo}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.serviceInfoText}>{service.duration}h</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Ionicons name="folder-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.serviceInfoText}>{service.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    minWidth: 80,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary + '20',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  serviceType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
