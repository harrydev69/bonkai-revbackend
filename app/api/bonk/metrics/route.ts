import { NextResponse } from 'next/server'

// Aggregate BONK metrics from multiple providers. This endpoint attempts
// to fetch community scores, market data and on‑chain metrics from
// CoinGecko, CoinMarketCap, Messari, CryptoCompare and CryptoPanic.
// Each provider call is optional and will be skipped if the
// corresponding API key is not supplied. The response contains a
// nested object with results from the providers that responded
// successfully. If all providers fail the endpoint returns a 500 error.

async function fetchCoinGecko(): Promise<any> {
  try {
    const apiKey = process.env.COINGECKO_API_KEY
    const base = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
    const url = `${base}/coins/bonk`
    const headers: Record<string, string> = {}
    if (apiKey) headers['X-Cg-Pro-Api-Key'] = apiKey
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`CoinGecko responded with status ${res.status}`)
    const data = await res.json()
    return {
      name: data.name,
      symbol: data.symbol,
      marketCapRank: data.market_cap_rank,
      communityScore: data.community_score,
      developerScore: data.developer_score,
      liquidityScore: data.liquidity_score,
      publicInterestScore: data.public_interest_score,
    }
  } catch (err) {
    return null
  }
}

async function fetchCoinMarketCap(): Promise<any> {
  const apiKey = process.env.COINMARKETCAP_API_KEY
  if (!apiKey) return null
  try {
    const base = process.env.COINMARKETCAP_API_URL || 'https://pro-api.coinmarketcap.com/v1'
    const url = `${base}/cryptocurrency/quotes/latest?symbol=BONK&convert=USD`
    const res = await fetch(url, {
      headers: { 'X-CMC_PRO_API_KEY': apiKey },
    })
    if (!res.ok) throw new Error(`CMC responded with status ${res.status}`)
    const json = await res.json()
    const quote = json?.data?.BONK?.quote?.USD
    if (!quote) return null
    return {
      priceUsd: quote.price,
      volume24h: quote.volume_24h,
      change24h: quote.percent_change_24h,
      marketCap: quote.market_cap,
    }
  } catch {
    return null
  }
}

async function fetchMessari(): Promise<any> {
  const apiKey = process.env.MESSARI_API_KEY
  if (!apiKey) return null
  try {
    const url = 'https://data.messari.io/api/v1/assets/bonk/metrics'
    const res = await fetch(url, {
      headers: { 'x-messari-api-key': apiKey },
    })
    if (!res.ok) throw new Error(`Messari responded with status ${res.status}`)
    const json = await res.json()
    const metrics = json?.data
    if (!metrics) return null
    return {
      marketcap: metrics.marketcap?.current_marketcap_usd ?? null,
      totalSupply: metrics.supply?.circulating ?? null,
      volume24h: metrics.market_data?.volume_last_24_hours ?? null,
    }
  } catch {
    return null
  }
}

async function fetchCryptoCompare(): Promise<any> {
  const apiKey = process.env.CRYPTOPCOMPARE_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BONK&tsyms=USD&api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CryptoCompare responded with status ${res.status}`)
    const json = await res.json()
    const display = json?.RAW?.BONK?.USD
    if (!display) return null
    return {
      priceUsd: display.PRICE,
      volume24h: display.VOLUME24HOURTO,
      change24h: display.CHANGEPCT24HOUR,
      marketCap: display.MKTCAP,
    }
  } catch {
    return null
  }
}

async function fetchCryptoPanic(): Promise<any> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY
  if (!apiKey) return null
  try {
    // Fetch recent posts about BONK from CryptoPanic. We return the count of
    // bullish vs bearish sentiment posts for context. See https://cryptopanic.com/developers/api/
    const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&currencies=bonk&public=true`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CryptoPanic responded with status ${res.status}`)
    const json = await res.json()
    const results = json?.results || []
    let bullish = 0
    let bearish = 0
    for (const post of results) {
      const sentiment = post?.sentiment
      if (sentiment === 'bullish') bullish++
      if (sentiment === 'bearish') bearish++
    }
    return { posts: results.length, bullish, bearish }
  } catch {
    return null
  }
}

export async function GET() {
  // Kick off all requests concurrently. Each helper returns null on failure
  // or missing API key. We filter out null values below.
  const [cg, cmc, messari, cc, cp] = await Promise.all([
    fetchCoinGecko(),
    fetchCoinMarketCap(),
    fetchMessari(),
    fetchCryptoCompare(),
    fetchCryptoPanic(),
  ])
  const result: any = {}
  if (cg) result.coingecko = cg
  if (cmc) result.coinmarketcap = cmc
  if (messari) result.messari = messari
  if (cc) result.cryptocompare = cc
  if (cp) result.cryptopanic = cp
  if (Object.keys(result).length === 0) {
    return NextResponse.json({ error: 'No metrics available. Provide API keys?' }, { status: 500 })
  }
  return NextResponse.json(result)
}

