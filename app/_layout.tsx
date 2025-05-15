import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  useFrameworkReady();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    if (Platform.OS === 'web') {
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }

    try {
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      
      if (biometricEnabled === 'true') {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        
        if (compatible && hasFaceId) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to access the app',
            fallbackLabel: 'Use passcode',
          });
          
          setIsAuthenticated(result.success);
        } else {
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticated(true);
    } finally {
      setAuthChecked(true);
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}