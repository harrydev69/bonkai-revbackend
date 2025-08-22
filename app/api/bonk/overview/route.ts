import { NextResponse } from 'next/server';

// Force dynamic rendering since this route fetches live data with no-store
export const dynamic = 'force-dynamic';

export const revalidate = 30; // 30 seconds - ensure very fresh data

type CoinGeckoOverviewResponse = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
};

type OverviewPayload = {
  price: number;
  changePct: {
    h1: number;
    h24: number;
    d7: number;
    d30: number;
    y1: number;
  };
  marketCap: number;
  fdv: number | null;
  volume24h: number;
  rank: number | null;
  sparkline7d: number[];
  high24h: number;
  low24h: number;
  ath: {
    price: number;
    date: string;
    changePct: number;
  };
  atl: {
    price: number;
    date: string;
    changePct: number;
  };
  lastUpdated: string;
  // Add supply data
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
};

async function fetchBONKOverview(): Promise<OverviewPayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    console.log('Fetching BONK overview from CoinGecko...');
    console.log('API Base:', API_BASE);
    console.log('API Key available:', !!API_KEY);
    
    // Use the comprehensive endpoint for maximum data
    const url = `${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
    
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
      next: { revalidate: 30 }
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit for overview');
        return null;
      }
      throw new Error(`CoinGecko overview ${res.status}: ${res.statusText}`);
    }
    
    const bonk = await res.json();
    
    if (!bonk || !bonk.market_data) {
      throw new Error('Invalid BONK data returned from CoinGecko');
    }
    
    const marketData = bonk.market_data;
    
    // Log the raw data for debugging
    console.log('Raw CoinGecko data received:');
    console.log('Current Price:', marketData.current_price?.usd);
    console.log('24h Change:', marketData.price_change_percentage_24h);
    console.log('Market Cap:', marketData.market_cap?.usd);
    console.log('Volume:', marketData.total_volume?.usd);
    console.log('High 24h:', marketData.high_24h?.usd);
    console.log('Low 24h:', marketData.low_24h?.usd);
    console.log('Last Updated:', bonk.last_updated);
    
    const result = {
      price: marketData.current_price?.usd || 0,
      changePct: {
        h1: marketData.price_change_percentage_1h_in_currency?.usd || 0,
        h24: marketData.price_change_percentage_24h || 0,
        d7: marketData.price_change_percentage_7d_in_currency?.usd || 0,
        d30: marketData.price_change_percentage_30d_in_currency?.usd || 0,
        y1: marketData.price_change_percentage_1y_in_currency?.usd || 0,
      },
      marketCap: marketData.market_cap?.usd || 0,
      fdv: marketData.fully_diluted_valuation?.usd || 0,
      volume24h: marketData.total_volume?.usd || 0,
      rank: bonk.market_cap_rank || null,
      sparkline7d: bonk.market_data?.sparkline_7d?.price || [],
      high24h: marketData.high_24h?.usd || 0,
      low24h: marketData.low_24h?.usd || 0,
      ath: {
        price: marketData.ath?.usd || 0,
        date: marketData.ath_date?.usd || '',
        changePct: marketData.ath_change_percentage?.usd || 0,
      },
      atl: {
        price: marketData.atl?.usd || 0,
        date: marketData.atl_date?.usd || '',
        changePct: marketData.atl_change_percentage?.usd || 0,
      },
      lastUpdated: bonk.last_updated || '',
      circulatingSupply: marketData.circulating_supply || 0,
      totalSupply: marketData.total_supply || 0,
      maxSupply: marketData.max_supply || 0,
    };
    
    console.log('Processed overview data:', result);
    return result;
    
  } catch (error) {
    console.error('BONK overview fetch error:', error);
    return null;
  }
}

export async function GET() {
  try {
    const overview = await fetchBONKOverview();
    
    if (overview) {
      return NextResponse.json(overview, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          'X-Source': 'coingecko',
          'X-Endpoint': 'overview'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch BONK overview data' },
      { status: 502 }
    );
    
  } catch (error) {
    console.error('BONK overview API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
