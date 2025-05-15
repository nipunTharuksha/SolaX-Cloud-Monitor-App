import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { COLORS } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

export default function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    if (Platform.OS === 'web') {
      router.replace('/(tabs)');
      return;
    }

    try {
      setIsAuthenticating(true);
      setError(null);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access the app',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Fingerprint size={64} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>
          Please authenticate using Face ID to access the app
        </Text>
        
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}
        
        <PrimaryButton
          title="Authenticate"
          onPress={authenticate}
          isLoading={isAuthenticating}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#71717A',
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});