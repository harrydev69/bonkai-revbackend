import { NextResponse } from 'next/server';

export type CoinGeckoMarketsResponse = {
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

export type MarketVenue = {
  exchange: string;
  pair: string;
  price: number;
  volume24h: number;
  spreadPct: number;
  trustScore: string;
  tradeUrl: string;
  lastUpdated: string;
  isStale: boolean;
  isAnomaly: boolean;
};

export type ExchangeVolume = {
  exchange: string;
  totalVolume: number;
  pairCount: number;
  avgPrice: number;
  trustScore: string;
};

export type MarketsPayload = {
  venues: MarketVenue[];
  byExchange: ExchangeVolume[];
  summary: {
    totalVenues: number;
    totalVolume: number;
    avgPrice: number;
    topExchange: string;
    topVolume: number;
    activeExchanges: number;
  };
  metadata: {
    lastUpdated: string;
    totalPairs: number;
    stalePairs: number;
    anomalyPairs: number;
  };
};

export const revalidate = 900; // 15 minutes - market data changes moderately

async function fetchBONKMarkets(): Promise<MarketsPayload | null> {
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
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`CoinGecko API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json() as CoinGeckoMarketsResponse;
    
    if (!data.tickers || data.tickers.length === 0) {
      throw new Error('No market data returned from CoinGecko');
    }

    // Process venues
    const venues: MarketVenue[] = data.tickers
      .filter(ticker => !ticker.is_stale && !ticker.is_anomaly) // Filter out stale/anomaly data
      .map(ticker => ({
        exchange: ticker.market.name,
        pair: `${ticker.base}/${ticker.target}`,
        price: ticker.converted_last.usd,
        volume24h: ticker.converted_volume.usd,
        spreadPct: ticker.bid_ask_spread_percentage,
        trustScore: ticker.trust_score,
        tradeUrl: ticker.trade_url,
        lastUpdated: ticker.last_fetch_at,
        isStale: ticker.is_stale,
        isAnomaly: ticker.is_anomaly
      }))
      .sort((a, b) => b.volume24h - a.volume24h); // Sort by volume descending

    // Group by exchange
    const exchangeMap = new Map<string, ExchangeVolume>();
    
    venues.forEach(venue => {
      const existing = exchangeMap.get(venue.exchange);
      if (existing) {
        existing.totalVolume += venue.volume24h;
        existing.pairCount += 1;
        existing.avgPrice = (existing.avgPrice + venue.price) / 2;
      } else {
        exchangeMap.set(venue.exchange, {
          exchange: venue.exchange,
          totalVolume: venue.volume24h,
          pairCount: 1,
          avgPrice: venue.price,
          trustScore: venue.trustScore
        });
      }
    });

    const byExchange = Array.from(exchangeMap.values())
      .sort((a, b) => b.totalVolume - a.totalVolume);

    // Calculate summary
    const totalVolume = venues.reduce((sum, v) => sum + v.volume24h, 0);
    const avgPrice = venues.reduce((sum, v) => sum + v.price, 0) / venues.length;
    const topExchange = byExchange[0]?.exchange || 'Unknown';
    const topVolume = byExchange[0]?.totalVolume || 0;
    const activeExchanges = byExchange.length;

    // Count stale/anomaly pairs
    const stalePairs = data.tickers.filter(t => t.is_stale).length;
    const anomalyPairs = data.tickers.filter(t => t.is_anomaly).length;

    return {
      venues,
      byExchange,
      summary: {
        totalVenues: venues.length,
        totalVolume,
        avgPrice,
        topExchange,
        topVolume,
        activeExchanges
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalPairs: data.tickers.length,
        stalePairs,
        anomalyPairs
      }
    };

  } catch (error) {
    console.error('BONK markets API error:', error);
    return null;
  }
}

export async function GET() {
  try {
    const marketsData = await fetchBONKMarkets();
    
    if (!marketsData) {
      return NextResponse.json(
        { error: 'Failed to fetch markets data' },
        { status: 502 }
      );
    }

    return NextResponse.json(marketsData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=900, stale-while-revalidate=900'
      }
    });

  } catch (error: any) {
    console.error('Markets API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
