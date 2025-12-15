

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
  const FOLLOW_LIST_KEY = 'followList';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentDeleteTradeId, setCurrentDeleteTradeId] = useState<string | null>(null);
  const [contractGroups, setContractGroups] = useState<ContractGroupData[]>([]);
  const [currentPremiums, setCurrentPremiums] = useState<Record<string, number>>({});

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
        const recomputeStats = (records: TradeRecord[], groupId: string): Pick<ContractGroupData, 'averagePrice' | 'quantity' | 'currentValue' | 'pnl' | 'pnlPercent'> => {
          // 计算未平仓部分的平均价格（支持先买后卖、先卖后买）
          const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          let position = 0;  // 当前持仓数量（正数=多头，负数=空头）
          let totalCost = 0; // 当前持仓的总成本
          
          for (const record of sortedRecords) {
            const tradeQty = record.type === 'buy' ? record.quantity : -record.quantity;
            const tradeCost = record.premium * record.quantity;
            
            // 判断是开仓还是平仓
            if (position === 0) {
              // 当前无持仓，此交易为开仓
              position = tradeQty;
              totalCost = record.type === 'buy' ? tradeCost : -tradeCost;
            } else if ((position > 0 && tradeQty > 0) || (position < 0 && tradeQty < 0)) {
              // 同方向交易，加仓
              totalCost += tradeQty > 0 ? tradeCost : -tradeCost;
              position += tradeQty;
            } else {
              // 反方向交易，平仓
              const absTradeQty = Math.abs(tradeQty);
              const absPosition = Math.abs(position);
              
              if (absTradeQty >= absPosition) {
                // 完全平仓或反向开仓
                const remainingQty = absTradeQty - absPosition;
                position = position > 0 ? -remainingQty : remainingQty;
                totalCost = position !== 0 ? (position > 0 ? tradeCost * remainingQty / absTradeQty : -tradeCost * remainingQty / absTradeQty) : 0;
              } else {
                // 部分平仓
                const closeRatio = absTradeQty / absPosition;
                totalCost -= totalCost * closeRatio;
                position += tradeQty;
              }
            }
          }
          
          const netQty = records.reduce((sum, r) => sum + (r.type === 'buy' ? r.quantity : -r.quantity), 0);
          const avg = position !== 0
            ? (position > 0 ? totalCost / position : -Math.abs(totalCost / position))
            : 0;
          
          // 使用最新的期权费计算当前价值
          const currentContractPremium = currentPremiums[groupId];
          const effectivePremium = currentContractPremium !== undefined ? currentContractPremium : avg;
          const currentValue = netQty * effectivePremium;

          // 基于持仓方向计算盈亏和盈亏率
          const absQty = Math.abs(netQty);
          const pnl = absQty === 0
            ? 0
            : netQty > 0
              ? (effectivePremium - avg) * netQty
              : (Math.abs(avg) - effectivePremium) * absQty;
          const costBasis = netQty === 0 ? 0 : (netQty > 0 ? avg * netQty : Math.abs(avg) * absQty);
          const pnlPercent = costBasis !== 0 ? (pnl / costBasis) * 100 : 0;
            
          return { averagePrice: avg, quantity: netQty, currentValue, pnl, pnlPercent };
        };

        const updated = prevGroups
          .map(group => ({
            ...group,
            tradeRecords: group.tradeRecords.filter(record => record.id !== currentDeleteTradeId),
          }))
          .map(group => ({
            ...group,
            ...(group.tradeRecords.length > 0 ? recomputeStats(group.tradeRecords, group.id) : group),
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
  }, [currentDeleteTradeId, currentPremiums]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalVisible(false);
    setCurrentDeleteTradeId(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 重新加载最新的期权费
      const followStored = await AsyncStorage.getItem(FOLLOW_LIST_KEY);
      const latestPremiums: Record<string, number> = {};
      
      if (followStored) {
        const followList = JSON.parse(followStored);
        followList.forEach((stock: any) => {
          stock.contracts?.forEach((contract: any) => {
            const contractId = contract.id;
            const premium = parseFloat(contract.premium) || 0;
            latestPremiums[contractId] = premium;
          });
        });
      }
      
      setCurrentPremiums(latestPremiums);
      
      const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
      const groups: ContractGroupData[] = stored ? JSON.parse(stored) : [];
      
      // 使用最新的期权费重新计算 currentValue
      const updatedGroups = groups.map(group => {
        const currentContractPremium = latestPremiums[group.id];
        if (currentContractPremium !== undefined) {
          // 计算未平仓部分的平均价格（支持先买后卖、先卖后买）
          const sortedRecords = [...group.tradeRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          let position = 0;  // 当前持仓数量（正数=多头，负数=空头）
          let totalCost = 0; // 当前持仓的总成本
          
          for (const record of sortedRecords) {
            const tradeQty = record.type === 'buy' ? record.quantity : -record.quantity;
            const tradeCost = record.premium * record.quantity;
            
            // 判断是开仓还是平仓
            if (position === 0) {
              // 当前无持仓，此交易为开仓
              position = tradeQty;
              totalCost = record.type === 'buy' ? tradeCost : -tradeCost;
            } else if ((position > 0 && tradeQty > 0) || (position < 0 && tradeQty < 0)) {
              // 同方向交易，加仓
              totalCost += tradeQty > 0 ? tradeCost : -tradeCost;
              position += tradeQty;
            } else {
              // 反方向交易，平仓
              const absTradeQty = Math.abs(tradeQty);
              const absPosition = Math.abs(position);
              
              if (absTradeQty >= absPosition) {
                // 完全平仓或反向开仓
                const remainingQty = absTradeQty - absPosition;
                position = position > 0 ? -remainingQty : remainingQty;
                totalCost = position !== 0 ? (position > 0 ? tradeCost * remainingQty / absTradeQty : -tradeCost * remainingQty / absTradeQty) : 0;
              } else {
                // 部分平仓
                const closeRatio = absTradeQty / absPosition;
                totalCost -= totalCost * closeRatio;
                position += tradeQty;
              }
            }
          }
          
          const netQty = group.tradeRecords.reduce((sum, r) => sum + (r.type === 'buy' ? r.quantity : -r.quantity), 0);
          const avg = position !== 0
            ? (position > 0 ? totalCost / position : -Math.abs(totalCost / position))
            : 0;
          const effectivePremium = currentContractPremium !== undefined ? currentContractPremium : avg;
          const currentValue = netQty * effectivePremium;

          const absQty = Math.abs(netQty);
          const pnl = absQty === 0
            ? 0
            : netQty > 0
              ? (effectivePremium - avg) * netQty
              : (Math.abs(avg) - effectivePremium) * absQty;
          const costBasis = netQty === 0 ? 0 : (netQty > 0 ? avg * netQty : Math.abs(avg) * absQty);
          const pnlPercent = costBasis !== 0 ? (pnl / costBasis) * 100 : 0;
          
          return {
            ...group,
            averagePrice: avg,
            quantity: netQty,
            currentValue,
            pnl,
            pnlPercent,
          };
        }
        return group;
      });
      
      setContractGroups(updatedGroups);
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
          // 加载最新的期权费
          const followStored = await AsyncStorage.getItem(FOLLOW_LIST_KEY);
          const latestPremiums: Record<string, number> = {};
          
          if (followStored) {
            const followList = JSON.parse(followStored);
            followList.forEach((stock: any) => {
              stock.contracts?.forEach((contract: any) => {
                const contractId = contract.id;
                const premium = parseFloat(contract.premium) || 0;
                latestPremiums[contractId] = premium;
              });
            });
          }
          
          setCurrentPremiums(latestPremiums);
          
          const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
          const groups: ContractGroupData[] = stored ? JSON.parse(stored) : [];
          
          // 使用最新的期权费重新计算 currentValue
          const updatedGroups = groups.map(group => {
            const currentContractPremium = latestPremiums[group.id];
            if (currentContractPremium !== undefined) {
              // 计算未平仓部分的平均价格（支持先买后卖、先卖后买）
              const sortedRecords = [...group.tradeRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              let position = 0;  // 当前持仓数量（正数=多头，负数=空头）
              let totalCost = 0; // 当前持仓的总成本
              
              for (const record of sortedRecords) {
                const tradeQty = record.type === 'buy' ? record.quantity : -record.quantity;
                const tradeCost = record.premium * record.quantity;
                
                // 判断是开仓还是平仓
                if (position === 0) {
                  // 当前无持仓，此交易为开仓
                  position = tradeQty;
                  totalCost = record.type === 'buy' ? tradeCost : -tradeCost;
                } else if ((position > 0 && tradeQty > 0) || (position < 0 && tradeQty < 0)) {
                  // 同方向交易，加仓
                  totalCost += tradeQty > 0 ? tradeCost : -tradeCost;
                  position += tradeQty;
                } else {
                  // 反方向交易，平仓
                  const absTradeQty = Math.abs(tradeQty);
                  const absPosition = Math.abs(position);
                  
                  if (absTradeQty >= absPosition) {
                    // 完全平仓或反向开仓
                    const remainingQty = absTradeQty - absPosition;
                    position = position > 0 ? -remainingQty : remainingQty;
                    totalCost = position !== 0 ? (position > 0 ? tradeCost * remainingQty / absTradeQty : -tradeCost * remainingQty / absTradeQty) : 0;
                  } else {
                    // 部分平仓
                    const closeRatio = absTradeQty / absPosition;
                    totalCost -= totalCost * closeRatio;
                    position += tradeQty;
                  }
                }
              }
              
              const netQty = group.tradeRecords.reduce((sum, r) => sum + (r.type === 'buy' ? r.quantity : -r.quantity), 0);
              const avg = position !== 0
                ? (position > 0 ? totalCost / position : -Math.abs(totalCost / position))
                : 0;
              const effectivePremium = currentContractPremium !== undefined ? currentContractPremium : avg;
              const currentValue = netQty * effectivePremium;

              const absQty = Math.abs(netQty);
              const pnl = absQty === 0
                ? 0
                : netQty > 0
                  ? (effectivePremium - avg) * netQty
                  : (Math.abs(avg) - effectivePremium) * absQty;
              const costBasis = netQty === 0 ? 0 : (netQty > 0 ? avg * netQty : Math.abs(avg) * absQty);
              const pnlPercent = costBasis !== 0 ? (pnl / costBasis) * 100 : 0;
              
              return {
                ...group,
                averagePrice: avg,
                quantity: netQty,
                currentValue,
                pnl,
                pnlPercent,
              };
            }
            return group;
          });
          
          setContractGroups(updatedGroups);
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

