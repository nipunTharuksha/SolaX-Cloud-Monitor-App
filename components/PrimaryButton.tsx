import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  View 
} from 'react-native';
import { COLORS } from '@/constants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  style?: object;
}

export default function PrimaryButton({ 
  title, 
  onPress, 
  disabled = false, 
  isLoading = false,
  style = {}
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : {},
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#FDA974',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});