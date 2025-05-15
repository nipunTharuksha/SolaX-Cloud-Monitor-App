// Storage Keys
export const STORAGE_KEYS = {
  TOKEN_ID: 'solax_token_id',
  SN: 'solax_sn',
};

// API
export const API_BASE_URL = 'https://www.solaxcloud.com/proxyApp/proxy/api';

// Inverter Status Codes
export const INVERTER_STATUS = {
  '100': 'Wait Mode',
  '101': 'Check Mode',
  '102': 'Normal Mode',
  '103': 'Fault Mode',
  '104': 'Permanent Fault Mode',
  '105': 'Update Mode',
  '106': 'EPS Check Mode',
  '107': 'EPS Mode',
  '108': 'Self-Test Mode',
  '109': 'Idle Mode',
  '110': 'Standby Mode',
  '111': 'Pv Wake Up Bat Mode',
  '112': 'Gen Check Mode',
  '113': 'Gen Run Mode',
};

// Units for data display
export const UNITS = {
  POWER: 'W',
  ENERGY: 'kWh',
  PERCENTAGE: '%',
  TEMPERATURE: '°C',
  VOLTAGE: 'V',
  CURRENT: 'A',
  FREQUENCY: 'Hz',
};

// Data refresh interval in milliseconds (default: 1 minute)
export const REFRESH_INTERVAL = 60000;

// Colors
export const COLORS = {
  primary: '#22C55E', // Green-500
  secondary: '#059669', // Green-600
  accent: '#16A34A', // Green-600
  success: '#15803D', // Green-700
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue
  
  // Neutrals
  dark: {
    background: '#18181B',
    card: '#27272A',
    text: '#FAFAFA',
    secondaryText: '#A1A1AA',
    border: '#3F3F46',
  },
  light: {
    background: '#FFFFFF',
    card: '#F0FDF4', // Green-50
    text: '#18181B',
    secondaryText: '#71717A',
    border: '#DCFCE7', // Green-100
  },
};