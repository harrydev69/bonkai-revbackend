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

    // Fetch total volume and market cap for the specific timeframe
    let totalVolume = 0;
    let currentMarketCap = 0;
    
    try {
      // For all timeframes, get current data to calculate total volume
      const currentDataResponse = await fetch(`${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BONKai-Analytics/1.0',
          ...(API_KEY && { 'x-cg-pro-api-key': API_KEY })
        }
      });
      
      if (currentDataResponse.ok) {
        const currentData = await currentDataResponse.json();
        const current24hVolume = currentData.market_data?.total_volume?.usd || 0;
        currentMarketCap = currentData.market_data?.market_cap?.usd || 0;
        
        // Calculate total volume based on timeframe
        if (days === '1') {
          totalVolume = current24hVolume; // 24H volume
        } else if (days === '7') {
          totalVolume = current24hVolume * 7; // 7 days = 24H volume × 7
        } else if (days === '30') {
          totalVolume = current24hVolume * 30; // 30 days = 24H volume × 30
        } else if (days === '90') {
          totalVolume = current24hVolume * 90; // 90 days = 24H volume × 90
        } else if (days === '365') {
          totalVolume = current24hVolume * 365; // 1 year = 24H volume × 365
        }
        
        console.log(`Current 24h Volume: ${current24hVolume}, Current Market Cap: ${currentMarketCap}`);
        console.log(`Calculated ${days}-day Total Volume: ${totalVolume}`);
      }
    } catch (error) {
      console.log('Could not fetch current data from separate endpoint, using chart data');
    }

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

    // Debug logging for data accuracy
    console.log(`Chart API Debug - Days: ${days}, Total Points: ${validDataPoints.length}`);
    console.log(`Sample Price Range: ${Math.min(...validDataPoints.map(d => d.price))} to ${Math.max(...validDataPoints.map(d => d.price))}`);
    console.log(`Sample Volume Range: ${Math.min(...validDataPoints.map(d => d.volume))} to ${Math.max(...validDataPoints.map(d => d.volume))}`);

    // Calculate summary statistics from valid data
    const prices = validDataPoints.map(d => d.price);
    const volumes = validDataPoints.map(d => d.volume).filter(v => v > 0);
    
    const startPrice = validDataPoints[0]?.price || 0;
    const endPrice = validDataPoints[validDataPoints.length - 1]?.price || 0;
    const changePercent = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const changeAmount = endPrice - startPrice;
    
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    
    // Use the calculated total volume from the separate endpoint
    const avgVolume = totalVolume > 0 ? totalVolume / parseInt(days) : 0;
    const highestVolume = Math.max(...volumes);
    const lowestVolume = Math.min(...volumes);

    // Debug volume calculations
    console.log(`Volume Stats - Total: ${totalVolume}, Avg: ${avgVolume}, High: ${highestVolume}, Low: ${lowestVolume}`);
    console.log(`Timeframe: ${days} days, Using calculated total volume from 24H endpoint`);

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
