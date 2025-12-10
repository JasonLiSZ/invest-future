

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const TRADE_STORAGE_KEY = 'tradeBookkeepingData';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentDeleteTradeId, setCurrentDeleteTradeId] = useState<string | null>(null);
  const [contractGroups, setContractGroups] = useState<ContractGroupData[]>([]);

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
      setContractGroups(prevGroups => {
        const recomputeStats = (records: TradeRecord[]): Pick<ContractGroupData, 'averagePrice' | 'quantity' | 'currentValue' | 'pnl' | 'pnlPercent'> => {
          const buyRecords = records.filter(r => r.type === 'buy');
          const totalBuyQty = buyRecords.reduce((sum, r) => sum + r.quantity, 0);
          const totalBuyCost = buyRecords.reduce((sum, r) => sum + r.premium * r.quantity, 0);
          const netQty = records.reduce((sum, r) => sum + (r.type === 'buy' ? r.quantity : -r.quantity), 0);
          const avg = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0;
          const currentValue = netQty * avg;
          return { averagePrice: avg, quantity: netQty, currentValue, pnl: 0, pnlPercent: 0 };
        };

        const updated = prevGroups
          .map(group => ({
            ...group,
            tradeRecords: group.tradeRecords.filter(record => record.id !== currentDeleteTradeId),
          }))
          .map(group => ({
            ...group,
            ...(group.tradeRecords.length > 0 ? recomputeStats(group.tradeRecords) : group),
          }))
          .filter(group => group.tradeRecords.length > 0);

        AsyncStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(updated)).catch(e => {
          console.error('删除后保存失败', e);
        });

        return updated;
      });

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
    try {
      const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
      const groups: ContractGroupData[] = stored ? JSON.parse(stored) : [];
      setContractGroups(groups);
    } catch (e) {
      console.error('刷新交易簿记失败', e);
      Alert.alert('刷新失败', '无法加载数据');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
          const groups: ContractGroupData[] = stored ? JSON.parse(stored) : [];
          setContractGroups(groups);
        } catch (e) {
          console.error('加载交易簿记失败', e);
        }
      };

      loadData();
    }, [])
  );

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

