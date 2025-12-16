/**
 * Polygon.io API 测试文件
 * 用于验证 API 集成是否正常工作
 */

import { buildOptionTicker, getOptionSnapshot } from './polygonApi';

// 测试期权 ticker 构建
console.log('测试期权 ticker 构建:');
console.log('AAPL 2025-01-17 Call 150:', buildOptionTicker('AAPL', '2025-01-17', 'call', 150));
// 预期输出: O:AAPL250117C00150000

console.log('TSLA 2025-03-21 Put 200.50:', buildOptionTicker('TSLA', '2025-03-21', 'put', 200.5));
// 预期输出: O:TSLA250321P00200500

// 测试获取期权快照（实际API调用）
async function testOptionSnapshot() {
  console.log('\n测试获取期权快照数据:');
  
  try {
    const snapshot = await getOptionSnapshot('AAPL', '2025-01-17', 'call', 150);
    
    if (snapshot) {
      console.log('成功获取数据!');
      console.log('Ticker:', snapshot.ticker);
      console.log('隐含波动率:', snapshot.impliedVolatility ? (snapshot.impliedVolatility * 100).toFixed(2) + '%' : 'N/A');
      console.log('Greeks:');
      console.log('  Delta:', snapshot.greeks?.delta || 'N/A');
      console.log('  Gamma:', snapshot.greeks?.gamma || 'N/A');
      console.log('  Theta:', snapshot.greeks?.theta || 'N/A');
      console.log('  Vega:', snapshot.greeks?.vega || 'N/A');
      console.log('  Rho:', snapshot.greeks?.rho || 'N/A');
      console.log('最新价格:', snapshot.lastPrice || 'N/A');
      console.log('成交量:', snapshot.volume || 'N/A');
    } else {
      console.log('未获取到数据');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 取消注释以运行实际API测试
// testOptionSnapshot();
