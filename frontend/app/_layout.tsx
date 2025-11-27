import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { useNotificationPolling } from '../src/hooks/useNotificationPolling';
import api from '../src/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { setUser, setToken, isLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  // Enable notification polling
  useNotificationPolling();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        await setToken(token);
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      await setToken(null);
    } finally {
      setInitializing(false);
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="service-details" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="create-service" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="user-profile" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}
