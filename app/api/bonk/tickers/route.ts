import { NextResponse } from 'next/server';

export const revalidate = 900; // 15 minutes - ticker data changes moderately

type CoinGeckoTickerResponse = {
  name: string;
  tickers: Array<{
    base: string;
    target: string;
    market: {
      name: string;
      identifier: string;
      has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: {
      usd: number;
    };
    converted_volume: {
      usd: number;
    };
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: string;
    last_traded_at: string;
    last_fetch_at: string;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id: string;
  }>;
};

type VenuePayload = {
  exchange: string;
  pair: string;
  price: number;
  volume24h: number;
  spreadPct?: number;
  trustScore?: string;
  tradeUrl?: string;
  lastTraded: string;
  isStale: boolean;
  isAnomaly: boolean;
};

type TickersPayload = {
  venues: VenuePayload[];
  byExchange: Array<{
    exchange: string;
    volume24h: number;
    pairCount: number;
  }>;
  summary: {
    totalVenues: number;
    totalVolume24h: number;
    avgPrice: number;
    avgSpread: number;
    topExchanges: string[];
  };
  lastUpdated: string;
};

async function fetchBONKTickers(): Promise<TickersPayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    const url = `${API_BASE}/coins/bonk/tickers?include_exchange_logo=true&depth=false`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }
    
    const res = await fetch(url, {
      headers,
      next: { revalidate: 900 }
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit for tickers');
        return null;
      }
      throw new Error(`CoinGecko tickers ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json() as CoinGeckoTickerResponse;
    
    if (!data.tickers || data.tickers.length === 0) {
      throw new Error('No ticker data returned from CoinGecko');
    }
    
    // Filter out stale and anomaly tickers, process valid ones
    const validTickers = data.tickers.filter(ticker => 
      !ticker.is_stale && !ticker.is_anomaly
    );
    
    const venues: VenuePayload[] = validTickers.map(ticker => ({
      exchange: ticker.market.name,
      pair: `${ticker.base}/${ticker.target}`,
      price: ticker.converted_last.usd,
      volume24h: ticker.converted_volume.usd,
      spreadPct: ticker.bid_ask_spread_percentage,
      trustScore: ticker.trust_score,
      tradeUrl: ticker.trade_url,
      lastTraded: ticker.last_traded_at,
      isStale: ticker.is_stale,
      isAnomaly: ticker.is_anomaly,
    }));
    
    // Group by exchange and calculate totals
    const exchangeMap = new Map<string, { volume24h: number; pairCount: number }>();
    
    venues.forEach(venue => {
      const existing = exchangeMap.get(venue.exchange) || { volume24h: 0, pairCount: 0 };
      existing.volume24h += venue.volume24h;
      existing.pairCount += 1;
      exchangeMap.set(venue.exchange, existing);
    });
    
    const byExchange = Array.from(exchangeMap.entries()).map(([exchange, data]) => ({
      exchange,
      volume24h: data.volume24h,
      pairCount: data.pairCount,
    })).sort((a, b) => b.volume24h - a.volume24h);
    
    // Calculate summary statistics
    const totalVolume24h = venues.reduce((sum, venue) => sum + venue.volume24h, 0);
    const avgPrice = venues.reduce((sum, venue) => sum + venue.price, 0) / venues.length;
    const validSpreads = venues.filter(v => v.spreadPct !== undefined).map(v => v.spreadPct!);
    const avgSpread = validSpreads.length > 0 ? validSpreads.reduce((sum, spread) => sum + spread, 0) / validSpreads.length : 0;
    
    const topExchanges = byExchange.slice(0, 5).map(e => e.exchange);
    
    return {
      venues,
      byExchange,
      summary: {
        totalVenues: venues.length,
        totalVolume24h,
        avgPrice,
        avgSpread,
        topExchanges,
      },
      lastUpdated: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('BONK tickers fetch error:', error);
    return null;
  }
}

export async function GET() {
  try {
    const tickers = await fetchBONKTickers();
    
    if (tickers) {
      return NextResponse.json(tickers, {
        headers: {
          'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=1800',
          'X-Source': 'coingecko',
          'X-Endpoint': 'tickers'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch BONK tickers data' },
      { status: 502 }
    );
    
  } catch (error) {
    console.error('BONK tickers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
