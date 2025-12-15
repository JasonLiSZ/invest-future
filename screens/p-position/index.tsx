

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import PositionCard from './components/PositionCard';

interface PositionData {
  id: string;
  symbol: string;
  contract: string;
  company: string;
  type: 'call' | 'put';
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  averagePrice: number;
  quantity: number;
  currentValue: number;
  expirationDate: string;
  daysRemaining: number;
  daysHeld: number;
  profitLoss: number;
  profitLossPercent: number;
  isClosed?: boolean;
  closeDate?: string;
  closePrice?: number;
}

const PositionScreen = () => {
  const router = useRouter();
  const TRADE_STORAGE_KEY = 'tradeBookkeepingData';
  const FOLLOW_LIST_KEY = 'followList';
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [openPositions, setOpenPositions] = useState<PositionData[]>([]);
  const [closedPositions, setClosedPositions] = useState<PositionData[]>([]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const handleTabPress = useCallback((tab: 'open' | 'closed') => {
    setActiveTab(tab);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
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

      const stored = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
      const groups: any[] = stored ? JSON.parse(stored) : [];

      // 现金流口径计算每个合约的持仓与盈亏
      const mapToPosition = (group: any): PositionData => {
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
        const currentPremium = latestPremiums[group.id] ?? avg;
        const absQty = Math.abs(netQty);
        const currentValue = absQty * currentPremium;
        const costBasis = avg * netQty;
        const pnl = netQty === 0 ? 0 : (netQty > 0 ? currentValue - costBasis : costBasis - currentValue);
        const pnlPercent = costBasis !== 0 ? (pnl / Math.abs(costBasis)) * 100 : 0;

        return {
          id: group.id,
          symbol: group.symbol,
          contract: `${group.symbol} ${group.expiration} ${group.strike.toFixed(2)} ${group.type.toUpperCase()}`,
          company: group.symbol,
          type: group.type,
          currentPrice: currentPremium,
          priceChange: 0,
          priceChangePercent: 0,
          averagePrice: avg,
          quantity: netQty,
          currentValue,
          expirationDate: group.expiration,
          daysRemaining: 0,
          daysHeld: 0,
          profitLoss: pnl,
          profitLossPercent: pnlPercent,
        } as PositionData;
      };

      const positions = groups.map(mapToPosition);
      setOpenPositions(positions.filter(p => p.quantity !== 0));
      setClosedPositions(positions.filter(p => p.quantity === 0).map(p => ({ ...p, isClosed: true })));
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 首次加载同步数据
    handleRefresh();
  }, [handleRefresh]);

  const handleStartTrading = useCallback(() => {
    router.push('/p-trade_bookkeeping');
  }, [router]);

  const currentPositions = activeTab === 'open' ? openPositions : closedPositions;
  const showEmptyState = openPositions.length === 0 && closedPositions.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>持仓</Text>
        <View style={styles.headerPlaceholder} />
      </View>

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
        {!showEmptyState && (
          <>
            {/* 标签页 */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'open' ? styles.tabActive : styles.tabInactive,
                ]}
                onPress={() => handleTabPress('open')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'open' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  未平仓
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'closed' ? styles.tabActive : styles.tabInactive,
                ]}
                onPress={() => handleTabPress('closed')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'closed' ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  已平仓
                </Text>
              </TouchableOpacity>
            </View>

            {/* 持仓列表 */}
            <View style={styles.positionList}>
              {currentPositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                />
              ))}
            </View>
          </>
        )}

        {/* 空状态 */}
        {showEmptyState && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome6 name="briefcase" size={32} color="#86868B" />
            </View>
            <Text style={styles.emptyTitle}>暂无持仓记录</Text>
            <Text style={styles.emptyDescription}>开始您的第一笔期权交易</Text>
            <TouchableOpacity
              style={styles.startTradingButton}
              onPress={handleStartTrading}
              activeOpacity={0.8}
            >
              <FontAwesome6 name="plus" size={16} color="#FFFFFF" style={styles.startTradingIcon} />
              <Text style={styles.startTradingText}>开始交易</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PositionScreen;

