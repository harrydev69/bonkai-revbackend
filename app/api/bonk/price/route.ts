// app/api/bonk/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { advancedCache, staleWhileRevalidate } from '@/lib/advanced-cache';

// Enhanced price fetching with intelligent caching
async function fetchPriceData(): Promise<any> {
  try {
    // Try multiple data sources for redundancy
    const [coingeckoRes, backupRes] = await Promise.allSettled([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bonk&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }),
      fetch('https://api.coingecko.com/api/v3/coins/bonk/market_chart?vs_currency=usd&days=1&interval=hourly', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      })
    ]);

    let priceData: any = {};
    
    if (coingeckoRes.status === 'fulfilled' && coingeckoRes.value.ok) {
      const data = await coingeckoRes.value.json();
      priceData = {
        price: data.bonk?.usd || 0,
        change24h: data.bonk?.usd_24h_change || 0,
        marketCap: data.bonk?.usd_market_cap || 0,
        volume24h: data.bonk?.usd_24h_vol || 0,
        lastUpdated: Date.now(),
        source: 'coingecko'
      };
    }

    // Add chart data if available
    if (backupRes.status === 'fulfilled' && backupRes.value.ok) {
      const chartData = await backupRes.value.json();
      if (chartData.prices && chartData.prices.length > 0) {
        priceData.chartData = chartData.prices.slice(-24); // Last 24 hours
      }
    }

    return priceData;
  } catch (error) {
    console.error('Price fetch error:', error);
    throw new Error('Failed to fetch price data');
  }
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'bonk:price:latest';
    
    // Use stale-while-revalidate pattern for optimal performance
    const data = await staleWhileRevalidate(
      cacheKey,
      fetchPriceData,
      {
        ttl: 30 * 1000, // 30 seconds for price data
        tags: ['bonk', 'price', 'market-data']
      }
    );

    // Add cache headers for client-side caching
    const response = NextResponse.json(data);
    
    // Cache-Control: public, s-maxage=30, stale-while-revalidate=60
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    response.headers.set('X-Cache-Status', 'HIT');
    response.headers.set('X-Cache-TTL', '30');
    
    return response;
  } catch (error) {
    console.error('Price API error:', error);
    
    // Try to return stale data if available
    const staleData = await advancedCache.get('bonk:price:latest');
    if (staleData) {
      const response = NextResponse.json(staleData);
      response.headers.set('X-Cache-Status', 'STALE');
      response.headers.set('X-Cache-TTL', 'EXPIRED');
      return response;
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}

// Cache invalidation endpoint for admin use
export async function DELETE(request: NextRequest) {
  try {
    await advancedCache.invalidateByTags(['bonk', 'price']);
    return NextResponse.json({ success: true, message: 'Price cache cleared' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
