

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

interface StockInfo {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeClass: 'price-up' | 'price-down';
}

interface OptionContractInfo {
  strikePrice: string;
  expirationDate: string;
  contractType: 'CALL' | 'PUT';
}

interface FormData {
  contractSymbol: string;
  strikePrice: string;
  expirationDate: string;
  contractType: 'CALL' | 'PUT' | '';
  premium: string;
}

interface FormErrors {
  contractSymbol: string;
  strikePrice: string;
  expirationDate: string;
  contractType: string;
  premium: string;
}

interface OptionContract {
  id: string;
  symbol: string;
  strikePrice: string;
  expirationDate: string;
  type: 'call' | 'put';
  premium?: string;
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

const AddOptionContractScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    symbol: 'AAPL',
    name: '苹果公司',
    price: '--',
    change: '--',
    changeClass: 'price-up'
  });

  const [formData, setFormData] = useState<FormData>({
    contractSymbol: '',
    strikePrice: '',
    expirationDate: '',
    contractType: '',
    premium: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    contractSymbol: '',
    strikePrice: '',
    expirationDate: '',
    contractType: '',
    premium: ''
  });



  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    const stockId = (params.stockId as string) || 'AAPL';
    // 设置默认股票信息
    setStockInfo(prev => ({
      ...prev,
      symbol: stockId.toUpperCase(),
    }));
    
    // 设置默认到期日为当前日期加30天
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const defaultDate = today.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, expirationDate: defaultDate }));
  }, [params.stockId]);



  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      contractSymbol: '',
      strikePrice: '',
      expirationDate: '',
      contractType: '',
      premium: ''
    };

    let isValid = true;

    if (!formData.contractSymbol.trim()) {
      errors.contractSymbol = '请输入合约代码';
      isValid = false;
    }

    if (!formData.strikePrice) {
      errors.strikePrice = '请输入行权价';
      isValid = false;
    } else if (parseFloat(formData.strikePrice) < 0) {
      errors.strikePrice = '行权价不能为负数';
      isValid = false;
    }

    if (!formData.expirationDate) {
      errors.expirationDate = '请选择到期日';
      isValid = false;
    } else {
      const selectedDate = new Date(formData.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.expirationDate = '到期日不能早于今天';
        isValid = false;
      }
    }

    if (!formData.contractType) {
      errors.contractType = '请选择合约类型';
      isValid = false;
    }

    if (!formData.premium) {
      errors.premium = '请输入期权费';
      isValid = false;
    } else if (parseFloat(formData.premium) < 0) {
      errors.premium = '期权费不能为负数';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSavePress = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // 提取股票代码（从合约代码的第一个单词）
        const stockSymbol = formData.contractSymbol.trim().split(/\s+/)[0].toUpperCase();
        
        // 读取现有的关注列表
        const existingData = await AsyncStorage.getItem(FOLLOW_LIST_KEY);
        const stockList: StockData[] = existingData ? JSON.parse(existingData) : [];
        
        // 查找或创建对应的股票记录
        let stockData = stockList.find(stock => stock.symbol === stockSymbol);
        
        if (!stockData) {
          // 如果股票不存在，创建新的股票记录
          stockData = {
            id: stockSymbol.toLowerCase(),
            symbol: stockSymbol,
            name: stockInfo.name || stockSymbol,
            currentPrice: stockInfo.price,
            change: stockInfo.change,
            changePercent: '0%',
            isUp: true,
            contracts: [],
            details: {
              fiveDayAvg: '--',
              fiveDayLow: '--',
              fiveDayHigh: '--',
              thirtyDayAvg: '--',
              thirtyDayLow: '--',
              thirtyDayHigh: '--',
              fiftyTwoWeekAvg: '--',
              fiftyTwoWeekLow: '--',
              fairValue: '--',
            },
          };
          stockList.push(stockData);
        }
        
        // 创建新的期权合约
        const newContract: OptionContract = {
          id: `contract-${Date.now()}`,
          symbol: formData.contractSymbol.trim(),
          strikePrice: formData.strikePrice,
          expirationDate: formData.expirationDate,
          type: formData.contractType === 'CALL' ? 'call' : 'put',
          premium: formData.premium,
        };
        
        // 将新合约添加到股票的合约列表中
        if (!stockData.contracts) {
          stockData.contracts = [];
        }
        stockData.contracts.push(newContract);
        
        // 保存更新后的列表到 AsyncStorage
        await AsyncStorage.setItem(FOLLOW_LIST_KEY, JSON.stringify(stockList));
        
        // 模拟保存动画延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSuccessModalVisible(true);
      } catch (error) {
        Alert.alert('保存失败', '请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalVisible(false);
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误信息
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 解析期权代码格式：SYMBOL TYPE YYYYMMDD STRIKE (如: AAPL CALL 20251215 180.00)
  const parseOptionContractCode = (code: string): OptionContractInfo | null => {
    const parts = code.trim().split(/\s+/);
    if (parts.length < 4) return null;

    // 提取行权价（最后一项）
    const strikePriceStr = parts[parts.length - 1];
    const strikePrice = parseFloat(strikePriceStr);
    if (isNaN(strikePrice)) return null;

    // 提取日期（倒数第二项）- YYYYMMDD
    const dateStr = parts[parts.length - 2];
    if (!/^\d{8}$/.test(dateStr)) return null;

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const expirationDate = `${year}-${month}-${day}`;

    // 验证日期有效性
    const dateObj = new Date(expirationDate);
    if (isNaN(dateObj.getTime())) return null;

    // 提取合约类型（倒数第三项）
    const contractTypeStr = parts[parts.length - 3].toUpperCase();
    if (!(['CALL', 'PUT'].includes(contractTypeStr))) return null;

    return {
      strikePrice: strikePrice.toString(),
      expirationDate,
      contractType: contractTypeStr as 'CALL' | 'PUT'
    };
  };



  const handleContractTypeSelect = (type: 'CALL' | 'PUT') => {
    handleInputChange('contractType', type);
  };



  // 处理期权代码输入完整后自动解析填充字段
  const handleCompleteOptionCode = (code: string) => {
    const parsed = parseOptionContractCode(code);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        strikePrice: parsed.strikePrice,
        expirationDate: parsed.expirationDate,
        contractType: parsed.contractType
      }));
      // 清除对应字段的错误信息
      setFormErrors(prev => ({
        ...prev,
        strikePrice: '',
        expirationDate: '',
        contractType: ''
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加期权合约</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSavePress}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '保存中...' : '保存'}
          </Text>
          {isLoading && (
            <FontAwesome6 
              name="spinner" 
              size={14} 
              color="#FFFFFF" 
              style={styles.loadingIcon} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 股票信息卡片 */}
        <View style={styles.stockInfoCard}>
          <View style={styles.stockInfoContent}>
            <View style={styles.stockIcon}>
              <Text style={styles.stockSymbol}>{stockInfo.symbol}</Text>
            </View>
            <View style={styles.stockDetails}>
              <Text style={styles.stockName}>{stockInfo.name}</Text>
              <Text style={styles.stockCode}>{stockInfo.symbol}</Text>
            </View>
            <View style={styles.stockPriceInfo}>
              <Text style={styles.stockPrice}>{stockInfo.price}</Text>
              <Text style={[
                styles.stockChange, 
                stockInfo.changeClass === 'price-up' ? styles.priceUp : styles.priceDown
              ]}>
                {stockInfo.change}
              </Text>
            </View>
          </View>
        </View>

        {/* 表单区域 */}
        <View style={styles.formContainer}>
          {/* 合约代码 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>合约代码 *</Text>
            <TextInput
              style={[styles.textInput, formErrors.contractSymbol && styles.textInputError]}
              placeholder="格式：股票代码 类型 日期 行权价（如：AAPL CALL 20251215 180.00）"
              placeholderTextColor="#86868B"
              value={formData.contractSymbol}
              onChangeText={(value) => handleInputChange('contractSymbol', value)}
              onBlur={() => {
                // 当焦点失去时，尝试自动解析完整的期权代码
                const parsed = parseOptionContractCode(formData.contractSymbol);
                if (parsed && formData.contractSymbol.trim().split(/\s+/).length >= 4) {
                  handleCompleteOptionCode(formData.contractSymbol);
                }
              }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {formErrors.contractSymbol ? (
              <Text style={styles.errorMessage}>{formErrors.contractSymbol}</Text>
            ) : (
              formData.contractSymbol.trim().split(/\s+/).length >= 4 && 
              parseOptionContractCode(formData.contractSymbol) && (
                <Text style={styles.searchHintText}>✓ 代码已识别，已自动填充字段</Text>
              )
            )}
          </View>

          {/* 行权价 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>行权价 *</Text>
            <View style={styles.inputWithSymbol}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.textInputWithSymbol, formErrors.strikePrice && styles.textInputError]}
                placeholder="180.00"
                placeholderTextColor="#86868B"
                value={formData.strikePrice}
                onChangeText={(value) => handleInputChange('strikePrice', value)}
                keyboardType="numeric"
              />
            </View>
            {formErrors.strikePrice ? (
              <Text style={styles.errorMessage}>{formErrors.strikePrice}</Text>
            ) : null}
          </View>

          {/* 期权费 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>期权费 *</Text>
            <View style={styles.inputWithSymbol}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.textInputWithSymbol, formErrors.premium && styles.textInputError]}
                placeholder="3.45"
                placeholderTextColor="#86868B"
                value={formData.premium}
                onChangeText={(value) => handleInputChange('premium', value)}
                keyboardType="numeric"
              />
            </View>
            {formErrors.premium ? (
              <Text style={styles.errorMessage}>{formErrors.premium}</Text>
            ) : null}
          </View>

          {/* 到期日 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>到期日 *</Text>
            <TextInput
              style={[styles.textInput, formErrors.expirationDate && styles.textInputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#86868B"
              value={formData.expirationDate}
              onChangeText={(value) => handleInputChange('expirationDate', value)}
            />
            {formErrors.expirationDate ? (
              <Text style={styles.errorMessage}>{formErrors.expirationDate}</Text>
            ) : null}
          </View>

          {/* 合约类型选择 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>合约类型 *</Text>
            <View style={styles.contractTypeContainer}>
              <TouchableOpacity 
                style={styles.contractTypeOption}
                onPress={() => handleContractTypeSelect('CALL')}
              >
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioButtonInner,
                    formData.contractType === 'CALL' && styles.radioButtonSelected
                  ]} />
                </View>
                <Text style={styles.contractTypeText}>看涨期权 (CALL)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contractTypeOption}
                onPress={() => handleContractTypeSelect('PUT')}
              >
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioButtonInner,
                    formData.contractType === 'PUT' && styles.radioButtonSelected
                  ]} />
                </View>
                <Text style={styles.contractTypeText}>看跌期权 (PUT)</Text>
              </TouchableOpacity>
            </View>
            {formErrors.contractType ? (
              <Text style={styles.errorMessage}>{formErrors.contractType}</Text>
            ) : null}
          </View>
        </View>

        {/* 提示信息 */}
        <View style={styles.tipContainer}>
          <View style={styles.tipContent}>
            <FontAwesome6 name="circle-info" size={18} color="#5AC8FA" style={styles.tipIcon} />
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>如何填写期权合约</Text>
              <View style={styles.tipList}>
                <Text style={styles.tipItem}>方法一：输入完整期权代码（系统自动解析）</Text>
                <Text style={styles.tipItem}>  格式：股票代码 类型 YYYYMMDD 行权价</Text>
                <Text style={styles.tipItem}>  例如：AAPL CALL 20251215 180.00</Text>
                <Text style={styles.tipItem} />
                <Text style={styles.tipItem}>方法二：逐字段手动填写</Text>
                <Text style={styles.tipItem}>  • 在代码字段搜索股票代码（如：AAPL）</Text>
                <Text style={styles.tipItem}>  • 手动输入行权价、到期日、合约类型</Text>
                <Text style={styles.tipItem} />
                <Text style={styles.tipItem}>• 到期日期格式：YYYY-MM-DD（如：2025-12-15）</Text>
                <Text style={styles.tipItem}>• 行权价支持小数，如 180.50</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 成功提示模态框 */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <FontAwesome6 name="check" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>添加成功</Text>
            <Text style={styles.modalMessage}>期权合约已成功添加到关注列表</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessConfirm}>
              <Text style={styles.modalButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddOptionContractScreen;

