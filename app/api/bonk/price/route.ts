// app/api/bonk/price/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// export const runtime = 'edge'; // Commented out to fix compatibility issues

type Out = {
  symbol: "BONK";
  currency: "USD";
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  sentiment: "neutral";
  socialVolume: number;
  mindshareRank: number;
  updatedAt: number;
  sourceUpdatedAt?: number;
  provider: "coingecko";
  // Additional CoinGecko data
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  ath?: number;
  athChangePercentage?: number;
  atl?: number;
  atlChangePercentage?: number;
  marketCapRank?: number;
  fullyDilutedValuation?: number;
  priceChangePercentage1h?: number;
  priceChangePercentage7d?: number;
  priceChangePercentage30d?: number;
  marketCapChangePercentage24h?: number;
  priceChangePercentage24hInCurrency?: number;
  totalVolume?: number;
  high24h?: number;
  low24h?: number;
};

// In-memory cache for fallback (5 minutes)
let lastGoodOut: Out | null = null;
let lastGoodAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Centralized CoinGecko fetch with Analyst plan
async function fetchFromCoinGecko(): Promise<Out | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    // Use comprehensive endpoint for maximum data
    const url = `${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=true`;
    
    const headers = new Headers({
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    });
    
    // Add API key if available (Analyst plan)
    if (API_KEY) {
      headers.set('x-cg-pro-api-key', API_KEY);
    }

    const res = await fetch(url, {
      headers, 
      cache: 'no-store',
      next: { revalidate: 300 }, // 5 minutes server-side cache
      keepalive: true
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit, using cached data if available');
    return null;
  }
      throw new Error(`CoinGecko ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const marketData = data.market_data;
    const communityData = data.community_data;

    if (!marketData?.current_price?.usd) {
      throw new Error('Invalid CoinGecko response structure');
    }

    const result: Out = {
      symbol: "BONK",
      currency: "USD",
      price: marketData.current_price.usd,
      marketCap: marketData.market_cap.usd || 0,
      volume24h: marketData.total_volume.usd || 0,
      change24h: marketData.price_change_percentage_24h || 0,
      sentiment: "neutral",
      socialVolume: communityData?.twitter_followers || 0,
      mindshareRank: marketData.market_cap_rank || 0,
      updatedAt: Date.now(),
      sourceUpdatedAt: new Date(data.last_updated).getTime(),
      provider: "coingecko",
      
      // Additional CoinGecko data
      circulatingSupply: marketData.circulating_supply,
      totalSupply: marketData.total_supply,
      maxSupply: marketData.max_supply,
      ath: marketData.ath?.usd,
      athChangePercentage: marketData.ath_change_percentage?.usd,
      atl: marketData.atl?.usd,
      atlChangePercentage: marketData.atl_change_percentage?.usd,
      marketCapRank: marketData.market_cap_rank,
      fullyDilutedValuation: marketData.fully_diluted_valuation?.usd,
      priceChangePercentage1h: marketData.price_change_percentage_1h_in_currency?.usd,
      priceChangePercentage7d: marketData.price_change_percentage_7d,
      priceChangePercentage30d: marketData.price_change_percentage_30d,
      marketCapChangePercentage24h: marketData.market_cap_change_percentage_24h,
      priceChangePercentage24hInCurrency: marketData.price_change_percentage_24h_in_currency?.usd,
      totalVolume: marketData.total_volume?.usd,
      high24h: marketData.high_24h?.usd,
      low24h: marketData.low_24h?.usd,
    };

    return result;

  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check cache first
    if (lastGoodOut && Date.now() - lastGoodAt < CACHE_TTL_MS) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json(lastGoodOut, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
          "X-Response-Time": `${responseTime}ms`,
          "X-Cache": "hit",
          "X-Provider": "coingecko"
        },
      });
    }

    // Fetch fresh data from CoinGecko
    const data = await fetchFromCoinGecko();

    if (data) {
      // Update cache
      lastGoodOut = data;
      lastGoodAt = Date.now();
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ BONK price fetched in ${responseTime}ms from CoinGecko`);
      
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          "X-Response-Time": `${responseTime}ms`,
          "X-Provider": "coingecko",
          "X-Cache": "miss"
        }
      });
    }

    // Fallback to cached data if available
    if (lastGoodOut) {
      const responseTime = Date.now() - startTime;
      console.log('⚠️ Using cached BONK price data');
      
      return NextResponse.json(lastGoodOut, {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "X-Response-Time": `${responseTime}ms`,
          "X-Provider": "coingecko",
          "X-Cache": "stale-hit"
        }
      });
    }

    // No data available
    const responseTime = Date.now() - startTime;
    console.error('❌ No BONK price data available from CoinGecko');

    return NextResponse.json(
      {
        error: "Failed to fetch BONK price from CoinGecko",
        updatedAt: Date.now()
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
          "X-Response-Time": `${responseTime}ms`,
          "X-Provider": "coingecko"
        }
      }
    );
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ BONK price API error:', error);
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: Date.now() 
      },
      { 
        status: 500, 
        headers: { 
          "Cache-Control": "no-store",
          "X-Response-Time": `${responseTime}ms`,
          "X-Provider": "coingecko"
        } 
      }
    );
  }
}
