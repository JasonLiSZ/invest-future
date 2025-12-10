

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import StockCard from './components/StockCard';
import styles from './styles';

interface OptionContract {
  id: string;
  symbol: string;
  strikePrice: string;
  expirationDate: string;
  premium: string;
  type: 'call' | 'put';
}

interface StockData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  contracts: OptionContract[];
  details: {
    fiveDayAvg: string;
    fiveDayLow: string;
    fiveDayHigh: string;
    thirtyDayAvg: string;
    thirtyDayLow: string;
    thirtyDayHigh: string;
    fiftyTwoWeekAvg: string;
    fiftyTwoWeekLow: string;
    fairValue: string;
  };
}

const FollowListScreen = () => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockList, setStockList] = useState<StockData[]>([
    {
      id: 'aapl',
      symbol: 'AAPL',
      name: '苹果公司',
      currentPrice: '$175.43',
      change: '+2.34',
      changePercent: '+1.35%',
      isUp: true,
      contracts: [
        {
          id: 'contract-1',
          symbol: 'AAPL 12/15/23 180.00 CALL',
          strikePrice: '$180.00',
          expirationDate: '2023-12-15',
          premium: '$3.45',
          type: 'call',
        },
        {
          id: 'contract-2',
          symbol: 'AAPL 12/15/23 170.00 PUT',
          strikePrice: '$170.00',
          expirationDate: '2023-12-15',
          premium: '$2.18',
          type: 'put',
        },
      ],
      details: {
        fiveDayAvg: '$173.21',
        fiveDayLow: '$170.89',
        fiveDayHigh: '$176.50',
        thirtyDayAvg: '$171.45',
        thirtyDayLow: '$168.23',
        thirtyDayHigh: '$178.90',
        fiftyTwoWeekAvg: '$165.78',
        fiftyTwoWeekLow: '$142.12',
        fairValue: '$174.25',
      },
    },
    {
      id: 'tsla',
      symbol: 'TSLA',
      name: '特斯拉',
      currentPrice: '$248.87',
      change: '-5.67',
      changePercent: '-2.23%',
      isUp: false,
      contracts: [
        {
          id: 'contract-3',
          symbol: 'TSLA 01/19/24 250.00 CALL',
          strikePrice: '$250.00',
          expirationDate: '2024-01-19',
          premium: '$12.34',
          type: 'call',
        },
      ],
      details: {
        fiveDayAvg: '$251.43',
        fiveDayLow: '$245.12',
        fiveDayHigh: '$258.90',
        thirtyDayAvg: '$242.67',
        thirtyDayLow: '$231.45',
        thirtyDayHigh: '$265.78',
        fiftyTwoWeekAvg: '$228.90',
        fiftyTwoWeekLow: '$108.10',
        fairValue: '$245.32',
      },
    },
  ]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const handleAddStockPress = useCallback(() => {
    router.push('/p-add_stock');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // 模拟刷新数据
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleDeleteStock = useCallback((stockId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这只股票及其所有期权合约吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setStockList(prevList => prevList.filter(stock => stock.id !== stockId));
          },
        },
      ]
    );
  }, []);

  const handleAddContract = useCallback((stockId: string) => {
    router.push(`/p-add_option_contract?stockId=${stockId}`);
  }, [router]);

  const handleDeleteContract = useCallback((contractId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个期权合约吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setStockList(prevList =>
              prevList.map(stock => ({
                ...stock,
                contracts: stock.contracts.filter(contract => contract.id !== contractId),
              }))
            );
          },
        },
      ]
    );
  }, []);

  const handleBookkeepContract = useCallback((contractId: string) => {
    router.push(`/p-add_edit_trade?contractId=${contractId}`);
  }, [router]);

  const handleRefreshStock = useCallback((stockId: string) => {
    // 模拟刷新单只股票数据
    setStockList(prevList =>
      prevList.map(stock =>
        stock.id === stockId ? { ...stock, isRefreshing: true } : stock
      )
    );
    
    setTimeout(() => {
      setStockList(prevList =>
        prevList.map(stock =>
          stock.id === stockId ? { ...stock, isRefreshing: false } : stock
        )
      );
    }, 1000);
  }, []);

  const renderStockCard = useCallback(({ item }: { item: StockData }) => (
    <StockCard
      stock={item}
      onDeleteStock={handleDeleteStock}
      onAddContract={handleAddContract}
      onDeleteContract={handleDeleteContract}
      onBookkeepContract={handleBookkeepContract}
      onRefreshStock={handleRefreshStock}
    />
  ), [handleDeleteStock, handleAddContract, handleDeleteContract, handleBookkeepContract, handleRefreshStock]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <FontAwesome6 name="chart-line" size={32} color="#86868B" />
      </View>
      <Text style={styles.emptyStateTitle}>暂无关注的股票</Text>
      <Text style={styles.emptyStateSubtitle}>添加您感兴趣的股票开始投资之旅</Text>
      <TouchableOpacity style={styles.addFirstStockButton} onPress={handleAddStockPress}>
        <FontAwesome6 name="plus" size={16} color="#FFFFFF" style={styles.addFirstStockIcon} />
        <Text style={styles.addFirstStockText}>添加第一只股票</Text>
      </TouchableOpacity>
    </View>
  ), [handleAddStockPress]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>关注列表</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStockPress}>
          <FontAwesome6 name="plus" size={14} color="#FFFFFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>添加股票</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <FlatList
        data={stockList}
        renderItem={renderStockCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default FollowListScreen;

