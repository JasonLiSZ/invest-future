

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
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
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 模拟持仓数据
  const [openPositions] = useState<PositionData[]>([
    {
      id: '1',
      symbol: 'AAPL',
      contract: 'AAPL 12/15/23 180.00 CALL',
      company: '苹果公司',
      type: 'call',
      currentPrice: 175.43,
      priceChange: 2.34,
      priceChangePercent: 1.35,
      averagePrice: 3.45,
      quantity: 5,
      currentValue: 1754.30,
      expirationDate: '2023-12-15',
      daysRemaining: 23,
      daysHeld: 12,
      profitLoss: 125.50,
      profitLossPercent: 7.25,
    },
    {
      id: '2',
      symbol: 'TSLA',
      contract: 'TSLA 01/19/24 250.00 CALL',
      company: '特斯拉',
      type: 'call',
      currentPrice: 248.87,
      priceChange: -5.67,
      priceChangePercent: -2.23,
      averagePrice: 12.34,
      quantity: 3,
      currentValue: 746.61,
      expirationDate: '2024-01-19',
      daysRemaining: 48,
      daysHeld: 5,
      profitLoss: -35.70,
      profitLossPercent: -9.65,
    },
    {
      id: '3',
      symbol: 'AAPL',
      contract: 'AAPL 12/15/23 170.00 PUT',
      company: '苹果公司',
      type: 'put',
      currentPrice: 175.43,
      priceChange: 2.34,
      priceChangePercent: 1.35,
      averagePrice: 2.18,
      quantity: 2,
      currentValue: 430.86,
      expirationDate: '2023-12-15',
      daysRemaining: 23,
      daysHeld: 8,
      profitLoss: -45.20,
      profitLossPercent: -10.35,
    },
  ]);

  const [closedPositions] = useState<PositionData[]>([
    {
      id: '4',
      symbol: 'MSFT',
      contract: 'MSFT 11/17/23 370.00 CALL',
      company: '微软公司',
      type: 'call',
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      averagePrice: 8.25,
      quantity: 4,
      currentValue: 0,
      expirationDate: '2023-11-17',
      daysRemaining: 0,
      daysHeld: 15,
      profitLoss: 168.00,
      profitLossPercent: 50.91,
      isClosed: true,
      closeDate: '2023-11-15',
      closePrice: 12.45,
    },
    {
      id: '5',
      symbol: 'GOOGL',
      contract: 'GOOGL 11/10/23 140.00 PUT',
      company: '谷歌',
      type: 'put',
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      averagePrice: 4.12,
      quantity: 6,
      currentValue: 0,
      expirationDate: '2023-11-10',
      daysRemaining: 0,
      daysHeld: 7,
      profitLoss: -136.20,
      profitLossPercent: -55.10,
      isClosed: true,
      closeDate: '2023-11-08',
      closePrice: 1.85,
    },
  ]);

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
      // 模拟刷新数据
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('持仓数据已刷新');
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

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

