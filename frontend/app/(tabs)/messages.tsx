import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import api from '../../src/utils/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadConversations();

    // Animations d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
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

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header moderne avec dégradé sobre */}
      <LinearGradient
        colors={['#3EADAD', '#5FCFCF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>{conversations.length}</Text>
            </View>
          </View>
        </View>

        {/* Barre de recherche intégrée au header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#3EADAD" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une conversation..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Contenu des conversations */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3EADAD']}
            tintColor="#3EADAD"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3EADAD" />
            <Text style={styles.loadingText}>Chargement des conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(62, 173, 173, 0.05)', 'rgba(95, 207, 207, 0.02)']}
              style={styles.emptyIconWrapper}
            >
              <Ionicons name="chatbubbles-outline" size={64} color="#3EADAD" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucune conversation'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Aucune conversation ne correspond à votre recherche'
                : 'Vos conversations apparaîtront ici une fois que vous aurez échangé avec d\'autres utilisateurs.'}
            </Text>
          </Animated.View>
        ) : (
          filteredConversations.map((conversation, index) => (
            <Animated.View
              key={conversation._id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.conversationCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/chat?id=${conversation._id}`)}
              >
                {/* Avatar avec dégradé */}
                <LinearGradient
                  colors={['#3EADAD', '#5FCFCF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {conversation.otherUser?.avatar || conversation.otherUser?.name?.charAt(0) || '?'}
                  </Text>
                </LinearGradient>

                {/* Contenu de la conversation */}
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>
                      {conversation.otherUser?.name || 'Utilisateur'}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.conversationMessage} numberOfLines={1}>
                    {conversation.lastMessage || 'Nouvelle conversation'}
                  </Text>

                  {conversation.serviceTitle && (
                    <View style={styles.serviceTag}>
                      <Ionicons name="pricetag" size={12} color="#3EADAD" />
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {conversation.serviceTitle}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Indicateur non lu */}
                {conversation.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingBottom: 8,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    headerStats: {
      flexDirection: 'row',
      gap: 8,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    statText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    searchContainer: {
      marginTop: 4,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    loadingContainer: {
      padding: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      marginTop: 64,
    },
    emptyIconWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 32,
    },
    conversationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    avatarGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#3EADAD',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    conversationName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    conversationTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    conversationMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    serviceTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(62, 173, 173, 0.1)',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    serviceTitle: {
      fontSize: 11,
      color: '#3EADAD',
      fontWeight: '600',
    },
    unreadBadge: {
      backgroundColor: '#EF4444',
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      marginLeft: 8,
    },
    unreadText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });
