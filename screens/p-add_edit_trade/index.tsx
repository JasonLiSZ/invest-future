

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

interface OptionContract {
  id: string;
  symbol: string;
  stock: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  premium: number;
}

interface StoredOptionContract {
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
  contracts: StoredOptionContract[];
}

interface TradeData {
  contract_id: string;
  contract_symbol: string;
  direction: 'BUY' | 'SELL';
  date: string;
  premium: number;
  quantity: number;
  is_close_position: boolean;
}

interface StoredTradeRecord {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  premium: number;
  quantity: number;
  totalValue: number;
  isClosing?: boolean;
}

interface StoredContractGroup {
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
  tradeRecords: StoredTradeRecord[];
}

const AddEditTradeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 判断模式
  const isEditMode = params.trade_id !== undefined;
  const isClosePosition = params.close_position === 'true';
  const contractId = (params.contract_id as string) || (params.contractId as string);

  // 状态管理
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [tradeDirection, setTradeDirection] = useState<'BUY' | 'SELL'>('SELL');
  const [tradeDate, setTradeDate] = useState('');
  const [premium, setPremium] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('保存失败，请重试');

  const FOLLOW_LIST_KEY = 'followList';
  const TRADE_STORAGE_KEY = 'tradeBookkeepingData';

  const generateTradeId = () => `trade-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const computeGroupStats = (records: StoredTradeRecord[]) => {
    const buyRecords = records.filter(r => r.type === 'buy');
    const totalBuyQty = buyRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalBuyCost = buyRecords.reduce((sum, r) => sum + r.premium * r.quantity, 0);
    const netQuantity = records.reduce((sum, r) => sum + (r.type === 'buy' ? r.quantity : -r.quantity), 0);
    const averagePrice = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0;
    const currentValue = netQuantity * averagePrice;

    return {
      averagePrice,
      quantity: netQuantity,
      currentValue,
      pnl: 0,
      pnlPercent: 0,
    };
  };

  // 模拟数据
  const mockContracts: OptionContract[] = [
    {
      id: 'contract-1',
      symbol: 'AAPL 12/15/23 180.00 CALL',
      stock: 'AAPL',
      type: 'CALL',
      strike: 180.00,
      expiration: '2023-12-15',
      premium: 3.45
    },
    {
      id: 'contract-2',
      symbol: 'AAPL 12/15/23 170.00 PUT',
      stock: 'AAPL',
      type: 'PUT',
      strike: 170.00,
      expiration: '2023-12-15',
      premium: 2.18
    },
    {
      id: 'contract-3',
      symbol: 'TSLA 01/19/24 250.00 CALL',
      stock: 'TSLA',
      type: 'CALL',
      strike: 250.00,
      expiration: '2024-01-19',
      premium: 12.34
    },
    {
      id: 'contract-4',
      symbol: 'MSFT 02/16/24 375.00 PUT',
      stock: 'MSFT',
      type: 'PUT',
      strike: 375.00,
      expiration: '2024-02-16',
      premium: 8.92
    }
  ];

  const mockTrades: Record<string, TradeData> = {
    'trade-1': {
      contract_id: 'contract-1',
      contract_symbol: 'AAPL 12/15/23 180.00 CALL',
      direction: 'SELL',
      date: '2023-12-01',
      premium: 3.45,
      quantity: 2,
      is_close_position: false
    },
    'trade-2': {
      contract_id: 'contract-3',
      contract_symbol: 'TSLA 01/19/24 250.00 CALL',
      direction: 'BUY',
      date: '2023-12-02',
      premium: 12.34,
      quantity: 1,
      is_close_position: false
    }
  };

  // 初始化页面
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTradeDate(today);

    const loadContractFromStorage = async (targetId: string) => {
      try {
        const stored = await AsyncStorage.getItem(FOLLOW_LIST_KEY);
        if (!stored) return;
        const stockList: StockData[] = JSON.parse(stored);
        const stock = stockList.find(s => s.contracts?.some(c => c.id === targetId));
        const contract = stock?.contracts.find(c => c.id === targetId);
        if (stock && contract) {
          const mapped: OptionContract = {
            id: contract.id,
            symbol: contract.symbol,
            stock: stock.symbol,
            type: contract.type === 'call' ? 'CALL' : 'PUT',
            strike: parseFloat(contract.strikePrice) || 0,
            expiration: contract.expirationDate,
            premium: 0,
          };
          setSelectedContract(mapped);
        }
      } catch (e) {
        console.error('加载期权合约失败', e);
      }
    };

    if (isEditMode) {
      const tradeId = params.trade_id as string;
      const tradeData = mockTrades[tradeId];
      
      if (tradeData) {
        const contract = mockContracts.find(c => c.id === tradeData.contract_id);
        if (contract) {
          setSelectedContract(contract);
        }
        setTradeDirection(tradeData.direction);
        setTradeDate(tradeData.date);
        setPremium(tradeData.premium.toString());
        setQuantity(tradeData.quantity.toString());
      }
    } else if (isClosePosition) {
      const tradeId = params.trade_id as string;
      const tradeData = mockTrades[tradeId];
      
      if (tradeData) {
        const contract = mockContracts.find(c => c.id === tradeData.contract_id);
        if (contract) {
          setSelectedContract(contract);
        }
        const closeDirection = tradeData.direction === 'BUY' ? 'SELL' : 'BUY';
        setTradeDirection(closeDirection);
        setQuantity(tradeData.quantity.toString());
      }
    } else if (contractId) {
      const contract = mockContracts.find(c => c.id === contractId);
      if (contract) {
        setSelectedContract(contract);
        setPremium(contract.premium.toString());
      } else {
        loadContractFromStorage(contractId).then(() => {
          // premium由交易输入，保持为空
        });
      }
    }
  }, [params]);

  // 过滤合约
  const filteredContracts = mockContracts.filter(contract =>
    contract.symbol.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
    contract.stock.toLowerCase().includes(contractSearchQuery.toLowerCase())
  );

  // 计算总金额
  const calculateTotal = () => {
    const premiumValue = parseFloat(premium) || 0;
    const quantityValue = parseInt(quantity) || 0;
    return (premiumValue * quantityValue).toFixed(2);
  };

  // 处理返回
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/p-trade_bookkeeping');
    }
  };

  // 处理合约选择
  const handleContractSelect = (contract: OptionContract) => {
    setSelectedContract(contract);
    if (!premium) {
      setPremium(contract.premium.toString());
    }
    setIsContractModalVisible(false);
    setContractSearchQuery('');
  };

  // 处理方向选择
  const handleDirectionSelect = (direction: 'BUY' | 'SELL') => {
    setTradeDirection(direction);
  };

  // 处理数量减少
  const handleQuantityDecrease = () => {
    const currentValue = parseInt(quantity) || 1;
    if (currentValue > 1) {
      setQuantity((currentValue - 1).toString());
    }
  };

  // 处理数量增加
  const handleQuantityIncrease = () => {
    const currentValue = parseInt(quantity) || 0;
    setQuantity((currentValue + 1).toString());
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!selectedContract) {
      showError('请选择期权合约');
      return false;
    }
    
    const premiumValue = parseFloat(premium);
    if (!premium || premiumValue <= 0) {
      showError('请输入有效的期权费');
      return false;
    }
    
    const quantityValue = parseInt(quantity);
    if (!quantity || quantityValue <= 0) {
      showError('请输入有效的数量');
      return false;
    }
    
    return true;
  };

  // 保存交易
  const handleSaveTrade = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const premiumValue = parseFloat(premium);
      const quantityValue = parseInt(quantity);

      const tradeData: TradeData = {
        contract_id: selectedContract!.id,
        contract_symbol: selectedContract!.symbol,
        direction: tradeDirection,
        date: tradeDate,
        premium: premiumValue,
        quantity: quantityValue,
        is_close_position: isClosePosition,
      };

      const newRecord: StoredTradeRecord = {
        id: generateTradeId(),
        date: tradeDate,
        type: tradeDirection === 'BUY' ? 'buy' : 'sell',
        premium: premiumValue,
        quantity: quantityValue,
        totalValue: parseFloat((premiumValue * quantityValue).toFixed(2)),
        isClosing: isClosePosition,
      };

      const storedGroups = await AsyncStorage.getItem(TRADE_STORAGE_KEY);
      const groups: StoredContractGroup[] = storedGroups ? JSON.parse(storedGroups) : [];
      const groupIndex = groups.findIndex(g => g.id === selectedContract!.id);

      if (groupIndex >= 0) {
        const updatedRecords = [newRecord, ...groups[groupIndex].tradeRecords];
        const stats = computeGroupStats(updatedRecords);
        groups[groupIndex] = {
          ...groups[groupIndex],
          ...stats,
          tradeRecords: updatedRecords,
        };
      } else {
        const records = [newRecord];
        const stats = computeGroupStats(records);
        groups.unshift({
          id: selectedContract!.id,
          symbol: selectedContract!.symbol,
          expiration: selectedContract!.expiration,
          strike: selectedContract!.strike,
          type: selectedContract!.type === 'CALL' ? 'call' : 'put',
          ...stats,
          tradeRecords: records,
        });
      }

      await AsyncStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(groups));

      console.log('保存交易数据:', tradeData);

      showSuccess();

      setTimeout(() => {
        router.push('/p-trade_bookkeeping');
      }, 500);

    } catch (error) {
      console.error('保存交易失败', error);
      showError('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 显示成功提示
  const showSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // 显示错误提示
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
    setTimeout(() => {
      setShowErrorToast(false);
    }, 3000);
  };

  // 渲染合约项
  const renderContractItem = ({ item }: { item: OptionContract }) => (
    <TouchableOpacity
      style={styles.contractItem}
      onPress={() => handleContractSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contractItemContent}>
        <View style={styles.contractItemLeft}>
          <View style={styles.contractSymbolRow}>
            <Text style={styles.contractSymbol}>{item.symbol}</Text>
            <View style={[
              styles.contractTypeTag,
              { backgroundColor: item.type === 'CALL' ? '#5856D6' : '#FF9500' }
            ]}>
              <Text style={styles.contractTypeText}>
                {item.type === 'CALL' ? '看涨' : '看跌'}
              </Text>
            </View>
          </View>
          <View style={styles.contractDetailsRow}>
            <Text style={styles.contractDetail}>行权价: ${item.strike.toFixed(2)}</Text>
            <Text style={styles.contractDetail}>到期日: {item.expiration}</Text>
            <Text style={styles.contractDetail}>期权费: ${item.premium.toFixed(2)}</Text>
          </View>
        </View>
        <FontAwesome6 name="chevron-right" size={14} color="#86868B" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>
            {isEditMode ? '编辑交易' : isClosePosition ? '平仓交易' : '新增交易'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveTrade}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 主要内容区域 */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* 期权合约选择 */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>期权合约 *</Text>
          <TouchableOpacity
            style={styles.contractSelector}
            onPress={() => setIsContractModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.contractSelectorText,
              !selectedContract && styles.placeholderText
            ]}>
              {selectedContract ? selectedContract.symbol : '选择或输入期权合约'}
            </Text>
            <FontAwesome6 name="chevron-down" size={14} color="#86868B" />
          </TouchableOpacity>
        </View>

        {/* 买卖方向选择 */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>买卖方向 *</Text>
          <View style={styles.directionSelector}>
            <TouchableOpacity
              style={[
                styles.directionOption,
                tradeDirection === 'BUY' && styles.directionOptionSelected
              ]}
              onPress={() => handleDirectionSelect('BUY')}
              activeOpacity={0.7}
            >
              <FontAwesome6 
                name="arrow-up" 
                size={14} 
                color={tradeDirection === 'BUY' ? '#FFFFFF' : '#86868B'} 
              />
              <Text style={[
                styles.directionOptionText,
                tradeDirection === 'BUY' && styles.directionOptionTextSelected
              ]}>
                买入
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.directionOption,
                tradeDirection === 'SELL' && styles.directionOptionSelected
              ]}
              onPress={() => handleDirectionSelect('SELL')}
              activeOpacity={0.7}
            >
              <FontAwesome6 
                name="arrow-down" 
                size={14} 
                color={tradeDirection === 'SELL' ? '#FFFFFF' : '#86868B'} 
              />
              <Text style={[
                styles.directionOptionText,
                tradeDirection === 'SELL' && styles.directionOptionTextSelected
              ]}>
                卖出
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 交易日期 */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>交易日期 *</Text>
          <View style={styles.dateInputWrapper}>
            <TextInput
              style={styles.dateInput}
              value={tradeDate}
              onChangeText={setTradeDate}
              placeholder="选择交易日期"
              placeholderTextColor="#86868B"
            />
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                // 在实际应用中，这里可以集成日期选择器
                Alert.alert('提示', '请手动输入日期格式为YYYY-MM-DD');
              }}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="calendar" size={14} color="#86868B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 期权费 */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>期权费 *</Text>
          <View style={styles.premiumInputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.premiumInput}
              value={premium}
              onChangeText={setPremium}
              placeholder="0.00"
              placeholderTextColor="#86868B"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* 数量 */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>数量 *</Text>
          <View style={styles.quantityInputWrapper}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleQuantityDecrease}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="minus" size={10} color="#86868B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonActive]}
                onPress={handleQuantityIncrease}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="plus" size={10} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 交易摘要 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>交易摘要</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>合约:</Text>
              <Text style={styles.summaryValue}>
                {selectedContract ? selectedContract.symbol : '-'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>方向:</Text>
              <Text style={styles.summaryValue}>
                {tradeDirection === 'BUY' ? '买入' : '卖出'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>期权费:</Text>
              <Text style={styles.summaryValue}>
                ${parseFloat(premium || '0').toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>数量:</Text>
              <Text style={styles.summaryValue}>{quantity || '0'}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>总金额:</Text>
              <Text style={styles.summaryTotalValue}>${calculateTotal()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 期权合约选择弹窗 */}
      <Modal
        visible={isContractModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsContractModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setIsContractModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            {/* 弹窗头部 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择期权合约</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsContractModalVisible(false)}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="xmark" size={16} color="#1D1D1F" />
              </TouchableOpacity>
            </View>

            {/* 搜索框 */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchInputWrapper}>
                <TextInput
                  style={styles.modalSearchInput}
                  value={contractSearchQuery}
                  onChangeText={setContractSearchQuery}
                  placeholder="搜索合约代码"
                  placeholderTextColor="#86868B"
                />
                <FontAwesome6 name="magnifying-glass" size={14} color="#86868B" />
              </View>
            </View>

            {/* 合约列表 */}
            <FlatList
              data={filteredContracts}
              renderItem={renderContractItem}
              keyExtractor={(item) => item.id}
              style={styles.contractList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contractListContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <FontAwesome6 name="magnifying-glass" size={32} color="#86868B" />
                  <Text style={styles.emptyStateText}>未找到匹配的合约</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 加载提示 */}
      <Modal
        visible={isLoading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <FontAwesome6 name="spinner" size={24} color="#007AFF" />
            <Text style={styles.loadingText}>保存中...</Text>
          </View>
        </View>
      </Modal>

      {/* 成功提示 */}
      {showSuccessToast && (
        <View style={styles.successToast}>
          <FontAwesome6 name="circle-check" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>保存成功</Text>
        </View>
      )}

      {/* 错误提示 */}
      {showErrorToast && (
        <View style={styles.errorToast}>
          <FontAwesome6 name="circle-exclamation" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{errorMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddEditTradeScreen;

