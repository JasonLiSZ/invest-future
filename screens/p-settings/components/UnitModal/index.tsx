

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

type CurrencyUnit = 'USD' | 'CNY' | 'HKD';

interface UnitModalProps {
  visible: boolean;
  currentUnit: CurrencyUnit;
  onClose: () => void;
  onConfirm: (unit: CurrencyUnit) => void;
}

const unitOptions = [
  { value: 'USD' as CurrencyUnit, label: '美元', symbol: '$' },
  { value: 'CNY' as CurrencyUnit, label: '人民币', symbol: '¥' },
  { value: 'HKD' as CurrencyUnit, label: '港币', symbol: 'HK$' },
];

const UnitModal: React.FC<UnitModalProps> = ({
  visible,
  currentUnit,
  onClose,
  onConfirm,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<CurrencyUnit>(currentUnit);

  useEffect(() => {
    if (visible) {
      setSelectedUnit(currentUnit);
    }
  }, [visible, currentUnit]);

  const handleOptionPress = (unit: CurrencyUnit) => {
    setSelectedUnit(unit);
  };

  const handleConfirm = () => {
    onConfirm(selectedUnit);
  };

  const handleCancel = () => {
    setSelectedUnit(currentUnit);
    onClose();
  };

  const handleBackdropPress = () => {
    setSelectedUnit(currentUnit);
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
              <Text style={styles.title}>选择单位</Text>
              
              <View style={styles.optionsContainer}>
                {unitOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      selectedUnit === option.value && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionPress(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          selectedUnit === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.optionSymbol,
                          selectedUnit === option.value && styles.selectedOptionSymbol,
                        ]}
                      >
                        {option.symbol}
                      </Text>
                    </View>
                    {selectedUnit === option.value && (
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

export default UnitModal;

