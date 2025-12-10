

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';
import SettingItem from './components/SettingItem';
import RefreshModal from './components/RefreshModal';
import UnitModal from './components/UnitModal';
import AboutModal from './components/AboutModal';
import SuccessToast from './components/SuccessToast';

type RefreshFrequency = 'manual' | '5' | '10' | '15';
type CurrencyUnit = 'USD' | 'CNY' | 'HKD';

const SettingsScreen = () => {
  const router = useRouter();
  
  // 设置状态
  const [currentRefreshFrequency, setCurrentRefreshFrequency] = useState<RefreshFrequency>('5');
  const [currentCurrencyUnit, setCurrentCurrencyUnit] = useState<CurrencyUnit>('USD');
  
  // 弹窗状态
  const [isRefreshModalVisible, setIsRefreshModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  
  // Toast状态
  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleRefreshSettingPress = () => {
    setIsRefreshModalVisible(true);
  };

  const handleUnitSettingPress = () => {
    setIsUnitModalVisible(true);
  };

  const handleAboutSettingPress = () => {
    setIsAboutModalVisible(true);
  };

  const handleRefreshFrequencyChange = (frequency: RefreshFrequency) => {
    setCurrentRefreshFrequency(frequency);
    setIsRefreshModalVisible(false);
    showSuccessToast();
  };

  const handleCurrencyUnitChange = (unit: CurrencyUnit) => {
    setCurrentCurrencyUnit(unit);
    setIsUnitModalVisible(false);
    showSuccessToast();
  };

  const showSuccessToast = () => {
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2000);
  };

  const getRefreshFrequencyText = (frequency: RefreshFrequency): string => {
    switch (frequency) {
      case 'manual':
        return '手动刷新';
      case '5':
        return '每5分钟';
      case '10':
        return '每10分钟';
      case '15':
        return '每15分钟';
      default:
        return '每5分钟';
    }
  };

  const getCurrencyUnitText = (unit: CurrencyUnit): string => {
    switch (unit) {
      case 'USD':
        return '美元 ($)';
      case 'CNY':
        return '人民币 (¥)';
      case 'HKD':
        return '港币 (HK$)';
      default:
        return '美元 ($)';
    }
  };

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
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* 主要内容区域 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 设置项列表 */}
          <View style={styles.settingsList}>
            {/* 数据刷新频率设置 */}
            <SettingItem
              icon="arrows-rotate"
              iconColor="#007AFF"
              title="数据刷新频率"
              subtitle={getRefreshFrequencyText(currentRefreshFrequency)}
              onPress={handleRefreshSettingPress}
            />

            {/* 单位设置 */}
            <SettingItem
              icon="calculator"
              iconColor="#5856D6"
              title="单位设置"
              subtitle={getCurrencyUnitText(currentCurrencyUnit)}
              onPress={handleUnitSettingPress}
            />

            {/* 关于我们 */}
            <SettingItem
              icon="circle-info"
              iconColor="#5AC8FA"
              title="关于我们"
              subtitle="版本信息、隐私政策等"
              onPress={handleAboutSettingPress}
            />
          </View>
        </View>
      </ScrollView>

      {/* 数据刷新频率选择弹窗 */}
      <RefreshModal
        visible={isRefreshModalVisible}
        currentFrequency={currentRefreshFrequency}
        onClose={() => setIsRefreshModalVisible(false)}
        onConfirm={handleRefreshFrequencyChange}
      />

      {/* 单位设置选择弹窗 */}
      <UnitModal
        visible={isUnitModalVisible}
        currentUnit={currentCurrencyUnit}
        onClose={() => setIsUnitModalVisible(false)}
        onConfirm={handleCurrencyUnitChange}
      />

      {/* 关于我们弹窗 */}
      <AboutModal
        visible={isAboutModalVisible}
        onClose={() => setIsAboutModalVisible(false)}
      />

      {/* 成功提示Toast */}
      <SuccessToast visible={isToastVisible} />
    </SafeAreaView>
  );
};

export default SettingsScreen;

