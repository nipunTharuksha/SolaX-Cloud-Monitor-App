import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun } from 'lucide-react-native';
import { validateCredentials } from '@/services/api';
import { STORAGE_KEYS } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

export default function WelcomeScreen() {
  const [tokenId, setTokenId] = useState('');
  const [sn, setSn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    checkForSavedCredentials();
  }, []);

  const checkForSavedCredentials = async () => {
    try {
      const savedTokenId = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_ID);
      const savedSn = await AsyncStorage.getItem(STORAGE_KEYS.SN);
      
      if (savedTokenId && savedSn) {
        setTokenId(savedTokenId);
        setSn(savedSn);
        
        // Auto connect if we have saved credentials
        handleConnect(savedTokenId, savedSn);
      }
    } catch (err) {
      console.error('Error retrieving saved credentials:', err);
    } finally {
      setIsCheckingStorage(false);
    }
  };

  const handleConnect = async (tokenToUse = tokenId, snToUse = sn) => {
    if (!tokenToUse || !snToUse) {
      setError('Please enter both Token ID and SN');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const isValid = await validateCredentials(tokenToUse, snToUse);
      
      if (isValid) {
        // Save credentials to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_ID, tokenToUse);
        await AsyncStorage.setItem(STORAGE_KEYS.SN, snToUse);
        
        // Navigate to dashboard
        router.replace('/(tabs)/');
      } else {
        setError('Invalid credentials or device offline. Please check and try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection and try again.');
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStorage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Sun color="#F97316" size={60} />
            <Text style={styles.appTitle}>SolaX Cloud Monitor</Text>
            <Text style={styles.subtitle}>View real-time solar inverter data</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Connect to your inverter</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Token ID</Text>
              <TextInput
                style={styles.input}
                value={tokenId}
                onChangeText={setTokenId}
                placeholder="Enter your Token ID"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Serial Number (SN)</Text>
              <TextInput
                style={styles.input}
                value={sn}
                onChangeText={setSn}
                placeholder="Enter your device SN"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton 
              title={isLoading ? "Connecting..." : "Connect"}
              onPress={() => handleConnect()}
              disabled={isLoading || !tokenId || !sn}
              isLoading={isLoading}
            />

            <Text style={styles.helpText}>
              You can find your Token ID and SN in your SolaX Cloud account or on your communication module.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#18181B',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717A',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#18181B',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#3F3F46',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#18181B',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  helpText: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#71717A',
  },
});