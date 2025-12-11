// Alpha Vantage API Key - 从环境变量读取，与 p-add_stock 保持一致
const ALPHA_VANTAGE_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_KEY || 'QR0YUW1Z2WTD20U4';

interface StockDetails {
  fiveDayAvg: string;
  fiveDayLow: string;
  fiveDayHigh: string;
  thirtyDayAvg: string;
  thirtyDayLow: string;
  thirtyDayHigh: string;
  fiftyTwoWeekAvg: string;
  fiftyTwoWeekLow: string;
  fairValue: string;
}

export interface StockPrice {
  currentPrice: string;
  change: string;
  changePercent: string;
  isUp: boolean;
}

/**
 * 获取股票当前价格和涨跌幅
 * @param symbol 股票代码，如 AAPL
 * @returns 返回当前价格和涨跌幅
 */
export const fetchStockPrice = async (symbol: string): Promise<StockPrice | null> => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || !quote['05. price']) {
      console.warn(`No price data available for symbol: ${symbol}`);
      return null;
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change'] || '0');
    const changePercent = parseFloat(quote['10. change percent'] || '0');

    return {
      currentPrice: `$${price.toFixed(2)}`,
      change: change >= 0 ? `+${change.toFixed(2)}` : `${change.toFixed(2)}`,
      changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
      isUp: change >= 0,
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
};

/**
 * 获取股票详细数据
 * @param symbol 股票代码，如 AAPL
 * @returns 返回股票的详细价格数据
 */
export const fetchStockDetails = async (symbol: string): Promise<StockDetails | null> => {
  try {
    // 使用 Alpha Vantage API 获取每日数据
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // 检查是否有有效的时间序列数据
    if (!data['Time Series (Daily)']) {
      console.warn(`No data available for symbol: ${symbol}`);
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).sort().reverse(); // 最新的日期在前

    if (dates.length === 0) {
      return null;
    }

    // 提取数据
    const fiveDayData = dates.slice(0, 5);
    const thirtyDayData = dates.slice(0, 30);
    const fiftyTwoWeekData = dates.slice(0, 252); // 一年约252个交易日

    // 计算5日数据
    const fiveDayPrices = fiveDayData.map(date => parseFloat(timeSeries[date]['4. close']));
    const fiveDayAvg = (fiveDayPrices.reduce((a, b) => a + b, 0) / fiveDayPrices.length).toFixed(2);
    const fiveDayLow = Math.min(...fiveDayPrices).toFixed(2);
    const fiveDayHigh = Math.max(...fiveDayPrices).toFixed(2);

    // 计算30日数据
    const thirtyDayPrices = thirtyDayData.map(date => parseFloat(timeSeries[date]['4. close']));
    const thirtyDayAvg = (thirtyDayPrices.reduce((a, b) => a + b, 0) / thirtyDayPrices.length).toFixed(2);
    const thirtyDayLow = Math.min(...thirtyDayPrices).toFixed(2);
    const thirtyDayHigh = Math.max(...thirtyDayPrices).toFixed(2);

    // 计算52周数据
    const fiftyTwoWeekPrices = fiftyTwoWeekData.map(date => parseFloat(timeSeries[date]['4. close']));
    const fiftyTwoWeekAvg = (fiftyTwoWeekPrices.reduce((a, b) => a + b, 0) / fiftyTwoWeekPrices.length).toFixed(2);
    const fiftyTwoWeekLow = Math.min(...fiftyTwoWeekPrices).toFixed(2);

    // 计算合理价值（使用52周平均值作为合理价值）
    const fairValue = fiftyTwoWeekAvg;

    return {
      fiveDayAvg: `$${fiveDayAvg}`,
      fiveDayLow: `$${fiveDayLow}`,
      fiveDayHigh: `$${fiveDayHigh}`,
      thirtyDayAvg: `$${thirtyDayAvg}`,
      thirtyDayLow: `$${thirtyDayLow}`,
      thirtyDayHigh: `$${thirtyDayHigh}`,
      fiftyTwoWeekAvg: `$${fiftyTwoWeekAvg}`,
      fiftyTwoWeekLow: `$${fiftyTwoWeekLow}`,
      fairValue: `$${fairValue}`,
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    return null;
  }
};
