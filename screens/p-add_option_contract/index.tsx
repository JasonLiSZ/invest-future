

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface StockInfo {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeClass: 'price-up' | 'price-down';
}

interface FormData {
  contractSymbol: string;
  strikePrice: string;
  expirationDate: string;
  premium: string;
  contractType: 'CALL' | 'PUT' | '';
}

interface FormErrors {
  contractSymbol: string;
  strikePrice: string;
  expirationDate: string;
  premium: string;
  contractType: string;
}

const AddOptionContractScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    symbol: 'AAPL',
    name: '苹果公司',
    price: '$175.43',
    change: '+2.34 (+1.35%)',
    changeClass: 'price-up'
  });

  const [formData, setFormData] = useState<FormData>({
    contractSymbol: '',
    strikePrice: '',
    expirationDate: '',
    premium: '',
    contractType: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    contractSymbol: '',
    strikePrice: '',
    expirationDate: '',
    premium: '',
    contractType: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // 模拟股票数据
  const mockStocks: Record<string, StockInfo> = {
    'aapl': { 
      symbol: 'AAPL', 
      name: '苹果公司', 
      price: '$175.43', 
      change: '+2.34 (+1.35%)',
      changeClass: 'price-up'
    },
    'tsla': { 
      symbol: 'TSLA', 
      name: '特斯拉', 
      price: '$248.87', 
      change: '-5.67 (-2.23%)',
      changeClass: 'price-down'
    },
    'msft': { 
      symbol: 'MSFT', 
      name: '微软', 
      price: '$378.91', 
      change: '+1.89 (+0.50%)',
      changeClass: 'price-up'
    }
  };

  useEffect(() => {
    const stockId = (params.stockId as string) || 'aapl';
    const stock = mockStocks[stockId.toLowerCase()] || mockStocks['aapl'];
    setStockInfo(stock);
    
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
      premium: '',
      contractType: ''
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

    if (!formData.premium) {
      errors.premium = '请输入期权费';
      isValid = false;
    } else if (parseFloat(formData.premium) < 0) {
      errors.premium = '期权费不能为负数';
      isValid = false;
    }

    if (!formData.contractType) {
      errors.contractType = '请选择合约类型';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSavePress = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // 模拟保存过程
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

  const handleContractTypeSelect = (type: 'CALL' | 'PUT') => {
    handleInputChange('contractType', type);
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
              placeholder="如：AAPL 12/15/23 180.00 CALL"
              placeholderTextColor="#86868B"
              value={formData.contractSymbol}
              onChangeText={(value) => handleInputChange('contractSymbol', value)}
            />
            {formErrors.contractSymbol ? (
              <Text style={styles.errorMessage}>{formErrors.contractSymbol}</Text>
            ) : null}
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
              <Text style={styles.tipTitle}>温馨提示</Text>
              <View style={styles.tipList}>
                <Text style={styles.tipItem}>• 合约代码格式建议：股票代码 到期日 行权价 类型</Text>
                <Text style={styles.tipItem}>• 行权价和期权费请输入数字，支持两位小数</Text>
                <Text style={styles.tipItem}>• 到期日请选择未来的日期</Text>
                <Text style={styles.tipItem}>• 添加后可在关注列表中查看和管理此合约</Text>
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

