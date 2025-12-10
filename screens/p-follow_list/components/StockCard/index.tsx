

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface OptionContract {
  id: string;
  symbol: string;
  strikePrice: string;
  expirationDate: string;
  premium: string;
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
  isRefreshing?: boolean;
}

interface StockCardProps {
  stock: StockData;
  onDeleteStock: (stockId: string) => void;
  onAddContract: (stockId: string) => void;
  onDeleteContract: (contractId: string) => void;
  onBookkeepContract: (contractId: string) => void;
  onRefreshStock: (stockId: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onDeleteStock,
  onAddContract,
  onDeleteContract,
  onBookkeepContract,
  onRefreshStock,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prevState => !prevState);
  }, []);

  const handleDeleteStock = useCallback(() => {
    onDeleteStock(stock.id);
  }, [stock.id, onDeleteStock]);

  const handleAddContract = useCallback(() => {
    onAddContract(stock.id);
  }, [stock.id, onAddContract]);

  const handleRefreshStock = useCallback(() => {
    onRefreshStock(stock.id);
  }, [stock.id, onRefreshStock]);

  const renderStockDetails = () => {
    if (!isExpanded) return null;

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>5日均价</Text>
            <Text style={styles.detailValue}>{stock.details.fiveDayAvg}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>5日最低</Text>
            <Text style={styles.detailValue}>{stock.details.fiveDayLow}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>5日最高</Text>
            <Text style={styles.detailValue}>{stock.details.fiveDayHigh}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>30日均价</Text>
            <Text style={styles.detailValue}>{stock.details.thirtyDayAvg}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>30日最低</Text>
            <Text style={styles.detailValue}>{stock.details.thirtyDayLow}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>30日最高</Text>
            <Text style={styles.detailValue}>{stock.details.thirtyDayHigh}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>52周均价</Text>
            <Text style={styles.detailValue}>{stock.details.fiftyTwoWeekAvg}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>52周最低</Text>
            <Text style={styles.detailValue}>{stock.details.fiftyTwoWeekLow}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>公允价值</Text>
            <Text style={styles.detailValue}>{stock.details.fairValue}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOptionContracts = () => {
    if (!isExpanded) return null;

    return (
      <View style={styles.contractsContainer}>
        <View style={styles.contractsHeader}>
          <Text style={styles.contractsTitle}>期权合约</Text>
          <TouchableOpacity onPress={handleAddContract}>
            <View style={styles.addContractButton}>
              <FontAwesome6 name="plus" size={12} color="#007AFF" style={styles.addContractIcon} />
              <Text style={styles.addContractText}>添加合约</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contractsList}>
          {stock.contracts.map((contract) => (
            <View key={contract.id} style={styles.contractItem}>
              <View style={styles.contractInfo}>
                <View style={styles.contractHeader}>
                  <Text style={styles.contractSymbol}>{contract.symbol}</Text>
                  <View style={[
                    styles.contractTypeTag,
                    contract.type === 'call' ? styles.callTag : styles.putTag
                  ]}>
                    <Text style={styles.contractTypeText}>
                      {contract.type === 'call' ? '看涨' : '看跌'}
                    </Text>
                  </View>
                </View>
                <View style={styles.contractDetails}>
                  <Text style={styles.contractDetailText}>行权价: {contract.strikePrice}</Text>
                  <Text style={styles.contractDetailText}>到期日: {contract.expirationDate}</Text>
                  <Text style={styles.contractDetailText}>期权费: {contract.premium}</Text>
                </View>
              </View>
              <View style={styles.contractActions}>
                <TouchableOpacity
                  style={styles.bookkeepButton}
                  onPress={() => onBookkeepContract(contract.id)}
                >
                  <FontAwesome5 name="edit" size={12} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteContractButton}
                  onPress={() => onDeleteContract(contract.id)}
                >
                  <FontAwesome6 name="trash" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStockActions = () => {
    if (!isExpanded) return null;

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshStock}>
          <FontAwesome5 
            name="sync-alt" 
            size={12} 
            color="#1D1D1F" 
            style={[
              styles.refreshIcon,
              stock.isRefreshing && styles.refreshIconRotating
            ]} 
          />
          <Text style={styles.refreshButtonText}>刷新数据</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteStock}>
          <FontAwesome6 name="trash" size={12} color="#FFFFFF" style={styles.deleteIcon} />
          <Text style={styles.deleteButtonText}>删除股票</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* 股票基本信息 */}
      <TouchableOpacity style={styles.stockHeader} onPress={handleToggleExpand}>
        <View style={styles.stockInfo}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>{stock.symbol}</Text>
          </View>
          <View style={styles.stockDetails}>
            <Text style={styles.stockName}>{stock.name}</Text>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.currentPrice}>{stock.currentPrice}</Text>
          <Text style={[
            styles.priceChange,
            stock.isUp ? styles.priceUp : styles.priceDown
          ]}>
            {stock.change} ({stock.changePercent})
          </Text>
        </View>
        <View style={styles.expandButton}>
          <FontAwesome6 
            name="chevron-down" 
            size={14} 
            color="#86868B" 
            style={[
              styles.expandIcon,
              isExpanded && styles.expandIconRotated
            ]} 
          />
        </View>
      </TouchableOpacity>

      {/* 股票详细数据 */}
      {renderStockDetails()}

      {/* 期权合约列表 */}
      {renderOptionContracts()}

      {/* 股票操作按钮 */}
      {renderStockActions()}
    </View>
  );
};

export default StockCard;

