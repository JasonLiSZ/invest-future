

import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

interface ProfitOverviewProps {
  totalPnl: number;
  totalPnlPercent: number;
}

const ProfitOverview: React.FC<ProfitOverviewProps> = ({ totalPnl, totalPnlPercent }) => {
  const formatSignedCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${value.toFixed(2)}`;
  };

  const formatSignedPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const isPositive = totalPnl >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>总盈亏概览</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.profitAmount, { color: isPositive ? '#FF3B30' : '#34C759' }]}>
            {formatSignedCurrency(totalPnl)}
          </Text>
          <Text style={styles.statLabel}>总盈亏</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.profitPercentage, { color: isPositive ? '#FF3B30' : '#34C759' }]}>
            {formatSignedPercent(totalPnlPercent)}
          </Text>
          <Text style={styles.statLabel}>盈亏比例</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfitOverview;

