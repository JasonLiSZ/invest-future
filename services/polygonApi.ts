/**
 * Polygon.io API Service
 * 用于获取期权的 Greeks 和隐含波动率数据
 */

const POLYGON_API_KEY = 'm90E7FrZvZ5lYAhjmZappFop5_2Km4xi';
const BASE_URL = 'https://api.polygon.io';

export interface OptionGreeks {
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
}

export interface OptionSnapshot {
  ticker: string;
  impliedVolatility?: number;
  greeks?: OptionGreeks;
  lastPrice?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  openInterest?: number;
}

/**
 * 构建期权 ticker 格式
 * 格式: O:AAPL250117C00150000
 * O: 表示期权
 * AAPL: 标的股票
 * 250117: 到期日 YYMMDD
 * C: Call 或 P: Put
 * 00150000: 行权价 (乘以1000，补齐8位)
 */
export function buildOptionTicker(
  symbol: string,
  expiration: string, // YYYY-MM-DD
  optionType: 'call' | 'put',
  strike: number
): string {
  // 转换日期格式 YYYY-MM-DD -> YYMMDD
  const dateParts = expiration.split('-');
  const year = dateParts[0].slice(2); // 取后两位
  const month = dateParts[1];
  const day = dateParts[2];
  const dateStr = `${year}${month}${day}`;
  
  // 转换期权类型
  const typeChar = optionType === 'call' ? 'C' : 'P';
  
  // 转换行权价：乘以1000并补齐8位
  const strikeInt = Math.round(strike * 1000);
  const strikeStr = strikeInt.toString().padStart(8, '0');
  
  return `O:${symbol}${dateStr}${typeChar}${strikeStr}`;
}

/**
 * 获取单个期权的快照数据（包含 Greeks 和 IV）
 */
export async function getOptionSnapshot(
  symbol: string,
  expiration: string,
  optionType: 'call' | 'put',
  strike: number
): Promise<OptionSnapshot | null> {
  try {
    const ticker = buildOptionTicker(symbol, expiration, optionType, strike);
    const url = `${BASE_URL}/v3/snapshot/options/${symbol}/${ticker}?apiKey=${POLYGON_API_KEY}`;
    
    console.log('[Polygon API] Fetching snapshot:', ticker);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[Polygon API] Error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      console.error('[Polygon API] No data:', data);
      return null;
    }
    
    const result = data.results;
    
    return {
      ticker,
      impliedVolatility: result.implied_volatility,
      greeks: result.greeks ? {
        delta: result.greeks.delta,
        gamma: result.greeks.gamma,
        theta: result.greeks.theta,
        vega: result.greeks.vega,
        rho: result.greeks.rho,
      } : undefined,
      lastPrice: result.last_quote?.last_price || result.day?.close,
      bid: result.last_quote?.bid,
      ask: result.last_quote?.ask,
      volume: result.day?.volume,
      openInterest: result.open_interest,
    };
  } catch (error) {
    console.error('[Polygon API] Error fetching option snapshot:', error);
    return null;
  }
}

/**
 * 批量获取多个期权的快照数据
 * 注意：免费版有速率限制（每分钟5个请求），需要添加延迟
 */
export async function getMultipleOptionSnapshots(
  options: Array<{
    symbol: string;
    expiration: string;
    optionType: 'call' | 'put';
    strike: number;
  }>
): Promise<Map<string, OptionSnapshot>> {
  const results = new Map<string, OptionSnapshot>();
  
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const ticker = buildOptionTicker(opt.symbol, opt.expiration, opt.optionType, opt.strike);
    
    const snapshot = await getOptionSnapshot(
      opt.symbol,
      opt.expiration,
      opt.optionType,
      opt.strike
    );
    
    if (snapshot) {
      results.set(ticker, snapshot);
    }
    
    // 添加延迟以避免速率限制（免费版：每分钟5个请求 = 12秒/请求）
    if (i < options.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 12000));
    }
  }
  
  return results;
}

/**
 * 获取期权链数据（某个标的的所有期权）
 */
export async function getOptionsChain(
  symbol: string,
  expirationDate?: string,
  strikePrice?: number
): Promise<any> {
  try {
    let url = `${BASE_URL}/v3/snapshot/options/${symbol}?apiKey=${POLYGON_API_KEY}`;
    
    if (expirationDate) {
      url += `&expiration_date=${expirationDate}`;
    }
    if (strikePrice) {
      url += `&strike_price=${strikePrice}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[Polygon API] Error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Polygon API] Error fetching options chain:', error);
    return null;
  }
}
