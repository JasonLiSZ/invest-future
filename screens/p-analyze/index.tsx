

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, G, Line, Path, Text as SvgText, Circle } from 'react-native-svg';
import styles from './styles';
import DateSelector from './components/DateSelector';
import ProfitOverview from './components/ProfitOverview';
import TrendChart from './components/TrendChart';
import Filters from './components/Filters';
import DistributionChart from './components/DistributionChart';
import RiskIndicators from './components/RiskIndicators';
import CustomDateModal from './components/CustomDateModal';

type DateRangeType = 'today' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year' | 'custom';
type ChartType = 'line' | 'bar';

interface FilterOptions {
  contractType: 'all' | 'call' | 'put';
  direction: 'all' | 'buy' | 'sell';
}

const AnalyzeScreen: React.FC = () => {
  const router = useRouter();
  
  // 状态管理
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    contractType: 'all',
    direction: 'all',
  });

  // 事件处理函数
  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 模拟数据刷新
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 这里可以添加实际的数据获取逻辑
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleDateRangeChange = useCallback((range: DateRangeType) => {
    setSelectedDateRange(range);
    // 这里可以添加数据更新逻辑
  }, []);

  const handleCustomDateConfirm = useCallback((startDate: string, endDate: string) => {
    setCustomDateRange({ startDate, endDate });
    setSelectedDateRange('custom');
    setIsCustomDateModalVisible(false);
    // 这里可以添加数据更新逻辑
  }, []);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
    // 这里可以添加图表类型切换逻辑
  }, []);

  const handleFilterToggle = useCallback(() => {
    setIsFilterExpanded(!isFilterExpanded);
  }, [isFilterExpanded]);

  const handleFilterChange = useCallback((filters: FilterOptions) => {
    setFilterOptions(filters);
    // 这里可以添加数据更新逻辑
  }, []);

  const getCustomDateDisplayText = useCallback(() => {
    if (customDateRange.startDate && customDateRange.endDate) {
      return `${customDateRange.startDate} - ${customDateRange.endDate}`;
    }
    return '自定义';
  }, [customDateRange]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>分析</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <FontAwesome6 
            name="arrows-rotate" 
            size={16} 
            color="#1D1D1F"
            style={isRefreshing ? styles.refreshIcon : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 日期选择栏 */}
        <DateSelector
          selectedRange={selectedDateRange}
          onRangeChange={handleDateRangeChange}
          onCustomDatePress={() => setIsCustomDateModalVisible(true)}
          customDateText={getCustomDateDisplayText()}
        />

        {/* 总盈亏概览 */}
        <ProfitOverview />

        {/* 总盈亏趋势图 */}
        <TrendChart
          chartType={chartType}
          onChartTypeChange={handleChartTypeChange}
        />

        {/* 筛选器 */}
        <Filters
          isExpanded={isFilterExpanded}
          onToggle={handleFilterToggle}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />

        {/* 盈亏分布图 */}
        <DistributionChart />

        {/* 风险指标展示 */}
        <RiskIndicators />
      </ScrollView>

      {/* 自定义日期选择器模态框 */}
      <CustomDateModal
        isVisible={isCustomDateModalVisible}
        onClose={() => setIsCustomDateModalVisible(false)}
        onConfirm={handleCustomDateConfirm}
        initialStartDate={customDateRange.startDate}
        initialEndDate={customDateRange.endDate}
      />
    </SafeAreaView>
  );
};

export default AnalyzeScreen;

