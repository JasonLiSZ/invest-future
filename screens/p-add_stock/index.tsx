

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface StockItem {
  symbol: string;
  name: string;
}

interface ToastState {
  visible: boolean;
  message: string;
}

type SearchState = 'hint' | 'loading' | 'results' | 'no-results';
const ALPHA_VANTAGE_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_KEY || 'QR0YUW1Z2WTD20U4';

const AddStockScreen: React.FC = () => {
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchState, setSearchState] = useState<SearchState>('hint');
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' });
  const [addingStocks, setAddingStocks] = useState<Set<string>>(new Set());
  
  const searchTimeoutRef = useRef<number | null>(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    // 自动聚焦搜索框
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, duration: number = 2000) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, duration);
  };

  const searchStocks = async (query: string) => {
    if (query.trim() === '') {
      setSearchState('hint');
      setSearchResults([]);
      return;
    }

    if (!ALPHA_VANTAGE_KEY) {
      setSearchState('no-results');
      setSearchResults([]);
      showToast('请先配置股票搜索 API 密钥');
      return;
    }

    setSearchState('loading');
    const requestId = ++searchRequestRef.current;

    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_KEY}`
      );

      if (!res.ok) {
        throw new Error('network');
      }

      const data = await res.json();
      const results = Array.isArray(data?.bestMatches)
        ? data.bestMatches.map((item: any) => ({
            symbol: item['1. symbol'],
            name: item['2. name'],
          }))
        : [];

      // 只保留当前请求的结果
      if (requestId !== searchRequestRef.current) return;

      setSearchResults(results);
      setSearchState(results.length > 0 ? 'results' : 'no-results');
    } catch (error) {
      if (requestId !== searchRequestRef.current) return;
      setSearchResults([]);
      setSearchState('no-results');
      showToast('搜索失败，请稍后重试');
    }
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 防抖搜索
    if (text.length >= 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchStocks(text);
      }, 500) as unknown as number;
    } else {
      setSearchState('hint');
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchState('hint');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleAddStock = async (symbol: string, name: string) => {
    // 显示添加中状态
    setAddingStocks(prev => new Set(prev).add(symbol));

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast('添加成功');
      
      // 延迟返回上一页
      setTimeout(() => {
        handleBackPress();
      }, 1000);
    } catch (error) {
      showToast('添加失败，请重试');
    } finally {
      setAddingStocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(symbol);
        return newSet;
      });
    }
  };

  const renderSearchHint = () => (
    <View style={styles.searchHintContainer}>
      <View style={styles.searchHintIcon}>
        <FontAwesome6 name="magnifying-glass" size={24} color="#86868B" />
      </View>
      <Text style={styles.searchHintTitle}>搜索美股股票</Text>
      <Text style={styles.searchHintSubtitle}>输入股票代码来查找您感兴趣的股票</Text>
    </View>
  );

  const renderSearchLoading = () => (
    <View style={styles.searchLoadingContainer}>
      <View style={styles.loadingSpinner} />
      <Text style={styles.searchLoadingText}>搜索中...</Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <View style={styles.noResultsIcon}>
        <FontAwesome6 name="magnifying-glass-minus" size={24} color="#86868B" />
      </View>
      <Text style={styles.noResultsTitle}>未找到相关股票</Text>
      <Text style={styles.noResultsSubtitle}>请检查股票代码是否正确，或尝试其他代码</Text>
    </View>
  );

  const renderStockItem = ({ item }: { item: StockItem }) => (
    <View style={styles.stockItem}>
      <View style={styles.stockItemContent}>
        <View style={styles.stockItemLeft}>
          <View style={styles.stockSymbolIcon}>
            <Text style={styles.stockSymbolText}>{item.symbol}</Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>{item.name}</Text>
            <Text style={styles.stockSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            addingStocks.has(item.symbol) && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddStock(item.symbol, item.name)}
          disabled={addingStocks.has(item.symbol)}
        >
          {addingStocks.has(item.symbol) ? (
            <>
              <View style={styles.addingSpinner} />
              <Text style={styles.addButtonText}>添加中...</Text>
            </>
          ) : (
            <>
              <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
              <Text style={styles.addButtonText}>添加</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResults = () => (
    <FlatList
      data={searchResults}
      renderItem={renderStockItem}
      keyExtractor={(item) => item.symbol}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );

  const renderSearchContent = () => {
    switch (searchState) {
      case 'hint':
        return renderSearchHint();
      case 'loading':
        return renderSearchLoading();
      case 'results':
        return renderSearchResults();
      case 'no-results':
        return renderNoResults();
      default:
        return renderSearchHint();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <FontAwesome6 name="chevron-left" size={16} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>添加股票</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 搜索区域 */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
              <FontAwesome6 name="magnifying-glass" size={16} color="#86868B" style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="输入股票代码，如 AAPL、TSLA"
                placeholderTextColor="#86868B"
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                autoComplete="off"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                  <FontAwesome6 name="xmark" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 搜索结果区域 */}
          <View style={styles.searchResultsContainer}>
            {renderSearchContent()}
          </View>
        </ScrollView>

        {/* Toast 提示 */}
        {toast.visible && (
          <View style={styles.toastContainer}>
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddStockScreen;

