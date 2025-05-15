import { STORAGE_KEYS, API_BASE_URL } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SolaxResponse {
  success: boolean;
  exception?: string;
  result?: any;
}

interface RealtimeData {
  inverterSN: string;
  sn: string;
  acpower: number;
  yieldtoday: number;
  yieldtotal: number;
  feedinpower: number;
  feedinenergy: number;
  consumeenergy: number;
  feedinpowerM2: number;
  soc: number;
  peps1: number;
  peps2: number;
  peps3: number;
  inverterType: number;
  inverterStatus: string;
  uploadTime: string;
  batPower: number;
  powerdc1: number;
  powerdc2: number;
  powerdc3?: number;
  powerdc4?: number;
}

/**
 * Validates user credentials by making a request to the SolaX API
 */
export async function validateCredentials(tokenId: string, sn: string): Promise<boolean> {
  try {
    const data = await fetchRealtimeData(tokenId, sn);
    return !!data; // Return true if data is valid
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

/**
 * Fetches realtime data from the SolaX API
 */
export async function fetchRealtimeData(
  tokenId?: string, 
  sn?: string
): Promise<RealtimeData | null> {
  // If no credentials provided, try to get from storage
  let tokenToUse = tokenId;
  let snToUse = sn;

  if (!tokenToUse || !snToUse) {
    tokenToUse = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_ID);
    snToUse = await AsyncStorage.getItem(STORAGE_KEYS.SN);
    
    if (!tokenToUse || !snToUse) {
      throw new Error('No credentials available');
    }
  }

  try {
    const url = `${API_BASE_URL}/getRealtimeInfo.do?tokenId=${tokenToUse}&sn=${snToUse}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data: SolaxResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.exception || 'Unknown API error');
    }
    
    return data.result;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

/**
 * Clears stored credentials
 */
export async function clearCredentials(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_ID);
    await AsyncStorage.removeItem(STORAGE_KEYS.SN);
  } catch (error) {
    console.error('Error clearing credentials:', error);
    throw error;
  }
}