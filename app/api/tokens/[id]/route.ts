// app/api/tokens/[id]/route.ts
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type TokenDetails = {
  id: string
  symbol: string
  name: string
  image: string | null
  price: number | null
  change1h: number | null
  change24h: number | null
  change7d: number | null
  marketCap: number | null
  volume: number | null
  // extended
  fdv: number | null
  circulatingSupply: number | null
  totalSupply: number | null
  maxSupply: number | null
  contract: string | null
  explorers: string[]
  // links
  homepage?: string | null
  twitter?: string | null
  discord?: string | null
}

type ChartPoint = { t: number; p: number }

type CacheEntry = { ts: number; json: any }
const g = globalThis as any
if (!g.__TOKEN_DETAILS_CACHE__) g.__TOKEN_DETAILS_CACHE__ = new Map<string, CacheEntry>()
if (!g.__TOKEN_DETAILS_INFLIGHT__) g.__TOKEN_DETAILS_INFLIGHT__ = new Map<string, Promise<any>>()
const cache: Map<string, CacheEntry> = g.__TOKEN_DETAILS_CACHE__
const inflight: Map<string, Promise<any>> = g.__TOKEN_DETAILS_INFLIGHT__

// Cache charts a bit longer; details can tolerate a short delay too.
const TTL = 3 * 60 * 1000 // 3 minutes

function cgHeaders(): HeadersInit {
  const h: Record<string, string> = {
    accept: "application/json",
    "user-agent": "bonkai/1.0 (+https://example.com)" // helps some providers
  }
  const demo = process.env.COINGECKO_API_KEY || process.env.CG_DEMO_API_KEY
  const pro = process.env.CG_PRO_API_KEY
  if (demo) h["x-cg-demo-api-key"] = demo
  if (pro) h["x-cg-pro-api-key"] = pro
  return h
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchWithRetry(url: string, init?: RequestInit, tries = 3) {
  let err: any
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, init)
      if (r.ok) return r
      if (r.status === 429 || r.status >= 500) {
        const ra = r.headers.get("retry-after")
        const wait = ra ? Number(ra) * 1000 : 400 + 600 * i
        await sleep(wait)
        continue
      }
      throw new Error(`${r.status} ${await r.text()}`)
    } catch (e) {
      err = e
      await sleep(400 + 600 * i)
    }
  }
  throw err
}

function fallbackFromSparkline(spark: number[] | undefined, days: string): ChartPoint[] {
  if (!Array.isArray(spark) || spark.length === 0) return []
  // CoinGecko sparkline_7d is hourly, length ~168
  const now = Date.now()
  const points = spark.map((p, i) => ({
    t: now - (spark.length - 1 - i) * 60 * 60 * 1000,
    p,
  }))
  if (days === "1") return points.slice(-24)
  if (days === "7") return points.slice(-168)
  if (days === "30") {
    // Downsample to ~30 points (1/day-ish)
    const step = Math.max(1, Math.floor(points.length / 30))
    return points.filter((_, i) => i % step === 0).slice(-30)
  }
  return points
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url)
  const vs = (searchParams.get("vs_currency") || "usd").toLowerCase()
  const days = String(searchParams.get("days") || "7")
  const { id } = await ctx.params

  const key = `${id}|${vs}|${days}`
  const now = Date.now()

  // Serve fresh cache if valid
  const hit = cache.get(key)
  if (hit && now - hit.ts < TTL) {
    return NextResponse.json(hit.json, { headers: { "x-cache": "HIT" } })
  }

  // Single-flight: avoid dogpiling CoinGecko
  if (inflight.has(key)) {
    const json = await inflight.get(key)!
    return NextResponse.json(json, { headers: { "x-cache": "JOIN" } })
  }

  const p = (async () => {
    const base = "https://api.coingecko.com/api/v3"

    // Ask for sparkline on info for fallback; chart may throttle
    const infoUrl =
      `${base}/coins/${encodeURIComponent(id)}` +
      `?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`

    // Choose a reasonable interval for the range
    const interval = days === "1" ? "minutely" : days === "7" ? "hourly" : "daily"
    const chartUrl =
      `${base}/coins/${encodeURIComponent(id)}/market_chart` +
      `?vs_currency=${encodeURIComponent(vs)}&days=${encodeURIComponent(days)}&interval=${interval}`

    try {
      // Try both; whichever gives us enough to render
      const [infoRes, chartRes] = await Promise.allSettled([
        fetchWithRetry(infoUrl, { headers: cgHeaders(), cache: "no-store" }, 3),
        fetchWithRetry(chartUrl, { headers: cgHeaders(), cache: "no-store" }, 3),
      ])

      let info: any = null
      let chart: any = null

      if (infoRes.status === "fulfilled") {
        info = await infoRes.value.json()
      }
      if (chartRes.status === "fulfilled") {
        chart = await chartRes.value.json()
      }

      const md = info?.market_data ?? {}

      // --- details ---
      // Contract (prefer Solana if present)
      let contract: string | null = null
      if (info?.platforms && typeof info.platforms === "object") {
        if (info.platforms.solana) contract = info.platforms.solana || null
        else {
          const first = Object.values(info.platforms).find((v: any) => typeof v === "string" && v)
          contract = (first as string) || null
        }
      }

      // Explorers
      const explorers: string[] = Array.isArray(info?.links?.blockchain_site)
        ? info.links.blockchain_site.filter((u: string) => !!u).slice(0, 5)
        : []

      const details: TokenDetails = {
        id: String(info?.id ?? id),
        symbol: String(info?.symbol ?? "").toUpperCase(),
        name: String(info?.name ?? id),
        image: info?.image?.large || info?.image?.small || info?.image?.thumb || null,
        price: typeof md?.current_price?.[vs] === "number" ? md.current_price[vs] : null,
        change1h:
          typeof md?.price_change_percentage_1h_in_currency?.[vs] === "number"
            ? md.price_change_percentage_1h_in_currency[vs]
            : null,
        change24h:
          typeof md?.price_change_percentage_24h_in_currency?.[vs] === "number"
            ? md.price_change_percentage_24h_in_currency[vs]
            : null,
        change7d:
          typeof md?.price_change_percentage_7d_in_currency?.[vs] === "number"
            ? md.price_change_percentage_7d_in_currency[vs]
            : null,
        marketCap: typeof md?.market_cap?.[vs] === "number" ? md.market_cap[vs] : null,
        volume: typeof md?.total_volume?.[vs] === "number" ? md.total_volume[vs] : null,
        fdv: typeof md?.fully_diluted_valuation?.[vs] === "number" ? md.fully_diluted_valuation[vs] : null,
        circulatingSupply: Number.isFinite(md?.circulating_supply) ? md.circulating_supply : null,
        totalSupply: Number.isFinite(md?.total_supply) ? md.total_supply : null,
        maxSupply: Number.isFinite(md?.max_supply) ? md.max_supply : null,
        contract,
        explorers,
        homepage: Array.isArray(info?.links?.homepage) ? info.links.homepage[0] ?? null : null,
        twitter: info?.links?.twitter_screen_name ? `https://twitter.com/${info.links.twitter_screen_name}` : null,
        discord: info?.links?.chat_url?.[0] ?? null,
      }

      // --- chart ---
      let prices: ChartPoint[] = []
      if (Array.isArray(chart?.prices) && chart.prices.length) {
        prices = chart.prices.map((p: [number, number]) => ({ t: p[0], p: p[1] }))
      } else {
        // fallback to hourly sparkline (7d) from info
        const spark = info?.market_data?.sparkline_7d?.price
        prices = fallbackFromSparkline(spark, days)
      }

      if (!prices.length) {
        // Last resort: if we had a stale cache, serve it
        if (hit) {
          return { json: hit.json, headers: { "x-cache": "STALE" } }
        }
        throw new Error("no_chart_data")
      }

      const json = { details, prices, updatedAt: Date.now(), source: "coingecko" }
      cache.set(key, { ts: Date.now(), json })
      return { json, headers: { "x-cache": hit ? "REFRESH" : "MISS" } }
    } catch (e: any) {
      // Serve stale if we have it
      if (hit) {
        return { json: hit.json, headers: { "x-cache": "STALE" } }
      }
      throw e
    }
  })()

  inflight.set(key, p)
  try {
    const { json, headers } = await p
    return NextResponse.json(json, { headers })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "fetch_failed" }, { status: 502 })
  } finally {
    inflight.delete(key)
  }
}
