// lib/lunarcrush.ts
import { cache } from "react" // optional: use Next.js caching helpers

const API_BASE = "https://api.lunarcrush.com/v3"
const API_KEY  = process.env.LUNARCRUSH_API_KEY!

async function callLunarCrush(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set("key", API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`LunarCrush error ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

export async function getCoinSnapshot(symbol: string) {
  const [snap] = await callLunarCrush(`/coins/${symbol}`)
  return snap
}

export async function getCoinTimeseries(symbol: string, interval = "hour", points = 24) {
  return await callLunarCrush(`/coins/${symbol}/time-series`, { interval, data_points: points })
}

export async function getCoinInsights(symbol: string) {
  return await callLunarCrush(`/coins/${symbol}/insights`)
}

export async function getFeeds(symbol: string, limit = 20) {
  return await callLunarCrush(`/feeds`, { symbol, limit })
}

export async function getInfluencers(symbol: string, limit = 10) {
  return await callLunarCrush(`/influencers`, { symbol, limit })
}
