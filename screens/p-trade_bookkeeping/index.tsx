

import React, { useState, useCallback, useMemo } from 'react';
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

  const aggregateStats = useMemo(() => {
    const totals = contractGroups.reduce(
      (acc, group) => {
        const absQty = Math.abs(group.quantity);
        const costBasis = group.quantity === 0
          ? 0
          : (group.quantity > 0 ? group.averagePrice * group.quantity : Math.abs(group.averagePrice) * absQty);
        acc.totalPnl += group.pnl;
        acc.totalCostBasis += costBasis;
        acc.totalCurrentValue += group.currentValue;
        return acc;
      },
      { totalPnl: 0, totalCostBasis: 0, totalCurrentValue: 0 }
    );

    const totalPnlPercent = totals.totalCostBasis !== 0
      ? (totals.totalPnl / totals.totalCostBasis) * 100
      : 0;

    return {
      totalPnl: totals.totalPnl,
      totalPnlPercent,
      totalCurrentValue: totals.totalCurrentValue,
    };
  }, [contractGroups]);

  const formatSignedCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const formatSignedPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

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
          // 现金流口径计算平均价格：卖出为现金流入(+)，买入为现金流出(-)
          const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let position = 0; // 净持仓（买入+，卖出-）
          let cashFlow = 0; // 净现金流（卖出收款+，买入付款-）
          for (const r of sortedRecords) {
            if (r.type === 'buy') {
              position += r.quantity;
              cashFlow -= r.premium * r.quantity;
            } else {
              position -= r.quantity;
              cashFlow += r.premium * r.quantity;
            }
          }
          const netQty = position;
          const avg = netQty !== 0 ? (netQty > 0 ? -cashFlow / netQty : cashFlow / netQty) : 0;
          
          // 使用最新的期权费计算当前价值
          const currentContractPremium = currentPremiums[groupId];
          const effectivePremium = currentContractPremium !== undefined ? currentContractPremium : avg;
          const absQty = Math.abs(netQty);
          const currentValue = absQty * effectivePremium;

          // 计算盈亏和盈亏率
          let pnl: number;
          let pnlPercent: number;
          
          if (netQty === 0) {
            // 已平仓：盈亏就是净现金流
            pnl = cashFlow;
            // 计算盈亏率：需要找到总成本基础
            const totalCost = sortedRecords.reduce((sum, r) => {
              return sum + (r.type === 'buy' ? r.premium * r.quantity : 0);
            }, 0);
            pnlPercent = totalCost !== 0 ? (pnl / totalCost) * 100 : 0;
          } else {
            // 未平仓：按持仓方向计算盈亏
            const costBasis = avg * netQty;
            pnl = netQty > 0 ? currentValue - costBasis : costBasis - currentValue;
            pnlPercent = costBasis !== 0 ? (pnl / Math.abs(costBasis)) * 100 : 0;
          }
            
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
      
      // 使用最新的期权费重新计算 currentValue（现金流口径平均价）
      const updatedGroups = groups.map(group => {
        const currentContractPremium = latestPremiums[group.id];
        if (currentContractPremium !== undefined) {
          const sortedRecords = [...group.tradeRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let position = 0;
          let cashFlow = 0;
          for (const r of sortedRecords) {
            if (r.type === 'buy') {
              position += r.quantity;
              cashFlow -= r.premium * r.quantity;
            } else {
              position -= r.quantity;
              cashFlow += r.premium * r.quantity;
            }
          }
          const netQty = position;
          const avg = netQty !== 0 ? (netQty > 0 ? -cashFlow / netQty : cashFlow / netQty) : 0;
          const effectivePremium = currentContractPremium;
          const absQty = Math.abs(netQty);
          const currentValue = absQty * effectivePremium;
          const costBasis = avg * netQty;
          const pnl = netQty === 0 ? 0 : (netQty > 0 ? currentValue - costBasis : costBasis - currentValue);
          const pnlPercent = costBasis !== 0 ? (pnl / Math.abs(costBasis)) * 100 : 0;
          
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
              const sortedRecords = [...group.tradeRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              let position = 0;
              let cashFlow = 0;
              for (const r of sortedRecords) {
                if (r.type === 'buy') {
                  position += r.quantity;
                  cashFlow -= r.premium * r.quantity;
                } else {
                  position -= r.quantity;
                  cashFlow += r.premium * r.quantity;
                }
              }
              const netQty = position;
              const avg = netQty !== 0 ? (netQty > 0 ? -cashFlow / netQty : cashFlow / netQty) : 0;
              const effectivePremium = currentContractPremium;
              const absQty = Math.abs(netQty);
              const currentValue = absQty * effectivePremium;
              
              // 计算盈亏和盈亏率
              let pnl: number;
              let pnlPercent: number;
              
              if (netQty === 0) {
                // 已平仓：盈亏就是净现金流
                pnl = cashFlow;
                // 计算盈亏率：需要找到总成本基础
                const totalCost = sortedRecords.reduce((sum, r) => {
                  return sum + (r.type === 'buy' ? r.premium * r.quantity : 0);
                }, 0);
                pnlPercent = totalCost !== 0 ? (pnl / totalCost) * 100 : 0;
              } else {
                // 未平仓：按持仓方向计算盈亏
                const costBasis = avg * netQty;
                pnl = netQty > 0 ? currentValue - costBasis : costBasis - currentValue;
                pnlPercent = costBasis !== 0 ? (pnl / Math.abs(costBasis)) * 100 : 0;
              }
              
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
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>全部合约盈亏</Text>
                <Text
                  style={[
                    styles.summaryPnlValue,
                    { color: aggregateStats.totalPnl >= 0 ? '#FF3B30' : '#34C759' },
                  ]}
                >
                  {formatSignedCurrency(aggregateStats.totalPnl)}
                </Text>
              </View>
              <View style={styles.summaryMetaRow}>
                <View style={styles.summaryMetaItem}>
                  <Text style={styles.summaryLabel}>盈亏百分比</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: aggregateStats.totalPnl >= 0 ? '#FF3B30' : '#34C759' }
                  ]}>{formatSignedPercent(aggregateStats.totalPnlPercent)}</Text>
                </View>
                <View style={styles.summaryMetaItem}>
                  <Text style={styles.summaryLabel}>总当前价值</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(aggregateStats.totalCurrentValue)}</Text>
                </View>
              </View>
            </View>

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
          </>
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

