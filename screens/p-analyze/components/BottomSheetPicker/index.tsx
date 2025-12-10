

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface PickerOption {
  label: string;
  value: string;
}

interface BottomSheetPickerProps<T extends string> {
  isVisible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

const BottomSheetPicker = <T extends string>({
  isVisible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: BottomSheetPickerProps<T>) => {
  const renderPickerOption = ({ item }: { item: PickerOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === selectedValue && styles.optionItemSelected,
      ]}
      onPress={() => onSelect(item.value as T)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionText,
          item.value === selectedValue && styles.optionTextSelected,
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <FontAwesome6 name="check" size={16} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <FontAwesome6 name="xmark" size={18} color="#86868B" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                renderItem={renderPickerOption}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheetPicker;

