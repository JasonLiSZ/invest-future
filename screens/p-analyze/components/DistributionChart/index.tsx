

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import styles from './styles';

const DistributionChart: React.FC = () => {
  // 饼图数据
  const callPercentage = 78.7;
  const putPercentage = 21.3;
  const radius = 50;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  const callStrokeDasharray = `${(callPercentage / 100) * circumference} ${circumference}`;
  const putStrokeDasharray = `${(putPercentage / 100) * circumference} ${circumference}`;
  const putStrokeDashoffset = -((callPercentage / 100) * circumference);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>盈亏分布</Text>
      <View style={styles.chartContainer}>
        {/* 饼图 */}
        <View style={styles.pieChartWrapper}>
          <Svg width="128" height="128" viewBox="0 0 120 120">
            {/* 背景圆环 */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#E5E5EA"
              strokeWidth={strokeWidth}
            />
            
            {/* 看涨期权部分 */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#34C759"
              strokeWidth={strokeWidth}
              strokeDasharray={callStrokeDasharray}
              strokeDashoffset="0"
              transform="rotate(-90 60 60)"
            />
            
            {/* 看跌期权部分 */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#FF3B30"
              strokeWidth={strokeWidth}
              strokeDasharray={putStrokeDasharray}
              strokeDashoffset={putStrokeDashoffset}
              transform="rotate(-90 60 60)"
            />
          </Svg>
        </View>
        
        {/* 图例 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendRow}>
              <View style={styles.legendLabel}>
                <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
                <Text style={styles.legendText}>看涨期权</Text>
              </View>
              <View style={styles.legendValue}>
                <Text style={styles.profitAmount}>+$1,845.67</Text>
                <Text style={styles.percentage}>{callPercentage}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.legendItem}>
            <View style={styles.legendRow}>
              <View style={styles.legendLabel}>
                <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
                <Text style={styles.legendText}>看跌期权</Text>
              </View>
              <View style={styles.legendValue}>
                <Text style={styles.profitAmount}>+$500.00</Text>
                <Text style={styles.percentage}>{putPercentage}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>总计</Text>
            <Text style={styles.totalAmount}>+$2,345.67</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DistributionChart;

