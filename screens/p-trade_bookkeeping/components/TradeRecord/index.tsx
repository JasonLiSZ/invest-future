

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

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

interface TradeRecordProps {
  data: TradeRecord;
  onEdit: () => void;
  onClosePosition: () => void;
  onDelete: () => void;
}

const TradeRecord: React.FC<TradeRecordProps> = ({
  data,
  onEdit,
  onClosePosition,
  onDelete,
}) => {
  const getTradeTypeColor = () => {
    return data.type === 'buy' ? '#34C759' : '#FF3B30';
  };

  const getTradeTypeText = () => {
    return data.type === 'buy' ? '买入' : '卖出';
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <FontAwesome6 name="pen" size={12} color="#FFFFFF" />
        </TouchableOpacity>
        {!data.isClosing && (
          <TouchableOpacity style={styles.closeButton} onPress={onClosePosition}>
            <FontAwesome6 name="arrow-right-from-bracket" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <FontAwesome6 name="trash" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, data.isClosing && styles.closingContainer]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.titleRow}>
            <Text style={styles.date}>{data.date}</Text>
            <View style={[styles.typeTag, { backgroundColor: getTradeTypeColor() }]}>
              <Text style={styles.typeTagText}>{getTradeTypeText()}</Text>
            </View>
            {data.isClosing && (
              <View style={styles.closingTag}>
                <Text style={styles.closingTagText}>平仓</Text>
              </View>
            )}
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>期权费: {formatCurrency(data.premium)}</Text>
            <Text style={styles.detailText}>数量: {data.quantity}</Text>
            <Text style={styles.detailText}>总价值: {formatCurrency(data.totalValue)}</Text>
            {data.profit && (
              <Text style={styles.profitText}>盈利: {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit)}</Text>
            )}
          </View>
        </View>
        {renderActionButtons()}
      </View>
    </View>
  );
};

export default TradeRecord;

