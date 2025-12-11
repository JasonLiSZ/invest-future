

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StockCard from './components/StockCard';
import { fetchStockDetails, fetchStockPrice } from '../../services/stockApi';
import styles from './styles';

interface OptionContract {
  id: string;
  symbol: string;
  strikePrice: string;
  expirationDate: string;
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

const FOLLOW_LIST_KEY = 'followList';
const defaultStockList: StockData[] = [
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
];

const FollowListScreen = () => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockList, setStockList] = useState<StockData[]>(defaultStockList);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    type: 'stock' | 'contract';
    stockId?: string;
    contractId?: string;
  }>({ visible: false, type: 'stock' });

  const persistList = useCallback((list: StockData[]) => {
    AsyncStorage.setItem(FOLLOW_LIST_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const loadFollowList = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FOLLOW_LIST_KEY);
      if (stored) {
        setStockList(JSON.parse(stored));
      } else {
        persistList(defaultStockList);
        setStockList(defaultStockList);
      }
    } catch (e) {
      setStockList(defaultStockList);
    }
  }, [persistList]);

  useFocusEffect(
    useCallback(() => {
      loadFollowList();
    }, [loadFollowList])
  );

  const updateStockList = useCallback((updater: (prev: StockData[]) => StockData[]) => {
    setStockList(prev => {
      const next = updater(prev);
      persistList(next);
      return next;
    });
  }, [persistList]);

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
    setConfirmDialog({ visible: true, type: 'stock', stockId });
  }, []);

  const handleAddContract = useCallback((stockId: string) => {
    router.push(`/p-add_option_contract?stockId=${stockId}`);
  }, [router]);

  const handleDeleteContract = useCallback((contractId: string) => {
    setConfirmDialog({ visible: true, type: 'contract', contractId });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDialog.visible) return;

    if (confirmDialog.type === 'stock' && confirmDialog.stockId) {
      updateStockList(prevList => prevList.filter(stock => stock.id !== confirmDialog.stockId));
    } else if (confirmDialog.type === 'contract' && confirmDialog.contractId) {
      updateStockList(prevList =>
        prevList.map(stock => ({
          ...stock,
          contracts: stock.contracts.filter(contract => contract.id !== confirmDialog.contractId),
        }))
      );
    }

    setConfirmDialog({ visible: false, type: 'stock' });
  }, [confirmDialog, updateStockList]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDialog({ visible: false, type: 'stock' });
  }, []);

  const handleBookkeepContract = useCallback((contractId: string) => {
    // 簿记期权合约交易
    router.push(`/p-add_edit_trade?contractId=${contractId}`);
  }, [router]);

  const handleEditContract = useCallback((contractId: string) => {
    // 修改期权合约
    const stock = stockList.find(s => s.contracts.some(c => c.id === contractId));
    if (stock) {
      router.push(`/p-edit_option_contract?stockId=${stock.id}&contractId=${contractId}`);
    }
  }, [router, stockList]);

  const handleRefreshStock = useCallback((stockId: string) => {
    // 刷新单只股票数据
    updateStockList(prevList =>
      prevList.map(stock =>
        stock.id === stockId ? { ...stock, isRefreshing: true } : stock
      )
    );
    
    // 并行获取实时价格和详情数据，使用 Promise.allSettled 让两个请求独立处理
    Promise.allSettled([
      fetchStockPrice(stockId.toUpperCase()),
      fetchStockDetails(stockId.toUpperCase())
    ])
      .then(([priceResult, detailsResult]) => {
        const priceData = priceResult.status === 'fulfilled' ? priceResult.value : null;
        const detailsData = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
        
        updateStockList(prevList =>
          prevList.map(stock =>
            stock.id === stockId 
              ? { 
                  ...stock, 
                  isRefreshing: false,
                  // 更新当前价格信息
                  currentPrice: priceData?.currentPrice || stock.currentPrice,
                  change: priceData?.change || stock.change,
                  changePercent: priceData?.changePercent || stock.changePercent,
                  isUp: priceData?.isUp !== undefined ? priceData.isUp : stock.isUp,
                  // 更新详情数据
                  details: detailsData || stock.details
                } 
              : stock
          )
        );
      });
  }, [updateStockList]);

  const renderStockCard = useCallback(({ item }: { item: StockData }) => (
    <StockCard
      stock={item}
      onDeleteStock={handleDeleteStock}
      onAddContract={handleAddContract}
      onDeleteContract={handleDeleteContract}
      onBookkeepContract={handleBookkeepContract}
      onEditContract={handleEditContract}
      onRefreshStock={handleRefreshStock}
    />
  ), [handleDeleteStock, handleAddContract, handleDeleteContract, handleBookkeepContract, handleEditContract, handleRefreshStock]);

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

      {confirmDialog.visible && (
        <View style={styles.confirmOverlay} pointerEvents="box-none">
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>确认删除</Text>
            <Text style={styles.confirmMessage}>
              {confirmDialog.type === 'stock'
                ? '确定要删除这只股票及其所有期权合约吗？'
                : '确定要删除这个期权合约吗？'}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmCancelButton} onPress={handleCancelDelete}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                <Text style={styles.confirmDeleteText}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default FollowListScreen;

