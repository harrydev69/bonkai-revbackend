import { NextResponse } from 'next/server';

export const revalidate = 60; // 1 minute - overview data changes frequently

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
};

async function fetchBONKOverview(): Promise<OverviewPayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    const url = `${API_BASE}/coins/markets?vs_currency=usd&ids=bonk&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }
    
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit for overview');
        return null;
      }
      throw new Error(`CoinGecko overview ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json() as CoinGeckoOverviewResponse[];
    
    if (!data || data.length === 0) {
      throw new Error('No BONK data returned from CoinGecko');
    }
    
    const bonk = data[0];
    
    return {
      price: bonk.current_price,
      changePct: {
        h1: bonk.price_change_percentage_1h_in_currency || 0,
        h24: bonk.price_change_percentage_24h || 0,
        d7: bonk.price_change_percentage_7d_in_currency || 0,
        d30: bonk.price_change_percentage_30d_in_currency || 0,
        y1: bonk.price_change_percentage_1y_in_currency || 0,
      },
      marketCap: bonk.market_cap,
      fdv: bonk.fully_diluted_valuation,
      volume24h: bonk.total_volume,
      rank: bonk.market_cap_rank,
      sparkline7d: bonk.sparkline_in_7d?.price || [],
      high24h: bonk.high_24h,
      low24h: bonk.low_24h,
      ath: {
        price: bonk.ath,
        date: bonk.ath_date,
        changePct: bonk.ath_change_percentage,
      },
      atl: {
        price: bonk.atl,
        date: bonk.atl_date,
        changePct: bonk.atl_change_percentage,
      },
      lastUpdated: bonk.last_updated,
    };
    
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
