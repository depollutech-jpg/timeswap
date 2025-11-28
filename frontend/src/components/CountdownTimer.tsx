import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface CountdownTimerProps {
  expiresAt: string | Date;
  createdAt: string | Date;
  compact?: boolean;
}

export default function CountdownTimer({ expiresAt, createdAt, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const totalHours = diff / (1000 * 60 * 60);

    return { expired: false, days, hours, minutes, seconds, totalHours };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft.expired) {
    return (
      <View style={[styles.container, styles.containerExpired]}>
        <Text style={styles.expiredText}>⏰ Annonce expirée</Text>
      </View>
    );
  }

  // Alerte rouge si moins de 2 heures
  const isUrgent = timeLeft.totalHours < 2;

  if (compact) {
    return (
      <View style={[styles.compactContainer, isUrgent && styles.compactUrgent]}>
        <Text style={[styles.compactText, isUrgent && styles.urgentText]}>
          ⏱️ {timeLeft.days > 0 && `${timeLeft.days}j `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUrgent && styles.containerUrgent]}>
      <Text style={[styles.label, isUrgent && styles.urgentLabel]}>⏰ Expire dans :</Text>
      <View style={styles.timeDisplay}>
        {timeLeft.days > 0 && (
          <View style={styles.timeUnit}>
            <Text style={[styles.timeValue, isUrgent && styles.urgentValue]}>{timeLeft.days}</Text>
            <Text style={[styles.timeLabel, isUrgent && styles.urgentLabel]}>j</Text>
          </View>
        )}
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, isUrgent && styles.urgentValue]}>{timeLeft.hours}</Text>
          <Text style={[styles.timeLabel, isUrgent && styles.urgentLabel]}>h</Text>
        </View>
        <Text style={[styles.separator, isUrgent && styles.urgentValue]}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, isUrgent && styles.urgentValue]}>{timeLeft.minutes}</Text>
          <Text style={[styles.timeLabel, isUrgent && styles.urgentLabel]}>m</Text>
        </View>
        <Text style={[styles.separator, isUrgent && styles.urgentValue]}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, isUrgent && styles.urgentValue]}>{timeLeft.seconds}</Text>
          <Text style={[styles.timeLabel, isUrgent && styles.urgentLabel]}>s</Text>
        </View>
      </View>
      {isUrgent && (
        <Text style={styles.urgentWarning}>🔴 Publication bientôt expirée !</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  containerUrgent: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  containerExpired: {
    backgroundColor: '#E5E7EB',
    padding: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  urgentLabel: {
    color: '#DC2626',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  separator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 4,
  },
  urgentValue: {
    color: '#DC2626',
  },
  urgentWarning: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
  },
  expiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  compactContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactUrgent: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  urgentText: {
    color: '#DC2626',
  },
});
