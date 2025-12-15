

import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

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

interface PositionCardProps {
  position: PositionData;
}

const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const isPositive = (value: number) => value >= 0;
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatSignedCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${value.toFixed(2)}`;
  };
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const renderOpenPositionContent = () => (
    <>
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>平均价格</Text>
          <Text style={[
            styles.gridValue,
            position.averagePrice < 0 ? styles.negativeValue : null
          ]}>{formatSignedCurrency(position.averagePrice)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>未平仓数量</Text>
          <Text style={styles.gridValue}>{position.quantity} 份</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>当前价值</Text>
          <Text style={styles.gridValue}>{formatCurrency(position.currentValue)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>到期日</Text>
          <Text style={styles.gridValue}>{formatDate(position.expirationDate)}</Text>
        </View>
      </View>

      <View style={styles.gridRowThree}>
        <View style={styles.gridItemThree}>
          <Text style={styles.gridLabel}>剩余天数</Text>
          <Text style={styles.gridValue}>{position.daysRemaining}天</Text>
        </View>
        <View style={styles.gridItemThree}>
          <Text style={styles.gridLabel}>持有天数</Text>
          <Text style={styles.gridValue}>{position.daysHeld}天</Text>
        </View>
        <View style={styles.gridItemThree}>
          <Text style={styles.gridLabel}>盈亏金额</Text>
          <Text style={[
            styles.gridValue,
            isPositive(position.profitLoss) ? styles.positiveValue : styles.negativeValue
          ]}>
            {isPositive(position.profitLoss) ? '+' : ''}{formatCurrency(position.profitLoss)}
          </Text>
        </View>
      </View>

      <View style={styles.profitLossRow}>
        <Text style={styles.profitLossLabel}>盈亏比例</Text>
        <Text style={[
          styles.profitLossValue,
          isPositive(position.profitLossPercent) ? styles.positiveValue : styles.negativeValue
        ]}>
          {isPositive(position.profitLossPercent) ? '+' : ''}{formatPercent(position.profitLossPercent)}
        </Text>
      </View>
    </>
  );

  const renderClosedPositionContent = () => (
    <>
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>平均价格</Text>
          <Text style={[
            styles.gridValue,
            position.averagePrice < 0 ? styles.negativeValue : null
          ]}>{formatSignedCurrency(position.averagePrice)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>平仓价格</Text>
          <Text style={styles.gridValue}>{formatCurrency(position.closePrice || 0)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>持有天数</Text>
          <Text style={styles.gridValue}>{position.daysHeld}天</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>交易数量</Text>
          <Text style={styles.gridValue}>{position.quantity} 份</Text>
        </View>
      </View>

      <View style={styles.gridRowTwo}>
        <View style={styles.gridItemTwo}>
          <Text style={styles.gridLabel}>盈亏金额</Text>
          <Text style={[
            styles.gridValue,
            isPositive(position.profitLoss) ? styles.positiveValue : styles.negativeValue
          ]}>
            {isPositive(position.profitLoss) ? '+' : ''}{formatCurrency(position.profitLoss)}
          </Text>
        </View>
        <View style={styles.gridItemTwo}>
          <Text style={styles.gridLabel}>盈亏比例</Text>
          <Text style={[
            styles.gridValue,
            isPositive(position.profitLossPercent) ? styles.positiveValue : styles.negativeValue
          ]}>
            {isPositive(position.profitLossPercent) ? '+' : ''}{formatPercent(position.profitLossPercent)}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.contractInfo}>
            <Text style={styles.contractName}>{position.contract}</Text>
            <View style={[
              styles.typeTag,
              position.type === 'call' ? styles.callTag : styles.putTag
            ]}>
              <Text style={styles.typeTagText}>
                {position.type === 'call' ? '看涨' : '看跌'}
              </Text>
            </View>
          </View>
          <Text style={styles.companyName}>{position.company}</Text>
        </View>
        <View style={styles.headerRight}>
          {position.isClosed ? (
            <>
              <Text style={styles.closedLabel}>已平仓</Text>
              <Text style={styles.closeDate}>{formatDate(position.closeDate || '')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.currentPrice}>{formatCurrency(position.currentPrice)}</Text>
              <Text style={[
                styles.priceChange,
                isPositive(position.priceChange) ? styles.positiveValue : styles.negativeValue
              ]}>
                {isPositive(position.priceChange) ? '+' : ''}{formatCurrency(position.priceChange)} ({isPositive(position.priceChangePercent) ? '+' : ''}{formatPercent(position.priceChangePercent)})
              </Text>
            </>
          )}
        </View>
      </View>

      {position.isClosed ? renderClosedPositionContent() : renderOpenPositionContent()}
    </View>
  );
};

export default PositionCard;

