import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  useColorScheme,
  TextInput,
  Platform,
  ActivityIndicator,
  Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, CreditCard as Edit2, Save, Clock, Eye, EyeOff, RefreshCw, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { clearCredentials, validateCredentials } from '@/services/api';
import { COLORS, STORAGE_KEYS, REFRESH_INTERVAL } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

export default function SettingsScreen() {
  const [tokenId, setTokenId] = useState('');
  const [sn, setSn] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(REFRESH_INTERVAL / 60000);
  const [showTokenId, setShowTokenId] = useState(false);
  const [showSn, setShowSn] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    if (Platform.OS === 'web') return;
    
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    
    setIsBiometricSupported(compatible && hasFaceId);
    
    // Load biometric preference
    const enabled = await AsyncStorage.getItem('biometricEnabled');
    setIsBiometricEnabled(enabled === 'true');
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable Face ID',
      });
      
      if (result.success) {
        await AsyncStorage.setItem('biometricEnabled', 'true');
        setIsBiometricEnabled(true);
      }
    } else {
      await AsyncStorage.setItem('biometricEnabled', 'false');
      setIsBiometricEnabled(false);
    }
  };
  
  const loadSettings = async () => {
    try {
      const savedTokenId = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_ID) || '';
      const savedSn = await AsyncStorage.getItem(STORAGE_KEYS.SN) || '';
      
      setTokenId(savedTokenId);
      setSn(savedSn);
      
      const savedAutoRefresh = await AsyncStorage.getItem('autoRefresh');
      if (savedAutoRefresh !== null) {
        setAutoRefresh(savedAutoRefresh === 'true');
      }
      
      const savedRefreshInterval = await AsyncStorage.getItem('refreshInterval');
      if (savedRefreshInterval !== null) {
        setRefreshInterval(Number(savedRefreshInterval));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (!confirm('Are you sure you want to log out? This will clear your saved credentials.')) {
        return;
      }
    } else {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out? This will clear your saved credentials.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Log Out', 
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
      return;
    }
    
    performLogout();
  };
  
  const performLogout = async () => {
    try {
      await clearCredentials();
      router.replace('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };
  
  const saveCredentials = async () => {
    if (!tokenId || !sn) {
      Alert.alert('Error', 'Both Token ID and SN are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isValid = await validateCredentials(tokenId, sn);
      
      if (isValid) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_ID, tokenId);
        await AsyncStorage.setItem(STORAGE_KEYS.SN, sn);
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Invalid credentials. Could not connect to the device.');
      }
    } catch (err) {
      console.error('Error saving credentials:', err);
      Alert.alert('Error', 'Could not validate credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAutoRefresh = (value: boolean) => {
    setAutoRefresh(value);
    AsyncStorage.setItem('autoRefresh', value.toString());
  };
  
  const updateRefreshInterval = async (value: number) => {
    if (value < 1) value = 1;
    if (value > 60) value = 60;
    
    setRefreshInterval(value);
    await AsyncStorage.setItem('refreshInterval', value.toString());
  };

  const maskText = (text: string) => {
    if (!text) return 'Not Set';
    return `${'•'.repeat(text.length - 8)}${text.slice(-4)}`;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connection</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Token ID</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={tokenId}
                  onChangeText={setTokenId}
                  placeholder="Enter your Token ID"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Serial Number (SN)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={sn}
                  onChangeText={setSn}
                  placeholder="Enter your device SN"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: colors.border }]} 
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: COLORS.success }]} 
                  onPress={saveCredentials}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Save size={16} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.credentialRow}>
                <Pressable 
                  style={styles.credentialContainer}
                  onPress={() => setShowTokenId(!showTokenId)}
                >
                  <View>
                    <Text style={[styles.credentialLabel, { color: colors.secondaryText }]}>Token ID</Text>
                    <Text style={[styles.credentialValue, { color: colors.text }]}>
                      {showTokenId ? tokenId : maskText(tokenId)}
                    </Text>
                  </View>
                  {tokenId && (
                    <View style={styles.eyeIconContainer}>
                      {showTokenId ? (
                        <EyeOff size={16} color={colors.secondaryText} />
                      ) : (
                        <Eye size={16} color={colors.secondaryText} />
                      )}
                    </View>
                  )}
                </Pressable>
                
                <TouchableOpacity 
                  style={[styles.editButton, { backgroundColor: `${COLORS.primary}20` }]} 
                  onPress={() => setIsEditing(true)}
                >
                  <Edit2 size={16} color={COLORS.primary} style={styles.buttonIcon} />
                  <Text style={{ color: COLORS.primary }}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <Pressable 
                style={styles.credentialRow}
                onPress={() => setShowSn(!showSn)}
              >
                <View style={styles.credentialContainer}>
                  <View>
                    <Text style={[styles.credentialLabel, { color: colors.secondaryText }]}>Serial Number</Text>
                    <Text style={[styles.credentialValue, { color: colors.text }]}>
                      {showSn ? sn : maskText(sn)}
                    </Text>
                  </View>
                  {sn && (
                    <View style={styles.eyeIconContainer}>
                      {showSn ? (
                        <EyeOff size={16} color={colors.secondaryText} />
                      ) : (
                        <Eye size={16} color={colors.secondaryText} />
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
              
              <TouchableOpacity 
                style={[styles.logoutButton, { borderColor: COLORS.error }]} 
                onPress={handleLogout}
              >
                <LogOut size={16} color={COLORS.error} style={styles.buttonIcon} />
                <Text style={{ color: COLORS.error }}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        
        {Platform.OS !== 'web' && isBiometricSupported && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Fingerprint size={20} color={colors.text} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Face ID Authentication</Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#767577', true: `${COLORS.primary}80` }}
                thumbColor={isBiometricEnabled ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>
        )}
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Refresh</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <RefreshCw size={20} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Refresh</Text>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={toggleAutoRefresh}
              trackColor={{ false: '#767577', true: `${COLORS.primary}80` }}
              thumbColor={autoRefresh ? COLORS.primary : '#f4f3f4'}
            />
          </View>
          
          {autoRefresh && (
            <View style={styles.intervalContainer}>
              <Text style={[styles.intervalLabel, { color: colors.text }]}>
                Refresh interval: {refreshInterval} {refreshInterval === 1 ? 'minute' : 'minutes'}
              </Text>
              <View style={styles.intervalControls}>
                <TouchableOpacity
                  style={[styles.intervalButton, { backgroundColor: colors.background }]}
                  onPress={() => updateRefreshInterval(refreshInterval - 1)}
                  disabled={refreshInterval <= 1}
                >
                  <Text style={[
                    styles.intervalButtonText, 
                    { color: refreshInterval <= 1 ? colors.secondaryText : colors.text }
                  ]}>-</Text>
                </TouchableOpacity>
                
                <Text style={[styles.intervalValue, { color: colors.text }]}>{refreshInterval}</Text>
                
                <TouchableOpacity
                  style={[styles.intervalButton, { backgroundColor: colors.background }]}
                  onPress={() => updateRefreshInterval(refreshInterval + 1)}
                  disabled={refreshInterval >= 60}
                >
                  <Text style={[
                    styles.intervalButtonText, 
                    { color: refreshInterval >= 60 ? colors.secondaryText : colors.text }
                  ]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aboutText, { color: colors.text }]}>
            SolaX Cloud Monitor v1.0.0
          </Text>
          <Text style={[styles.aboutSubtext, { color: colors.secondaryText }]}>
            Developed with Expo React Native
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  credentialContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  credentialLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  credentialValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIconContainer: {
    padding: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editForm: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  intervalContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  intervalLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  intervalValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  aboutSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});