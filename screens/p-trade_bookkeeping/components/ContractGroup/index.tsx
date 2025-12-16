

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';
import TradeRecord from '../TradeRecord';

interface TradeRecordType {
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
  tradeRecords: TradeRecordType[];
}

interface ContractGroupProps {
  data: ContractGroupData;
  onEditTrade: (tradeId: string) => void;
  onClosePosition: (tradeId: string) => void;
  onDeleteTrade: (tradeId: string) => void;
}

const ContractGroup: React.FC<ContractGroupProps> = ({
  data,
  onEditTrade,
  onClosePosition,
  onDeleteTrade,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const formatContractTitle = () => {
    return `${data.symbol} ${data.expiration} ${data.strike.toFixed(2)} ${data.type.toUpperCase()}`;
  };

  const getContractTypeColor = () => {
    return data.type === 'call' ? '#5856D6' : '#FF9500';
  };

  const getContractTypeText = () => {
    return data.type === 'call' ? '看涨' : '看跌';
  };

  const getPnlColor = () => {
    return data.pnl >= 0 ? '#FF3B30' : '#34C759';
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <View style={styles.container}>
      {/* 合约组头部 */}
      <TouchableOpacity style={styles.header} onPress={handleToggleExpand}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Text style={styles.contractTitle}>{formatContractTitle()}</Text>
              <View style={[styles.typeTag, { backgroundColor: getContractTypeColor() }]}>
                <Text style={styles.typeTagText}>{getContractTypeText()}</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>平均价格:</Text>
                <Text style={styles.statValue}>{formatCurrency(data.averagePrice)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>数量:</Text>
                <Text style={styles.statValue}>{data.quantity}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>当前价值:</Text>
                <Text style={styles.statValue}>{formatCurrency(data.currentValue)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.pnlValue, { color: getPnlColor() }]}>
              {data.pnl >= 0 ? '+' : ''}{formatCurrency(data.pnl)}
            </Text>
            <Text style={[styles.pnlPercent, { color: getPnlColor() }]}>{formatPercent(data.pnlPercent)}</Text>
          </View>
          <View style={styles.expandButton}>
            <FontAwesome6
              name="chevron-down"
              size={14}
              color="#86868B"
              style={[
                styles.expandIcon,
                isExpanded && styles.expandIconRotated,
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* 交易记录列表 */}
      {isExpanded && (
        <View style={styles.recordsContainer}>
          {data.tradeRecords.map((record) => (
            <TradeRecord
              key={record.id}
              data={record}
              onEdit={() => onEditTrade(record.id)}
              onClosePosition={() => onClosePosition(record.id)}
              onDelete={() => onDeleteTrade(record.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ContractGroup;

