

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

type RefreshFrequency = 'manual' | '5' | '10' | '15';

interface RefreshModalProps {
  visible: boolean;
  currentFrequency: RefreshFrequency;
  onClose: () => void;
  onConfirm: (frequency: RefreshFrequency) => void;
}

const refreshOptions = [
  { value: 'manual' as RefreshFrequency, label: '手动刷新' },
  { value: '5' as RefreshFrequency, label: '每5分钟' },
  { value: '10' as RefreshFrequency, label: '每10分钟' },
  { value: '15' as RefreshFrequency, label: '每15分钟' },
];

const RefreshModal: React.FC<RefreshModalProps> = ({
  visible,
  currentFrequency,
  onClose,
  onConfirm,
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState<RefreshFrequency>(currentFrequency);

  useEffect(() => {
    if (visible) {
      setSelectedFrequency(currentFrequency);
    }
  }, [visible, currentFrequency]);

  const handleOptionPress = (frequency: RefreshFrequency) => {
    setSelectedFrequency(frequency);
  };

  const handleConfirm = () => {
    onConfirm(selectedFrequency);
  };

  const handleCancel = () => {
    setSelectedFrequency(currentFrequency);
    onClose();
  };

  const handleBackdropPress = () => {
    setSelectedFrequency(currentFrequency);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>选择刷新频率</Text>
              
              <View style={styles.optionsContainer}>
                {refreshOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      selectedFrequency === option.value && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionPress(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedFrequency === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedFrequency === option.value && (
                      <FontAwesome6 name="check" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>确认</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RefreshModal;

