import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ExchangeStatusBannerProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  providerConfirmed?: boolean;
  requesterConfirmed?: boolean;
  isProvider?: boolean;
}

export default function ExchangeStatusBanner({
  status,
  providerConfirmed = false,
  requesterConfirmed = false,
  isProvider = false,
}: ExchangeStatusBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        const myConfirmation = isProvider ? providerConfirmed : requesterConfirmed;
        const otherConfirmation = isProvider ? requesterConfirmed : providerConfirmed;
        
        if (myConfirmation && otherConfirmation) {
          return {
            icon: 'hourglass',
            text: 'Les deux parties ont confirme - Transfert en cours...',
            color: '#3B82F6',
            bgColor: '#EFF6FF',
          };
        } else if (myConfirmation) {
          return {
            icon: 'time',
            text: 'Vous avez confirme - En attente de l autre partie',
            color: '#F59E0B',
            bgColor: '#FEF3C7',
          };
        } else if (otherConfirmation) {
          return {
            icon: 'alert-circle',
            text: 'L autre partie a confirme - Confirmez a votre tour',
            color: '#F59E0B',
            bgColor: '#FEF3C7',
          };
        } else {
          return {
            icon: 'rocket',
            text: 'Mission en cours - Cliquez sur "Tache realisee" une fois termine',
            color: '#10B981',
            bgColor: '#D1FAE5',
          };
        }
      case 'completed':
        return {
          icon: 'checkmark-circle',
          text: 'Echange termine avec succes !',
          color: '#10B981',
          bgColor: '#D1FAE5',
        };
      case 'cancelled':
        return {
          icon: 'close-circle',
          text: 'Echange annule',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      default:
        return {
          icon: 'information-circle',
          text: 'Echange en attente',
          color: '#6B7280',
          bgColor: '#F3F4F6',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});