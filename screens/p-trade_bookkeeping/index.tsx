

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Modal, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';
import ContractGroup from './components/ContractGroup';
import DeleteModal from './components/DeleteModal';

interface TradeRecord {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  premium: number;
  quantity: number;
  totalValue: number;
  isClosing?: boolean;
  profit?: number;
}

interface ContractGroupData {
  id: string;
  symbol: string;
  expiration: string;
  strike: number;
  type: 'call' | 'put';
  averagePrice: number;
  quantity: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  tradeRecords: TradeRecord[];
}

const TradeBookkeepingScreen: React.FC = () => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentDeleteTradeId, setCurrentDeleteTradeId] = useState<string | null>(null);
  const [contractGroups, setContractGroups] = useState<ContractGroupData[]>([
    {
      id: 'aapl-1',
      symbol: 'AAPL',
      expiration: '12/15/23',
      strike: 180.00,
      type: 'call',
      averagePrice: 3.45,
      quantity: 5,
      currentValue: 17.25,
      pnl: 2.50,
      pnlPercent: 7.25,
      tradeRecords: [
        {
          id: '1',
          date: '2023-12-01',
          type: 'buy',
          premium: 3.45,
          quantity: 5,
          totalValue: 17.25,
        },
      ],
    },
    {
      id: 'aapl-2',
      symbol: 'AAPL',
      expiration: '12/15/23',
      strike: 170.00,
      type: 'put',
      averagePrice: 2.18,
      quantity: 3,
      currentValue: 6.54,
      pnl: -0.89,
      pnlPercent: -4.08,
      tradeRecords: [
        {
          id: '2',
          date: '2023-12-02',
          type: 'sell',
          premium: 2.18,
          quantity: 3,
          totalValue: 6.54,
        },
      ],
    },
    {
      id: 'tsla-1',
      symbol: 'TSLA',
      expiration: '01/19/24',
      strike: 250.00,
      type: 'call',
      averagePrice: 12.34,
      quantity: 2,
      currentValue: 24.68,
      pnl: 5.67,
      pnlPercent: 45.95,
      tradeRecords: [
        {
          id: '3',
          date: '2023-12-03',
          type: 'buy',
          premium: 12.34,
          quantity: 2,
          totalValue: 24.68,
        },
        {
          id: '4',
          date: '2023-12-05',
          type: 'sell',
          premium: 15.18,
          quantity: 1,
          totalValue: 15.18,
          isClosing: true,
          profit: 2.84,
        },
      ],
    },
  ]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const handleAddTradePress = useCallback(() => {
    router.push('/p-add_edit_trade');
  }, [router]);

  const handleEditTradePress = useCallback((tradeId: string) => {
    router.push(`/p-add_edit_trade?tradeId=${tradeId}&mode=edit`);
  }, [router]);

  const handleClosePositionPress = useCallback((tradeId: string) => {
    router.push(`/p-add_edit_trade?tradeId=${tradeId}&mode=close`);
  }, [router]);

  const handleDeleteTradePress = useCallback((tradeId: string) => {
    setCurrentDeleteTradeId(tradeId);
    setIsDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentDeleteTradeId) {
      setContractGroups(prevGroups =>
        prevGroups.map(group => ({
          ...group,
          tradeRecords: group.tradeRecords.filter(record => record.id !== currentDeleteTradeId),
        })).filter(group => group.tradeRecords.length > 0)
      );
      setIsDeleteModalVisible(false);
      setCurrentDeleteTradeId(null);
      Alert.alert('删除成功', '交易记录已删除');
    }
  }, [currentDeleteTradeId]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalVisible(false);
    setCurrentDeleteTradeId(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // 模拟刷新数据
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('刷新完成', '数据已更新');
    }, 2000);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <FontAwesome6 name="arrow-right-arrow-left" size={32} color="#86868B" />
      </View>
      <Text style={styles.emptyStateTitle}>暂无交易记录</Text>
      <Text style={styles.emptyStateSubtitle}>开始记录您的第一笔期权交易</Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddTradePress}>
        <FontAwesome6 name="plus" size={16} color="#FFFFFF" style={styles.emptyStateButtonIcon} />
        <Text style={styles.emptyStateButtonText}>新增交易</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>交易簿记</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTradePress}>
          <FontAwesome6 name="plus" size={14} color="#FFFFFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>新增交易</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {contractGroups.length > 0 ? (
          <View style={styles.tradeList}>
            {contractGroups.map((group) => (
              <ContractGroup
                key={group.id}
                data={group}
                onEditTrade={handleEditTradePress}
                onClosePosition={handleClosePositionPress}
                onDeleteTrade={handleDeleteTradePress}
              />
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* 删除确认对话框 */}
      <DeleteModal
        visible={isDeleteModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </SafeAreaView>
  );
};

export default TradeBookkeepingScreen;

