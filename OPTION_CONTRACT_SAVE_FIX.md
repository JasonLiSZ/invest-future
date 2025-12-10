# 期权合约保存功能修复

## 问题描述
点击"保存"按钮后，期权合约没有被添加到关注列表相应的股票代码之下。

## 根本原因
`screens/p-add_option_contract/index.tsx` 中的 `handleSavePress` 函数只是模拟了保存过程（延迟 1500ms），**没有实际将数据保存到 AsyncStorage**。

**原始代码（有问题）：**
```typescript
const handleSavePress = async () => {
  if (validateForm()) {
    setIsLoading(true);
    
    try {
      // 模拟保存过程 ← 这里只是延迟，没有保存数据！
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }
};
```

## 修复方案

### 1. 添加依赖导入
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### 2. 添加类型定义
新增两个接口用于处理关注列表数据：

```typescript
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
}
```

### 3. 添加常量
```typescript
const FOLLOW_LIST_KEY = 'followList';
```

### 4. 实现完整的保存逻辑
**修复后的 `handleSavePress` 函数：**

```typescript
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
        premium: formData.premium,
        type: formData.contractType === 'CALL' ? 'call' : 'put',
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
```

## 工作流程说明

1. **验证表单** - 检查所有必填字段是否有效
2. **提取股票代码** - 从合约代码中提取第一个单词作为股票符号（如 `AAPL CALL 20251215 180.00` → `AAPL`）
3. **读取现有数据** - 从 AsyncStorage 读取关注列表（如果不存在则为空数组）
4. **查找或创建股票记录** - 检查该股票是否已在列表中，如果没有则创建新记录
5. **创建期权合约** - 根据表单数据创建新的合约对象，包含：
   - `id` - 唯一标识符（基于时间戳）
   - `symbol` - 完整的合约代码
   - `strikePrice` - 行权价
   - `expirationDate` - 到期日期
   - `premium` - 期权费
   - `type` - 合约类型（'call' 或 'put'）
6. **保存到 AsyncStorage** - 将更新后的完整列表保存到本地存储
7. **显示成功提示** - 延迟 1500ms 后显示成功模态框

## 数据结构示例

### 保存前（关注列表为空）
```json
[]
```

### 第一次添加合约后（AAPL CALL 20251215 180.00）
```json
[
  {
    "id": "aapl",
    "symbol": "AAPL",
    "name": "苹果公司",
    "currentPrice": "$175.43",
    "change": "+2.34",
    "changePercent": "0%",
    "isUp": true,
    "contracts": [
      {
        "id": "contract-1765353900062",
        "symbol": "AAPL CALL 20251215 180.00",
        "strikePrice": "180.00",
        "expirationDate": "2025-12-15",
        "premium": "3.45",
        "type": "call"
      }
    ],
    "details": { ... }
  }
]
```

### 添加第二个合约后（同一股票 AAPL PUT 20251220 175.00）
```json
[
  {
    "id": "aapl",
    "symbol": "AAPL",
    "name": "苹果公司",
    "currentPrice": "$175.43",
    "change": "+2.34",
    "changePercent": "0%",
    "isUp": true,
    "contracts": [
      {
        "id": "contract-1765353900062",
        "symbol": "AAPL CALL 20251215 180.00",
        "strikePrice": "180.00",
        "expirationDate": "2025-12-15",
        "premium": "3.45",
        "type": "call"
      },
      {
        "id": "contract-1765353900112",
        "symbol": "AAPL PUT 20251220 175.00",
        "strikePrice": "175.00",
        "expirationDate": "2025-12-20",
        "premium": "2.50",
        "type": "put"
      }
    ],
    "details": { ... }
  }
]
```

## 测试验证

已通过以下测试场景验证修复：

✅ **测试 1** - 添加第一个期权合约到新股票
- 输入: `AAPL CALL 20251215 180.00`
- 结果: AAPL 股票被创建，包含 1 个合约

✅ **测试 2** - 添加第二个期权合约到同一股票
- 输入: `AAPL PUT 20251220 175.00`
- 结果: AAPL 股票下现有 2 个合约

✅ **测试 3** - 添加期权合约到不同股票
- 输入: `TSLA CALL 20250110 250.00`
- 结果: TSLA 股票被创建，包含 1 个合约
- 验证: AAPL 仍然保留 2 个合约

## 集成说明

该修复已集成到 `screens/p-add_option_contract/index.tsx`，并与现有的 `p-follow_list` 屏幕的数据读取机制兼容。

关注列表在以下时机加载：
- 用户进入关注列表屏幕时（通过 `useFocusEffect` hook）
- 每次屏幕获得焦点时重新加载数据

这确保添加的期权合约在返回关注列表屏幕时会立即显示。
