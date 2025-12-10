

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, G, Line, Path, Text as SvgText } from 'react-native-svg';
import styles from './styles';

type ChartType = 'line' | 'bar';

interface TrendChartProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

const TrendChart: React.FC<TrendChartProps> = ({
  chartType,
  onChartTypeChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>盈亏趋势</Text>
        <View style={styles.chartTypeSelector}>
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              chartType === 'line' ? styles.chartTypeButtonActive : styles.chartTypeButtonInactive,
            ]}
            onPress={() => onChartTypeChange('line')}
            activeOpacity={0.7}
          >
            <FontAwesome6 
              name="chart-line" 
              size={12} 
              color={chartType === 'line' ? '#FFFFFF' : '#86868B'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              chartType === 'bar' ? styles.chartTypeButtonActive : styles.chartTypeButtonInactive,
            ]}
            onPress={() => onChartTypeChange('bar')}
            activeOpacity={0.7}
          >
            <FontAwesome6 
              name="chart-column" 
              size={12} 
              color={chartType === 'bar' ? '#FFFFFF' : '#86868B'} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width="100%" height="192" viewBox="0 0 400 200">
          <Defs>
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#007AFF" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* 网格线 */}
          <G stroke="#E5E5EA" strokeWidth="1" opacity="0.5">
            <Line x1="50" y1="40" x2="350" y2="40" />
            <Line x1="50" y1="80" x2="350" y2="80" />
            <Line x1="50" y1="120" x2="350" y2="120" />
            <Line x1="50" y1="160" x2="350" y2="160" />
          </G>
          
          {/* 趋势线 */}
          <Path
            d="M50,120 Q100,80 150,100 T250,60 Q300,40 350,50"
            stroke="#007AFF"
            strokeWidth="2"
            fill="none"
          />
          
          {/* 填充区域 */}
          <Path
            d="M50,120 Q100,80 150,100 T250,60 Q300,40 350,50 L350,200 L50,200 Z"
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          {/* Y轴标签 */}
          <SvgText x="30" y="45" fontSize="12" fill="#86868B" textAnchor="end">
            +3000
          </SvgText>
          <SvgText x="30" y="85" fontSize="12" fill="#86868B" textAnchor="end">
            +2000
          </SvgText>
          <SvgText x="30" y="125" fontSize="12" fill="#86868B" textAnchor="end">
            +1000
          </SvgText>
          <SvgText x="30" y="165" fontSize="12" fill="#86868B" textAnchor="end">
            0
          </SvgText>
          
          {/* X轴标签 */}
          <SvgText x="50" y="190" fontSize="12" fill="#86868B" textAnchor="middle">
            12-01
          </SvgText>
          <SvgText x="125" y="190" fontSize="12" fill="#86868B" textAnchor="middle">
            12-08
          </SvgText>
          <SvgText x="200" y="190" fontSize="12" fill="#86868B" textAnchor="middle">
            12-15
          </SvgText>
          <SvgText x="275" y="190" fontSize="12" fill="#86868B" textAnchor="middle">
            12-22
          </SvgText>
          <SvgText x="350" y="190" fontSize="12" fill="#86868B" textAnchor="middle">
            12-29
          </SvgText>
        </Svg>
      </View>
    </View>
  );
};

export default TrendChart;

