

import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const ProfitOverview: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>总盈亏概览</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.profitAmount}>+$2,345.67</Text>
          <Text style={styles.statLabel}>总盈亏</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.profitPercentage}>+12.34%</Text>
          <Text style={styles.statLabel}>盈亏比例</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfitOverview;

