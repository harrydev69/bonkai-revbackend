import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    console.log('=== BONK API Test ===');
    console.log('API Base:', API_BASE);
    console.log('API Key available:', !!API_KEY);
    
    // Test basic connectivity
    const testUrl = `${API_BASE}/ping`;
    const pingResponse = await fetch(testUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BONKai-Analytics/1.0'
      },
      cache: 'no-store'
    });
    
    const pingData = await pingResponse.json();
    console.log('Ping response:', pingData);
    
    // Test BONK data fetch
    const bonkUrl = `${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0',
      'Cache-Control': 'no-cache'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }
    
    const bonkResponse = await fetch(bonkUrl, {
      headers,
      cache: 'no-store'
    });
    
    if (!bonkResponse.ok) {
      throw new Error(`BONK fetch failed: ${bonkResponse.status} ${bonkResponse.statusText}`);
    }
    
    const bonkData = await bonkResponse.json();
    const marketData = bonkData.market_data;
    
    const testResult = {
      timestamp: new Date().toISOString(),
      apiStatus: 'connected',
      pingResponse: pingData,
      bonkData: {
        currentPrice: marketData?.current_price?.usd,
        priceChange24h: marketData?.price_change_percentage_24h,
        marketCap: marketData?.market_cap?.usd,
        volume24h: marketData?.total_volume?.usd,
        high24h: marketData?.high_24h?.usd,
        low24h: marketData?.low_24h?.usd,
        lastUpdated: bonkData.last_updated,
        circulatingSupply: marketData?.circulating_supply,
        totalSupply: marketData?.total_supply,
        maxSupply: marketData?.max_supply
      },
      environment: {
        apiBase: API_BASE,
        hasApiKey: !!API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    console.log('Test result:', testResult);
    
    return NextResponse.json(testResult, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Test-Timestamp': new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    return NextResponse.json(
      { 
        error: 'API test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
