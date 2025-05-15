import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants';
import InfoTooltip from './InfoTooltip';

interface DataCardProps {
  title: string;
  value: number;
  unit: string;
  icon?: React.ReactNode;
  info?: string;
  colors: any;
}

export default function DataCard({ 
  title, 
  value, 
  unit, 
  icon, 
  info,
  colors 
}: DataCardProps) {
  // Format value based on range
  const formattedValue = () => {
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(2); // Convert to K for large values
    } else {
      return value.toFixed(1);
    }
  };
  
  // Adjust unit for formatted values
  const displayUnit = () => {
    if (Math.abs(value) >= 1000 && unit === 'W') {
      return 'kW';
    } else {
      return unit;
    }
  };
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.card, 
        borderColor: colors.border
      }
    ]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {info && <InfoTooltip text={info} colors={colors} />}
      </View>
      
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: colors.text }]}>
            {formattedValue()}
          </Text>
          <Text style={[styles.unit, { color: colors.secondaryText }]}>
            {displayUnit()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginLeft: 4,
  },
});