import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import AnimatedHeader from '../../src/components/AnimatedHeader';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.get('/chats');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return `Il y a ${days}j`;
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header animé avec barre de recherche */}
      <AnimatedHeader height={180}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Messages</Text>
            <TouchableOpacity style={styles.composeButton}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Barre de recherche intégrée */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une conversation..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </AnimatedHeader>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptyText}>
              Vos conversations apparaîtront ici une fois que vous aurez échangé avec d'autres utilisateurs.
            </Text>
          </View>
        ) : (
          filteredConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation._id}
              style={styles.conversationCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/chat?id=${conversation._id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{conversation.otherUser.avatar}</Text>
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{conversation.otherUser?.name || 'Utilisateur'}</Text>
                  <Text style={styles.conversationTime}>
                    {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                  </Text>
                </View>

                <View style={styles.conversationFooter}>
                  <Text
                    style={styles.conversationMessage}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage || 'Nouvelle conversation'}
                  </Text>
                  <Text style={styles.serviceTitle} numberOfLines={1}>
                    {conversation.serviceTitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  composeButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3EADAD', // Couleur turquoise du header
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  conversationMessageUnread: {
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
