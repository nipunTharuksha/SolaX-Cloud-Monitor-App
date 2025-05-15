import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  Pressable,
  Platform
} from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';
import { COLORS } from '@/constants';

interface InfoTooltipProps {
  text: string;
  colors: any;
}

export default function InfoTooltip({ text, colors }: InfoTooltipProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <HelpCircle size={16} color={colors.secondaryText} />
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: colors.background }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Information
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalText, { color: colors.text }]}>
              {text}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
  },
});