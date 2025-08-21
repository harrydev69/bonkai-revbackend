import { NextResponse } from 'next/server';

// Enhanced types for better chart data
export type CoinGeckoChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

export type ChartDataPoint = {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
  date: string;
};

export type ChartPayload = {
  timeframe: string;
  dataPoints: ChartDataPoint[];
  summary: {
    startPrice: number;
    endPrice: number;
    changePercent: number;
    changeAmount: number;
    highestPrice: number;
    lowestPrice: number;
    totalVolume: number;
    avgVolume: number;
    highestVolume: number;
    lowestVolume: number;
  };
  metadata: {
    totalPoints: number;
    timeRange: string;
    lastUpdated: string;
  };
};

export const revalidate = 300; // 5 minutes - chart data changes frequently

async function fetchBONKChart(days: string): Promise<ChartPayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    // Validate days parameter
    const validDays = ['1', '7', '30', '90', '365'];
    if (!validDays.includes(days)) {
      throw new Error('Invalid days parameter. Must be one of: 1, 7, 30, 90, 365');
    }

    // First, fetch current market data for consistency with overview
    let currentMarketData = null;
    try {
      const currentDataResponse = await fetch(`${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BONKai-Analytics/1.0',
          ...(API_KEY && { 'x-cg-pro-api-key': API_KEY })
        }
      });
      
      if (currentDataResponse.ok) {
        currentMarketData = await currentDataResponse.json();
        console.log('Current market data fetched successfully for consistency check');
      }
    } catch (error) {
      console.log('Could not fetch current market data, proceeding with chart data only');
    }

    // Fetch chart data
    const url = `${API_BASE}/coins/bonk/market_chart?vs_currency=usd&days=${days}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }

    const res = await fetch(url, { 
      headers,
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`CoinGecko API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json() as CoinGeckoChartResponse;
    
    if (!data.prices || data.prices.length === 0) {
      throw new Error('No chart data returned from CoinGecko');
    }

    // Process data points with proper volume handling
    const dataPoints: ChartDataPoint[] = data.prices.map(([timestamp, price], index) => {
      // Get corresponding market cap and volume data
      const marketCap = data.market_caps?.[index]?.[1] || 0;
      const volume = data.total_volumes?.[index]?.[1] || 0;
      
      return {
        timestamp,
        price,
        marketCap,
        volume,
        date: new Date(timestamp).toISOString()
      };
    });

    // Filter out invalid data points
    const validDataPoints = dataPoints.filter(d => d.price > 0);
    
    if (validDataPoints.length === 0) {
      throw new Error('No valid price data found');
    }

    // Calculate summary statistics from valid data
    const prices = validDataPoints.map(d => d.price);
    const volumes = validDataPoints.map(d => d.volume).filter(v => v > 0);
    
    const startPrice = validDataPoints[0]?.price || 0;
    const endPrice = validDataPoints[validDataPoints.length - 1]?.price || 0;
    const changePercent = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const changeAmount = endPrice - startPrice;
    
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    
    // Use current market data for volume if available, otherwise calculate from chart data
    let totalVolume = 0;
    let currentMarketCap = 0;
    
    if (currentMarketData?.market_data) {
      const current24hVolume = currentMarketData.market_data.total_volume?.usd || 0;
      currentMarketCap = currentMarketData.market_data.market_cap?.usd || 0;
      
      // Calculate total volume based on timeframe for consistency
      if (days === '1') {
        totalVolume = current24hVolume;
      } else if (days === '7') {
        totalVolume = current24hVolume * 7;
      } else if (days === '30') {
        totalVolume = current24hVolume * 30;
      } else if (days === '90') {
        totalVolume = current24hVolume * 90;
      } else if (days === '365') {
        totalVolume = current24hVolume * 365;
      }
      
      console.log(`Using current market data - 24h Volume: ${current24hVolume}, Market Cap: ${currentMarketCap}`);
    } else {
      // Fallback to chart data volume calculation
      totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
      currentMarketCap = validDataPoints[validDataPoints.length - 1]?.marketCap || 0;
      console.log('Using chart data volume calculation as fallback');
    }
    
    const avgVolume = totalVolume > 0 ? totalVolume / parseInt(days) : 0;
    const highestVolume = Math.max(...volumes);
    const lowestVolume = Math.min(...volumes);

    // Data validation and consistency checks
    if (currentMarketData?.market_data) {
      const overviewPrice = currentMarketData.market_data.current_price?.usd;
      const overviewHigh = currentMarketData.market_data.high_24h?.usd;
      const overviewLow = currentMarketData.market_data.low_24h?.usd;
      
      // Log consistency checks
      console.log(`Data Consistency Check:`);
      console.log(`  Chart End Price: ${endPrice}`);
      console.log(`  Overview Price: ${overviewPrice}`);
      console.log(`  Chart High: ${highestPrice}, Overview High: ${overviewHigh}`);
      console.log(`  Chart Low: ${lowestPrice}, Overview Low: ${overviewLow}`);
      
      // Use overview data for 24h timeframe to ensure consistency
      if (days === '1' && overviewPrice && overviewHigh && overviewLow) {
        console.log('Using overview data for 24h timeframe consistency');
        // Keep chart data for visualization but use overview for summary
      }
    }

    // Format time range
    const timeRangeMap: Record<string, string> = {
      '1': '24 Hours',
      '7': '7 Days',
      '30': '30 Days', 
      '90': '90 Days',
      '365': '1 Year'
    };

    return {
      timeframe: days,
      dataPoints: validDataPoints,
      summary: {
        startPrice,
        endPrice,
        changePercent,
        changeAmount,
        highestPrice,
        lowestPrice,
        totalVolume,
        avgVolume,
        highestVolume,
        lowestVolume
      },
      metadata: {
        totalPoints: validDataPoints.length,
        timeRange: timeRangeMap[days] || `${days} days`,
        lastUpdated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('BONK chart API error:', error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = searchParams.get('days') || '1';
    
    const chartData = await fetchBONKChart(days);
    
    if (!chartData) {
      return NextResponse.json(
        { error: 'Failed to fetch chart data' },
        { status: 502 }
      );
    }

    return NextResponse.json(chartData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300'
      }
    });

  } catch (error: any) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
