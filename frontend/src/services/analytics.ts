import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Service d'analytics pour tracker les événements utilisateur
 */
class AnalyticsService {
  /**
   * Track un événement personnalisé
   */
  logEvent(eventName: string, params?: Record<string, any>) {
    if (!analytics) {
      console.log(`[Analytics] ${eventName}`, params);
      return;
    }

    try {
      logEvent(analytics, eventName, params);
      console.log(`✅ Analytics: ${eventName}`, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Définir l'ID utilisateur
   */
  setUser(userId: string) {
    if (!analytics) return;

    try {
      setUserId(analytics, userId);
      console.log(`✅ Analytics: User ID set to ${userId}`);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Définir les propriétés utilisateur
   */
  setUserProperties(properties: Record<string, any>) {
    if (!analytics) return;

    try {
      setUserProperties(analytics, properties);
      console.log('✅ Analytics: User properties set', properties);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // === Événements d'authentification ===

  userSignup(method: string = 'email') {
    this.logEvent('sign_up', { method });
  }

  userLogin(method: string = 'email') {
    this.logEvent('login', { method });
  }

  userLogout() {
    this.logEvent('logout');
  }

  passwordReset() {
    this.logEvent('password_reset');
  }

  // === Événements d'annonces ===

  createService(category: string, type: 'offer' | 'demand', duration: number) {
    this.logEvent('create_service', {
      category,
      type,
      duration,
    });
  }

  viewService(serviceId: string, category: string) {
    this.logEvent('view_item', {
      item_id: serviceId,
      item_category: category,
    });
  }

  deleteService(serviceId: string) {
    this.logEvent('delete_service', {
      item_id: serviceId,
    });
  }

  searchServices(query: string) {
    this.logEvent('search', {
      search_term: query,
    });
  }

  // === Événements de messagerie ===

  sendMessage(chatId: string) {
    this.logEvent('send_message', {
      chat_id: chatId,
    });
  }

  deleteMessage(messageId: string) {
    this.logEvent('delete_message', {
      message_id: messageId,
    });
  }

  createAppointment(chatId: string, date: string) {
    this.logEvent('create_appointment', {
      chat_id: chatId,
      appointment_date: date,
    });
  }

  deleteConversation(chatId: string) {
    this.logEvent('delete_conversation', {
      chat_id: chatId,
    });
  }

  // === Événements sociaux ===

  blockUser(userId: string) {
    this.logEvent('block_user', {
      blocked_user_id: userId,
    });
  }

  reportUser(userId: string, reason: string) {
    this.logEvent('report_user', {
      reported_user_id: userId,
      reason,
    });
  }

  // === Événements de navigation ===

  screenView(screenName: string) {
    this.logEvent('screen_view', {
      screen_name: screenName,
    });
  }

  tabChange(tabName: string) {
    this.logEvent('tab_change', {
      tab_name: tabName,
    });
  }

  // === Événements d'échange ===

  acceptExchange(serviceId: string, duration: number) {
    this.logEvent('accept_exchange', {
      item_id: serviceId,
      duration,
    });
  }

  completeExchange(exchangeId: string, rating: number) {
    this.logEvent('complete_exchange', {
      exchange_id: exchangeId,
      rating,
    });
  }

  // === Événements de gamification ===

  levelUp(newLevel: number) {
    this.logEvent('level_up', {
      level: newLevel,
    });
  }

  earnBadge(badgeId: string, badgeName: string) {
    this.logEvent('earn_badge', {
      badge_id: badgeId,
      badge_name: badgeName,
    });
  }

  // === Événements de transaction ===

  purchaseCredits(amount: number, hours: number) {
    this.logEvent('purchase', {
      currency: 'EUR',
      value: amount,
      items: [
        {
          item_id: 'time_credits',
          item_name: 'Crédits temps',
          quantity: hours,
        },
      ],
    });
  }
}

// Export une instance singleton
export const analytics_service = new AnalyticsService();
