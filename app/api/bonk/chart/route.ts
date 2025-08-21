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

    // Process data points
    const dataPoints: ChartDataPoint[] = data.prices.map(([timestamp, price], index) => ({
      timestamp,
      price,
      marketCap: data.market_caps?.[index]?.[1] || 0,
      volume: data.total_volumes?.[index]?.[1] || 0,
      date: new Date(timestamp).toISOString()
    }));

    // Calculate summary statistics
    const prices = dataPoints.map(d => d.price).filter(p => p > 0);
    const volumes = dataPoints.map(d => d.volume).filter(v => v > 0);
    
    const startPrice = dataPoints[0]?.price || 0;
    const endPrice = dataPoints[dataPoints.length - 1]?.price || 0;
    const changePercent = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;
    const changeAmount = endPrice - startPrice;
    
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = volumes.length > 0 ? totalVolume / volumes.length : 0;
    const highestVolume = Math.max(...volumes);
    const lowestVolume = Math.min(...volumes);

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
      dataPoints,
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
        totalPoints: dataPoints.length,
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
    const days = searchParams.get('days') || '30';
    
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
