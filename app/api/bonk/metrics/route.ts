import { NextResponse } from 'next/server'

// BONK metrics from CoinGecko (primary source)
// This endpoint provides comprehensive BONK metrics including
// community scores, market data, and social metrics.
// CoinGecko Analyst plan provides 500 calls/minute with rich data.

async function fetchCoinGecko(): Promise<any> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    const base = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3'
    const url = `${base}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    }
    
    if (apiKey) {
      headers['x-cg-pro-api-key'] = apiKey
    }
    
    const res = await fetch(url, { 
      headers,
      next: { revalidate: 300 } // 5 minutes cache
    })
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit')
        return null
      }
      throw new Error(`CoinGecko responded with status ${res.status}`)
    }
    
    const data = await res.json()
    const marketData = data.market_data
    const communityData = data.community_data
    const developerData = data.developer_data
    
    return {
      name: data.name,
      symbol: data.symbol,
      marketCapRank: data.market_cap_rank,
      communityScore: data.community_score,
      developerScore: data.developer_score,
      liquidityScore: data.liquidity_score,
      publicInterestScore: data.public_interest_score,
      
      // Enhanced market data
      priceUsd: marketData?.current_price?.usd,
      volume24h: marketData?.total_volume?.usd,
      change24h: marketData?.price_change_percentage_24h,
      marketCap: marketData?.market_cap?.usd,
      circulatingSupply: marketData?.circulating_supply,
      totalSupply: marketData?.total_supply,
      maxSupply: marketData?.max_supply,
      
      // Community metrics
      twitterFollowers: communityData?.twitter_followers,
      redditSubscribers: communityData?.reddit_subscribers,
      telegramChannelUserCount: communityData?.telegram_channel_user_count,
      
      // Developer metrics
      forks: developerData?.forks,
      stars: developerData?.stars,
      subscribers: developerData?.subscribers,
      totalIssues: developerData?.total_issues,
      closedIssues: developerData?.closed_issues,
      pullRequestsMerged: developerData?.pull_requests_merged,
      pullRequestContributors: developerData?.pull_request_contributors,
      
      // Additional metrics
      ath: marketData?.ath?.usd,
      athChangePercentage: marketData?.ath_change_percentage?.usd,
      atl: marketData?.atl?.usd,
      atlChangePercentage: marketData?.atl_change_percentage?.usd,
      fullyDilutedValuation: marketData?.fully_diluted_valuation?.usd,
      
      // Time-based changes
      priceChangePercentage1h: marketData?.price_change_percentage_1h_in_currency?.usd,
      priceChangePercentage7d: marketData?.price_change_percentage_7d,
      priceChangePercentage30d: marketData?.price_change_percentage_30d,
      marketCapChangePercentage24h: marketData?.market_cap_change_percentage_24h,
      
      // High/Low data
      high24h: marketData?.high_24h?.usd,
      low24h: marketData?.low_24h?.usd,
      
      // Last updated
      lastUpdated: data.last_updated,
      source: 'coingecko'
    }
  } catch (err) {
    console.error('CoinGecko metrics fetch error:', err)
    return null
  }
}

// Legacy provider functions (kept for potential future fallbacks)
// These are currently disabled but can be re-enabled if needed
async function fetchCoinMarketCap(): Promise<any> {
  // Disabled - using CoinGecko as primary
  return null
}

async function fetchMessari(): Promise<any> {
  // Disabled - using CoinGecko as primary
  return null
}

async function fetchCryptoCompare(): Promise<any> {
  // Disabled - using CoinGecko as primary
  return null
}

async function fetchCryptoPanic(): Promise<any> {
  // Disabled - using CoinGecko as primary
  return null
}

export async function GET() {
  try {
    // Primary: Fetch from CoinGecko
    const coingeckoData = await fetchCoinGecko()
    
    if (coingeckoData) {
      return NextResponse.json({
        coingecko: coingeckoData,
        message: 'Data from CoinGecko (primary source)',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Source': 'coingecko'
        }
      })
    }
    
    // Fallback: Try legacy providers if CoinGecko fails
    const [cmc, messari, cc, cp] = await Promise.all([
      fetchCoinMarketCap(),
      fetchMessari(),
      fetchCryptoCompare(),
      fetchCryptoPanic(),
    ])
    
    const result: any = {}
    if (cmc) result.coinmarketcap = cmc
    if (messari) result.messari = messari
    if (cc) result.cryptocompare = cc
    if (cp) result.cryptopanic = cp
    
    if (Object.keys(result).length === 0) {
      return NextResponse.json({ 
        error: 'No metrics available from any source',
        message: 'CoinGecko is primary source. Check API key and rate limits.',
        timestamp: new Date().toISOString()
      }, { status: 502 })
    }
    
    return NextResponse.json({
      ...result,
      message: 'Data from fallback sources (CoinGecko unavailable)',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

