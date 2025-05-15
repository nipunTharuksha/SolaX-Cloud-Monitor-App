import { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  useColorScheme,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Sun, Battery, Zap, Plug } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchRealtimeData } from '@/services/api';
import { COLORS, UNITS, INVERTER_STATUS, REFRESH_INTERVAL, STORAGE_KEYS } from '@/constants';
import DataCard from '@/components/DataCard';
import InfoTooltip from '@/components/InfoTooltip';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({ tokenId: '', sn: '' });
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Get colors based on theme
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      
      // Set up auto-refresh
      const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
      
      return () => clearInterval(intervalId);
    }, [])
  );
  
  // Load credentials on mount
  useEffect(() => {
    async function loadCredentials() {
      try {
        const tokenId = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_ID) || '';
        const sn = await AsyncStorage.getItem(STORAGE_KEYS.SN) || '';
        setDeviceInfo({ tokenId, sn });
      } catch (err) {
        console.error('Error loading credentials:', err);
      }
    }
    
    loadCredentials();
  }, []);
  
  const fetchData = async () => {
    try {
      setError(null);
      if (!refreshing) setIsLoading(true);
      
      const result = await fetchRealtimeData();
      
      if (result) {
        setData(result);
        setLastUpdated(new Date());
      } else {
        setError('Unable to fetch data. Please check your connection.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error connecting to SolaX Cloud. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  if (isLoading && !data) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Loading data...
        </Text>
      </View>
    );
  }
  
  const getStatusInfo = () => {
    if (!data) return { label: 'Unknown', color: COLORS.warning };
    
    const status = INVERTER_STATUS[data.inverterStatus as keyof typeof INVERTER_STATUS] || 'Unknown';
    
    // Determine status color
    let color = COLORS.warning;
    if (status === 'Normal Mode') {
      color = COLORS.success;
    } else if (status.includes('Fault')) {
      color = COLORS.error;
    } else if (status.includes('EPS') || status.includes('Check')) {
      color = COLORS.info;
    }
    
    return { label: status, color };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Solar Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              {deviceInfo.sn ? `SN: ${deviceInfo.sn}` : 'Inverter Data'}
            </Text>
          </View>
          
          <StatusBadge label={statusInfo.label} color={statusInfo.color} />
        </View>
        
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.errorText, { color: COLORS.error }]}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.cardsContainer}>
          {/* Power Generation Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Power Generation
          </Text>
          
          <View style={styles.cardRow}>
            <DataCard
              icon={<Sun size={24} color={COLORS.accent} />}
              title="AC Power"
              value={data?.acpower || 0}
              unit={UNITS.POWER}
              info="Current AC power output from the inverter"
              colors={colors}
            />
            
            <DataCard
              icon={<Zap size={24} color={COLORS.primary} />}
              title="PV Power (DC1)"
              value={data?.powerdc1 || 0}
              unit={UNITS.POWER}
              info="Current DC power from solar panels on input 1"
              colors={colors}
            />
          </View>
          
          <View style={styles.cardRow}>
            <DataCard
              title="Energy Today"
              value={data?.yieldtoday || 0}
              unit={UNITS.ENERGY}
              info="Total energy generated today"
              colors={colors}
            />
            
            <DataCard
              title="Total Energy"
              value={data?.yieldtotal || 0}
              unit={UNITS.ENERGY}
              info="Total lifetime energy generated"
              colors={colors}
            />
          </View>
          
          {/* Grid Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Grid & Consumption
          </Text>
          
          <View style={styles.cardRow}>
            <DataCard
              icon={<Plug size={24} color={COLORS.info} />}
              title="Feed-in Power"
              value={data?.feedinpower || 0}
              unit={UNITS.POWER}
              info="Current power being exported to the grid"
              colors={colors}
            />
            
            <DataCard
              title="Feed-in Energy"
              value={data?.feedinenergy || 0}
              unit={UNITS.ENERGY}
              info="Total energy exported to the grid"
              colors={colors}
            />
          </View>
          
          <View style={styles.cardRow}>
            <DataCard
              title="Energy Consumed"
              value={data?.consumeenergy || 0}
              unit={UNITS.ENERGY}
              info="Total energy consumed by your home"
              colors={colors}
            />
          </View>
          
          {/* Battery Section, only if available */}
          {data?.batPower !== undefined && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Battery
              </Text>
              
              <View style={styles.cardRow}>
                <DataCard
                  icon={<Battery size={24} color={COLORS.secondary} />}
                  title="Battery Power"
                  value={data?.batPower || 0}
                  unit={UNITS.POWER}
                  info="Current battery power (positive = charging, negative = discharging)"
                  colors={colors}
                />
                
                {data?.soc !== undefined && (
                  <DataCard
                    title="Battery SOC"
                    value={data?.soc || 0}
                    unit={UNITS.PERCENTAGE}
                    info="Current battery state of charge"
                    colors={colors}
                  />
                )}
              </View>
            </>
          )}
        </View>
        
        {lastUpdated && (
          <Text style={[styles.updatedText, { color: colors.secondaryText }]}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  cardsContainer: {
    marginTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  updatedText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
  },
});