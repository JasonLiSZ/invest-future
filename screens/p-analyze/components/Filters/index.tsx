

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import BottomSheetPicker from '../BottomSheetPicker';
import styles from './styles';

interface FilterOptions {
  contractType: 'all' | 'call' | 'put';
  direction: 'all' | 'buy' | 'sell';
}

interface FiltersProps {
  isExpanded: boolean;
  onToggle: () => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const contractTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '看涨期权', value: 'call' },
  { label: '看跌期权', value: 'put' },
];

const directionOptions = [
  { label: '全部', value: 'all' },
  { label: '买入', value: 'buy' },
  { label: '卖出', value: 'sell' },
];

const Filters: React.FC<FiltersProps> = ({
  isExpanded,
  onToggle,
  filterOptions,
  onFilterChange,
}) => {
  const [isContractTypePickerVisible, setIsContractTypePickerVisible] = React.useState(false);
  const [isDirectionPickerVisible, setIsDirectionPickerVisible] = React.useState(false);

  const handleContractTypeChange = (value: 'all' | 'call' | 'put') => {
    onFilterChange({ ...filterOptions, contractType: value });
    setIsContractTypePickerVisible(false);
  };

  const handleDirectionChange = (value: 'all' | 'buy' | 'sell') => {
    onFilterChange({ ...filterOptions, direction: value });
    setIsDirectionPickerVisible(false);
  };

  const getContractTypeLabel = () => {
    return contractTypeOptions.find(option => option.value === filterOptions.contractType)?.label || '全部';
  };

  const getDirectionLabel = () => {
    return directionOptions.find(option => option.value === filterOptions.direction)?.label || '全部';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>筛选条件</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <FontAwesome6 
            name={isExpanded ? 'chevron-up' : 'filter'} 
            size={12} 
            color="#007AFF" 
          />
          <Text style={styles.toggleText}>
            {isExpanded ? '收起' : '展开'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isExpanded && (
        <View style={styles.filterContent}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>合约类型</Text>
            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setIsContractTypePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterSelectorText}>{getContractTypeLabel()}</Text>
              <FontAwesome6 name="chevron-down" size={12} color="#86868B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>交易方向</Text>
            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setIsDirectionPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterSelectorText}>{getDirectionLabel()}</Text>
              <FontAwesome6 name="chevron-down" size={12} color="#86868B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 合约类型选择器 */}
      <BottomSheetPicker
        isVisible={isContractTypePickerVisible}
        title="选择合约类型"
        options={contractTypeOptions}
        selectedValue={filterOptions.contractType}
        onSelect={handleContractTypeChange}
        onClose={() => setIsContractTypePickerVisible(false)}
      />

      {/* 交易方向选择器 */}
      <BottomSheetPicker
        isVisible={isDirectionPickerVisible}
        title="选择交易方向"
        options={directionOptions}
        selectedValue={filterOptions.direction}
        onSelect={handleDirectionChange}
        onClose={() => setIsDirectionPickerVisible(false)}
      />
    </View>
  );
};

export default Filters;

