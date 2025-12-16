import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
// @ts-ignore
import styles from './styles';

export type DateRangeType = 'this_month' | 'last_1_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all' | 'custom';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateFilterProps {
  selectedRange: DateRangeType;
  customRange: DateRange;
  onRangeChange: (range: DateRangeType, customRange?: DateRange) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ selectedRange, customRange, onRangeChange }) => {
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  const quickOptions: { label: string; value: DateRangeType }[] = [
    { label: '本月', value: 'this_month' },
    { label: '近1月', value: 'last_1_month' },
    { label: '近3月', value: 'last_3_months' },
    { label: '近6月', value: 'last_6_months' },
    { label: '本年', value: 'this_year' },
    { label: '全部', value: 'all' },
  ];

  const handleQuickOptionPress = (value: DateRangeType) => {
    onRangeChange(value);
  };

  const handleCustomPress = () => {
    setIsCustomModalVisible(true);
    if (customRange.startDate && customRange.endDate) {
      // 已有自定义日期，使用已有的
      setStartDateInput(formatDateForInput(customRange.startDate));
      setEndDateInput(formatDateForInput(customRange.endDate));
    } else {
      // 首次打开，默认为本月1号到今天
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDateInput(formatDateForInput(firstDayOfMonth));
      setEndDateInput(formatDateForInput(today));
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateStr: string): Date | null => {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }
    return date;
  };

  const handleCustomConfirm = () => {
    const startDate = parseDate(startDateInput);
    const endDate = parseDate(endDateInput);

    if (!startDate || !endDate) {
      Alert.alert('日期格式错误', '请使用 YYYY-MM-DD 格式输入日期');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('日期错误', '开始日期不能晚于结束日期');
      return;
    }

    onRangeChange('custom', { startDate, endDate });
    setIsCustomModalVisible(false);
  };

  const getActiveLabel = () => {
    if (selectedRange === 'custom') {
      if (customRange.startDate && customRange.endDate) {
        return `${formatDateForInput(customRange.startDate)} 至 ${formatDateForInput(customRange.endDate)}`;
      }
      return '自定义';
    }
    return quickOptions.find(opt => opt.value === selectedRange)?.label || '全部';
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {quickOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selectedRange === option.value && styles.optionActive,
              ]}
              onPress={() => handleQuickOptionPress(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedRange === option.value && styles.optionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.option,
              styles.customOption,
              selectedRange === 'custom' && styles.optionActive,
            ]}
            onPress={handleCustomPress}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="calendar-days" size={14} color={selectedRange === 'custom' ? '#007AFF' : '#86868B'} />
            <Text
              style={[
                styles.optionText,
                selectedRange === 'custom' && styles.optionTextActive,
              ]}
            >
              自定义
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal
        visible={isCustomModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择日期范围</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>开始日期</Text>
              <TextInput
                style={styles.input}
                value={startDateInput}
                onChangeText={setStartDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#86868B"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>结束日期</Text>
              <TextInput
                style={styles.input}
                value={endDateInput}
                onChangeText={setEndDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#86868B"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCustomModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCustomConfirm}
              >
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DateFilter;
