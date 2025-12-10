

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

type DateRangeType = 'today' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year' | 'custom';

interface DateSelectorProps {
  selectedRange: DateRangeType;
  onRangeChange: (range: DateRangeType) => void;
  onCustomDatePress: () => void;
  customDateText: string;
}

const dateRangeOptions = [
  { key: 'today' as DateRangeType, label: '今天' },
  { key: 'week' as DateRangeType, label: '近1周' },
  { key: 'month' as DateRangeType, label: '近1月' },
  { key: 'quarter' as DateRangeType, label: '近3月' },
  { key: 'halfyear' as DateRangeType, label: '近6月' },
  { key: 'year' as DateRangeType, label: '本年' },
];

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedRange,
  onRangeChange,
  onCustomDatePress,
  customDateText,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>时间范围</Text>
        <TouchableOpacity
          style={styles.customDateButton}
          onPress={onCustomDatePress}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="calendar-days" size={12} color="#007AFF" />
          <Text style={styles.customDateText}>{customDateText}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dateRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.dateButton,
              selectedRange === option.key ? styles.dateButtonActive : styles.dateButtonInactive,
            ]}
            onPress={() => onRangeChange(option.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dateButtonText,
                selectedRange === option.key ? styles.dateButtonTextActive : styles.dateButtonTextInactive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default DateSelector;

