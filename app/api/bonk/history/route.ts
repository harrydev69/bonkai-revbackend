import { NextResponse } from 'next/server'

// Returns historical price, market cap and volume data for BONK. Accepts a
// query parameter `days` indicating the number of days to fetch. Defaults to
// 7 days. Uses CoinGecko's market_chart endpoint.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = searchParams.get('days') || '7'
  try {
    const url = `https://api.coingecko.com/api/v3/coins/bonk/market_chart?vs_currency=usd&days=${days}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CoinGecko history request failed with status ${res.status}`)
    const data = await res.json()
    const prices = data.prices || []
    const marketCaps = data.market_caps || []
    const volumes = data.total_volumes || []
    const history = prices.map((p: any[], idx: number) => {
      return {
        ts: p[0],
        price: p[1],
        marketCap: marketCaps[idx] ? marketCaps[idx][1] : null,
        volume: volumes[idx] ? volumes[idx][1] : null,
      }
    })
    return NextResponse.json({ history })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch history' }, { status: 500 })
  }
}

