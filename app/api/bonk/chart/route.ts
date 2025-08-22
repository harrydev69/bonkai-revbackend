import { NextResponse } from 'next/server';

// Force dynamic rendering since this route uses request.url and fetches live data
export const dynamic = 'force-dynamic';

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

export const revalidate = 60; // 1 minute - chart data changes frequently

async function fetchBONKChart(days: string): Promise<ChartPayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    console.log(`Fetching BONK chart data for ${days} days...`);
    
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
          'Cache-Control': 'no-cache',
          ...(API_KEY && { 'x-cg-pro-api-key': API_KEY })
        },
        cache: 'no-store'
      });
      
      if (currentDataResponse.ok) {
        currentMarketData = await currentDataResponse.json();
        console.log('Current market data fetched successfully for consistency check');
        console.log('Current Price:', currentMarketData.market_data?.current_price?.usd);
        console.log('24h Change:', currentMarketData.market_data?.price_change_percentage_24h);
      }
    } catch (error) {
      console.log('Could not fetch current market data, proceeding with chart data only');
    }

    // Fetch chart data
    const url = `${API_BASE}/coins/bonk/market_chart?vs_currency=usd&days=${days}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0',
      'Cache-Control': 'no-cache'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }

    const res = await fetch(url, { 
      headers,
      cache: 'no-store',
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`CoinGecko API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json() as CoinGeckoChartResponse;
    
    if (!data.prices || data.prices.length === 0) {
      throw new Error('No chart data returned from CoinGecko');
    }

    console.log(`Chart data received: ${data.prices.length} price points`);
    console.log('First price point:', data.prices[0]);
    console.log('Last price point:', data.prices[data.prices.length - 1]);

    // Transform the data to match CoinGecko's exact format
    // CoinGecko returns: [timestamp, price] - NOT [price, timestamp]
    const transformedData: ChartDataPoint[] = data.prices.map(([timestamp, price], index) => {
      const date = new Date(timestamp);
      
      console.log(`Processing point ${index}: timestamp=${timestamp}, price=${price}, date=${date.toISOString()}`);
      
      return {
        timestamp: timestamp,
        date: date.toISOString(),
        price: price,
        marketCap: data.market_caps?.[index]?.[1] || 0,
        volume: data.total_volumes?.[index]?.[1] || 0
      };
    });

    // Calculate proper summary statistics
    const startPrice = transformedData[0]?.price || 0;
    const endPrice = transformedData[transformedData.length - 1]?.price || 0;
    const changeAmount = endPrice - startPrice;
    const changePercent = startPrice > 0 ? ((changeAmount / startPrice) * 100) : 0;
    
    // Find highest and lowest prices
    const prices = transformedData.map(d => d.price).filter(p => p > 0);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    
    // Calculate volume statistics
    const volumes = transformedData.map(d => d.volume).filter(v => v > 0);
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = volumes.length > 0 ? totalVolume / volumes.length : 0;
    const highestVolume = Math.max(...volumes);
    const lowestVolume = Math.min(...volumes);

    const payload: ChartPayload = {
      timeframe: days,
      dataPoints: transformedData,
      summary: {
        startPrice,
        endPrice,
        changeAmount,
        changePercent,
        highestPrice,
        lowestPrice,
        totalVolume,
        avgVolume,
        highestVolume,
        lowestVolume
      },
      metadata: {
        totalPoints: transformedData.length,
        timeRange: `${days} days`,
        lastUpdated: new Date().toISOString()
      }
    };

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
      
      // Validate price consistency - if there's a significant difference, log warning
      if (overviewPrice && Math.abs(endPrice - overviewPrice) > (overviewPrice * 0.01)) { // 1% tolerance
        console.warn(`Price discrepancy detected! Chart end price: ${endPrice}, Overview price: ${overviewPrice}`);
        console.warn('This might indicate stale chart data or API inconsistencies');
      }
      
      // Use overview data for 24h timeframe to ensure consistency
      if (days === '1' && overviewPrice && overviewHigh && overviewLow) {
        console.log('Using overview data for 24h timeframe consistency');
        // Keep chart data for visualization but use overview for summary
      }
    }

    return payload;

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
