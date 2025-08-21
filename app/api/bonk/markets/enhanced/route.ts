import { NextResponse } from 'next/server';

export type CoinGeckoEnhancedMarketsResponse = {
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
    // Enhanced fields for depth analysis
    bid?: number;
    ask?: number;
    bid_size?: number;
    ask_size?: number;
    high_24h?: number;
    low_24h?: number;
    change_24h?: number;
    change_percentage_24h?: number;
  }>;
};

export type EnhancedMarketVenue = {
  rank: number;
  exchange: string;
  pair: string;
  price: number;
  spread: number;
  depth2Percent: {
    positive: number;
    negative: number;
  };
  volume24h: number;
  volumePercentage: number;
  lastUpdated: string;
  trustScore: string;
  marketType: 'spot' | 'perpetual' | 'futures';
  exchangeType: 'cex' | 'dex';
  tradeUrl: string;
  priceChange24h: number;
  priceChangePercentage24h: number;
  high24h: number;
  low24h: number;
  bidAsk: {
    bid: number;
    ask: number;
    bidSize: number;
    askSize: number;
  };
};

export type MarketSummary = {
  totalVenues: number;
  totalVolume: number;
  averageSpread: number;
  averageTrustScore: string;
  marketTypeDistribution: {
    spot: number;
    perpetual: number;
    futures: number;
  };
  exchangeTypeDistribution: {
    cex: number;
    dex: number;
  };
  topExchanges: Array<{
    name: string;
    volume: number;
    venueCount: number;
    averageTrustScore: string;
  }>;
};

export type EnhancedMarketsPayload = {
  venues: EnhancedMarketVenue[];
  summary: MarketSummary;
  filters: {
    marketTypes: string[];
    exchangeTypes: string[];
    trustScores: string[];
    exchanges: string[];
  };
  metadata: {
    lastUpdated: string;
    totalPairs: number;
    stalePairs: number;
    anomalyPairs: number;
    dataQuality: {
      highTrust: number;
      mediumTrust: number;
      lowTrust: number;
    };
  };
};

export const revalidate = 900; // 15 minutes - market data changes moderately

async function fetchBONKEnhancedMarkets(): Promise<EnhancedMarketsPayload | null> {
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

    const data = await res.json() as CoinGeckoEnhancedMarketsResponse;
    
    if (!data.tickers || data.tickers.length === 0) {
      throw new Error('No market data returned from CoinGecko');
    }

    // Process and enhance venues
    const venues: EnhancedMarketVenue[] = data.tickers
      .filter(ticker => !ticker.is_stale && !ticker.is_anomaly)
      .map((ticker, index) => {
        // Determine market type based on exchange and constructed pair
        const pairString = `${ticker.base}/${ticker.target}`;
        const marketType = determineMarketType(ticker.market.name, pairString);
        const exchangeType = determineExchangeType(ticker.market.name);
        
        // Mock depth data (in real implementation, this would come from exchange APIs)
        const depth2Percent = calculateMockDepth(ticker.converted_last.usd, ticker.converted_volume.usd);
        
        // Mock bid/ask data
        const spread = ticker.bid_ask_spread_percentage;
        const midPrice = ticker.converted_last.usd;
        const bid = midPrice * (1 - spread / 200);
        const ask = midPrice * (1 + spread / 200);
        
        return {
          rank: index + 1,
          exchange: ticker.market.name,
          pair: `${ticker.base}/${ticker.target}`,
          price: ticker.converted_last.usd,
          spread: spread,
          depth2Percent,
          volume24h: ticker.converted_volume.usd,
          volumePercentage: 0, // Will be calculated below
          lastUpdated: ticker.last_fetch_at,
          trustScore: ticker.trust_score,
          marketType,
          exchangeType,
          tradeUrl: ticker.trade_url,
          priceChange24h: 0, // Mock data
          priceChangePercentage24h: 0, // Mock data
          high24h: ticker.converted_last.usd * 1.05, // Mock data
          low24h: ticker.converted_last.usd * 0.95, // Mock data
          bidAsk: {
            bid,
            ask,
            bidSize: ticker.converted_volume.usd * 0.1, // Mock data
            askSize: ticker.converted_volume.usd * 0.1 // Mock data
          }
        };
      })
      .sort((a, b) => b.volume24h - a.volume24h);

    // Calculate volume percentages
    const totalVolume = venues.reduce((sum, v) => sum + v.volume24h, 0);
    venues.forEach(venue => {
      venue.volumePercentage = (venue.volume24h / totalVolume) * 100;
    });

    // Group by exchange for summary
    const exchangeMap = new Map<string, { volume: number; count: number; trustScores: string[] }>();
    venues.forEach(venue => {
      const existing = exchangeMap.get(venue.exchange);
      if (existing) {
        existing.volume += venue.volume24h;
        existing.count += 1;
        existing.trustScores.push(venue.trustScore);
      } else {
        exchangeMap.set(venue.exchange, {
          volume: venue.volume24h,
          count: 1,
          trustScores: [venue.trustScore]
        });
      }
    });

    const topExchanges = Array.from(exchangeMap.entries())
      .map(([name, data]) => ({
        name,
        volume: data.volume,
        venueCount: data.count,
        averageTrustScore: calculateAverageTrustScore(data.trustScores)
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    // Calculate market type distribution
    const marketTypeDistribution = {
      spot: venues.filter(v => v.marketType === 'spot').length,
      perpetual: venues.filter(v => v.marketType === 'perpetual').length,
      futures: venues.filter(v => v.marketType === 'futures').length
    };

    const exchangeTypeDistribution = {
      cex: venues.filter(v => v.exchangeType === 'cex').length,
      dex: venues.filter(v => v.exchangeType === 'dex').length
    };

    // Calculate average spread and trust score
    const averageSpread = venues.reduce((sum, v) => sum + v.spread, 0) / venues.length;
    const averageTrustScore = calculateAverageTrustScore(venues.map(v => v.trustScore));

    // Data quality analysis
    const dataQuality = {
      highTrust: venues.filter(v => v.trustScore === 'green').length,
      mediumTrust: venues.filter(v => v.trustScore === 'yellow').length,
      lowTrust: venues.filter(v => v.trustScore === 'red').length
    };

    // Generate filter options
    const filters = {
      marketTypes: [...new Set(venues.map(v => v.marketType))],
      exchangeTypes: [...new Set(venues.map(v => v.exchangeType))],
      trustScores: [...new Set(venues.map(v => v.trustScore))],
      exchanges: [...new Set(venues.map(v => v.exchange))]
    };

    return {
      venues,
      summary: {
        totalVenues: venues.length,
        totalVolume,
        averageSpread,
        averageTrustScore,
        marketTypeDistribution,
        exchangeTypeDistribution,
        topExchanges
      },
      filters,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalPairs: data.tickers.length,
        stalePairs: data.tickers.filter(t => t.is_stale).length,
        anomalyPairs: data.tickers.filter(t => t.is_anomaly).length,
        dataQuality
      }
    };

  } catch (error) {
    console.error('BONK enhanced markets API error:', error);
    return null;
  }
}

// Helper functions
function determineMarketType(exchangeName: string, pair: string): 'spot' | 'perpetual' | 'futures' {
  if (!exchangeName || !pair) return 'spot'; // Safety check
  
  const exchange = exchangeName.toLowerCase();
  const pairLower = pair.toLowerCase();
  
  if (exchange.includes('binance') || exchange.includes('okx') || exchange.includes('bybit')) {
    if (pairLower.includes('perp') || pairLower.includes('usdt')) return 'perpetual';
    if (pairLower.includes('futures')) return 'futures';
  }
  
  if (exchange.includes('raydium') || exchange.includes('jupiter') || exchange.includes('orca')) {
    return 'spot';
  }
  
  return 'spot'; // Default to spot
}

function determineExchangeType(exchangeName: string): 'cex' | 'dex' {
  const exchange = exchangeName.toLowerCase();
  
  if (exchange.includes('raydium') || exchange.includes('jupiter') || exchange.includes('orca') || 
      exchange.includes('serum') || exchange.includes('saber')) {
    return 'dex';
  }
  
  return 'cex';
}

function calculateMockDepth(price: number, volume: number) {
  const baseDepth = volume * 0.1;
  return {
    positive: baseDepth * (1 + Math.random() * 0.5),
    negative: baseDepth * (1 + Math.random() * 0.5)
  };
}

function calculateAverageTrustScore(trustScores: string[]): string {
  const scoreMap = { 'green': 3, 'yellow': 2, 'red': 1 };
  const total = trustScores.reduce((sum, score) => sum + (scoreMap[score as keyof typeof scoreMap] || 2), 0);
  const average = total / trustScores.length;
  
  if (average >= 2.5) return 'green';
  if (average >= 1.5) return 'yellow';
  return 'red';
}

export async function GET() {
  try {
    const marketsData = await fetchBONKEnhancedMarkets();
    
    if (!marketsData) {
      return NextResponse.json(
        { error: 'Failed to fetch enhanced markets data' },
        { status: 502 }
      );
    }

    return NextResponse.json(marketsData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=900, stale-while-revalidate=900'
      }
    });

  } catch (error: any) {
    console.error('Enhanced Markets API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
