

import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface RiskIndicator {
  value: string;
  label: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskText: string;
}

const riskIndicators: RiskIndicator[] = [
  {
    value: '+0.45',
    label: 'Delta',
    riskLevel: 'medium',
    riskText: '中等风险',
  },
  {
    value: '+0.08',
    label: 'Gamma',
    riskLevel: 'low',
    riskText: '低风险',
  },
  {
    value: '-0.12',
    label: 'Theta',
    riskLevel: 'high',
    riskText: '高风险',
  },
  {
    value: '+0.23',
    label: 'Vega',
    riskLevel: 'medium',
    riskText: '中等风险',
  },
];

const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
  switch (riskLevel) {
    case 'low':
      return '#34C759';
    case 'medium':
      return '#FF9500';
    case 'high':
      return '#FF3B30';
    default:
      return '#86868B';
  }
};

const RiskIndicators: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>风险指标</Text>
      
      <View style={styles.indicatorsGrid}>
        {riskIndicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorCard}>
            <Text style={styles.indicatorValue}>{indicator.value}</Text>
            <Text style={styles.indicatorLabel}>{indicator.label}</Text>
            <Text style={[styles.riskText, { color: getRiskColor(indicator.riskLevel) }]}>
              {indicator.riskText}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.warningCard}>
        <View style={styles.warningContent}>
          <FontAwesome6 name="triangle-exclamation" size={14} color="#FF9500" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>风险提示</Text>
            <Text style={styles.warningDescription}>
              您有3个期权合约将在1周内到期，请关注市场变化。
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RiskIndicators;

