import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import api from '../src/utils/api';
import { useAuthStore } from '../src/store/authStore';
import { useNotificationStore } from '../src/store/notificationStore';
import { useExchangeStore } from '../src/store/exchangeStore';
import ExchangeStatusBanner from '../src/components/ExchangeStatusBanner';
import ConfirmationModal from '../src/components/ConfirmationModal';
import RatingModal from '../src/components/RatingModal';
import ReportModal from '../src/components/ReportModal';
import AppointmentModal from '../src/components/AppointmentModal';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const { acceptExchange, confirmCompletion, cancelExchange, rateExchange } = useExchangeStore();
  const [chat, setChat] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [exchange, setExchange] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Modals states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadChat();
    loadMessages();
    markChatNotificationsAsRead();
  }, [id]);

  useEffect(() => {
    if (chat?.serviceId) {
      loadService();
      loadExchange();
    }
  }, [chat]);

  const markChatNotificationsAsRead = async () => {
    try {
      const chatNotifications = notifications.filter(
        (notif) => notif.chatId === id && !notif.read
      );

      for (const notif of chatNotifications) {
        await api.post(`/notifications/${notif._id}/mark-read`);
      }

      if (chatNotifications.length > 0) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to mark chat notifications as read:', error);
    }
  };

  const loadChat = async () => {
    try {
      const response = await api.get(`/chats/${id}`);
      setChat(response.data);
    } catch (error) {
      console.error('Failed to load chat:', error);
      router.back();
    }
  };

  const loadService = async () => {
    try {
      if (chat?.serviceId) {
        const response = await api.get(`/services/${chat.serviceId}`);
        setService(response.data);
      }
    } catch (error) {
      console.error('Failed to load service:', error);
    }
  };

  const loadExchange = async () => {
    try {
      // Chercher un echange lie a ce service
      const response = await api.get('/exchanges/my/all');
      const relatedExchange = response.data.find(
        (ex: any) => ex.serviceId === chat?.serviceId
      );
      if (relatedExchange) {
        setExchange(relatedExchange);
      }
    } catch (error) {
      console.error('Failed to load exchange:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/chats/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Exchange Actions
  const handleAcceptExchange = async () => {
    try {
      if (!service) return;
      await acceptExchange(service._id, 'Je suis interesse');
      Alert.alert('Succes', 'Echange accepte !');
      setShowAcceptModal(false);
      await loadExchange();
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      if (!exchange) return;
      const result = await confirmCompletion(exchange._id);
      
      if (result.status === 'completed') {
        Alert.alert(
          'Echange termine !',
          `Le transfert de ${result.hoursTransferred}h a ete effectue. Vous avez gagne ${result.xpAwarded} XP !`,
          [{ text: 'Noter', onPress: () => setShowRatingModal(true) }]
        );
      } else {
        Alert.alert('Confirmation enregistree', 'En attente de la confirmation de l autre partie.');
      }
      
      setShowConfirmModal(false);
      await loadExchange();
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleCancelExchange = async (reason: string) => {
    try {
      if (!exchange) return;
      await cancelExchange(exchange._id, reason);
      Alert.alert('Echange annule', 'L echange a ete annule.');
      setShowCancelModal(false);
      await loadExchange();
      await loadService();
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRateExchange = async (rating: number, review: string) => {
    try {
      if (!exchange) return;
      await rateExchange(exchange._id, rating, review);
      Alert.alert('Merci !', 'Votre note a ete enregistree.');
      setShowRatingModal(false);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const createAppointment = async (date: Date, title: string, description: string) => {
    try {
      await api.post('/appointments', {
        chatId: chat._id,
        otherUserId: chat.otherUser._id,
        date: date.toISOString(),
        title,
        description
      });
      
      Alert.alert('✅ Succès', 'Rendez-vous créé avec succès !');
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      Alert.alert('❌ Erreur', 'Impossible de créer le rendez-vous');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await api.post(`/chats/${id}/messages`, {
        content: messageText,
      });

      setMessages([...messages, response.data]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {chat?.serviceTitle || 'Conversation'}
          </Text>
          <TouchableOpacity
            onPress={() => chat?.otherUser?._id && router.push(`/user-profile?id=${chat.otherUser._id}`)}
          >
            <Text style={styles.headerSubtitle}>
              {chat?.otherUser?.name || 'Utilisateur'} →
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowAppointmentModal(true)}
        >
          <Ionicons name="calendar-outline" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => chat?.otherUser?._id && router.push(`/user-profile?id=${chat.otherUser._id}`)}
        >
          <Ionicons name="person-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Service Info Card with Image */}
      {service && (
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => router.push(`/service-details?id=${service._id}`)}
        >
          {service.photos && service.photos[0] && (
            <Image source={{ uri: service.photos[0] }} style={styles.serviceImage} />
          )}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {service.title}
            </Text>
            <View style={styles.serviceDetails}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.serviceDetailText}>{service.duration}h</Text>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
              <Text style={styles.serviceDetailText}>{service.location}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Exchange Status Banner */}
      {exchange && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ExchangeStatusBanner
            status={exchange.status}
            providerConfirmed={exchange.providerConfirmed}
            requesterConfirmed={exchange.requesterConfirmed}
            isProvider={exchange.providerId === user?._id}
          />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                Aucun message. Commencez la conversation !
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor={Colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {service && exchange && (
          <View style={styles.actionsBar}>
            {/* Accepter l'echange - Si pas encore accepte */}
            {!exchange && service.status === 'active' && service.userId !== user?._id && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowAcceptModal(true)}
              >
                <Ionicons name="handshake" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Accepter l echange</Text>
              </TouchableOpacity>
            )}

            {/* Tache realisee - Si echange accepte */}
            {exchange && exchange.status === 'accepted' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => setShowConfirmModal(true)}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Tache realisee</Text>
              </TouchableOpacity>
            )}

            {/* Annuler - Si echange en cours */}
            {exchange && exchange.status === 'accepted' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowCancelModal(true)}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Annuler</Text>
              </TouchableOpacity>
            )}

            {/* Noter - Si echange termine */}
            {exchange && exchange.status === 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rateButton]}
                onPress={() => setShowRatingModal(true)}
              >
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Noter</Text>
              </TouchableOpacity>
            )}

            {/* Signaler */}
            <TouchableOpacity
              style={[styles.actionButton, styles.reportButton]}
              onPress={() => setShowReportModal(true)}
            >
              <Ionicons name="flag" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modals */}
      <ConfirmationModal
        visible={showAcceptModal}
        title="Accepter l'echange"
        message={`Voulez-vous accepter cet echange de ${service?.duration || 0}h ? L'annonce sera verrouillee.`}
        confirmText="Accepter"
        icon="handshake"
        iconColor={Colors.primary}
        onConfirm={handleAcceptExchange}
        onCancel={() => setShowAcceptModal(false)}
      />

      <ConfirmationModal
        visible={showConfirmModal}
        title="Confirmer la tache"
        message="Confirmez-vous que la tache a ete realisee ? Les deux parties doivent confirmer pour finaliser l'echange."
        confirmText="Confirmer"
        icon="checkmark-done"
        iconColor="#10B981"
        onConfirm={handleConfirmCompletion}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmationModal
        visible={showCancelModal}
        title="Annuler l'echange"
        message="Voulez-vous vraiment annuler cet echange ? Des penalites peuvent s'appliquer si la tache etait deja commencee."
        confirmText="Annuler l'echange"
        cancelText="Retour"
        icon="close-circle"
        iconColor="#EF4444"
        confirmColor="#EF4444"
        showInput
        inputPlaceholder="Motif de l'annulation..."
        onConfirm={handleCancelExchange}
        onCancel={() => setShowCancelModal(false)}
      />

      <RatingModal
        visible={showRatingModal}
        userName={exchange?.provider?.name || exchange?.requester?.name || 'l utilisateur'}
        onSubmit={handleRateExchange}
        onCancel={() => setShowRatingModal(false)}
      />

      <ReportModal
        visible={showReportModal}
        targetType="user"
        targetId={chat?.otherUser?._id || ''}
        onClose={() => setShowReportModal(false)}
      />

      <AppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onConfirm={createAppointment}
        otherUserName={chat?.otherUser?.name || 'l\'utilisateur'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  profileButton: {
    padding: 4,
  },
  calendarButton: {
    padding: 4,
    marginRight: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
  },
  serviceCardText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    flex: 0,
    paddingHorizontal: 12,
  },
  rateButton: {
    backgroundColor: '#F59E0B',
  },
  reportButton: {
    backgroundColor: '#F3F4F6',
    flex: 0,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
