// app/api/tokens/top/route.ts
import { NextResponse, NextRequest } from "next/server"

export const dynamic = "force-dynamic"
// If you want this to run on the edge, uncomment:
// export const runtime = "edge"

type RowOut = {
  id: string
  symbol: string
  name: string
  logoUrl: string | null
  price: number | null
  change1h: number | null
  change24h: number | null
  change7d: number | null
  volume: number | null
  marketCap: number | null
  sparkline?: number[]
}

type CacheEntry = { ts: number; json: any }

// ---- global in-memory stores (persist for server process) ----
const g = globalThis as any
if (!g.__TOKENS_TOP_CACHE__) g.__TOKENS_TOP_CACHE__ = new Map<string, CacheEntry>()
if (!g.__TOKENS_TOP_INFLIGHT__) g.__TOKENS_TOP_INFLIGHT__ = new Map<string, Promise<any>>()

const cache: Map<string, CacheEntry> = g.__TOKENS_TOP_CACHE__
const inflight: Map<string, Promise<any>> = g.__TOKENS_TOP_INFLIGHT__

// ---- tuning knobs ----
const TTL = 2 * 60 * 1000 // local in-process cache (2m)
const FETCH_TIMEOUT_MS = 10_000 // hard timeout per upstream attempt
const MAX_PER_PAGE = 100 // be nice to CG on free plan

// Helpful sleep
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function cgHeaders(): HeadersInit {
  const h: Record<string, string> = { accept: "application/json" }
  const demo = process.env.COINGECKO_API_KEY || process.env.CG_DEMO_API_KEY
  const pro = process.env.CG_PRO_API_KEY
  if (demo) h["x-cg-demo-api-key"] = demo
  if (pro) h["x-cg-pro-api-key"] = pro
  return h
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store", next: { revalidate: 0 } })
    return r
  } finally {
    clearTimeout(id)
  }
}

async function fetchWithRetry(url: string, init?: RequestInit, tries = 3) {
  let err: any
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetchWithTimeout(url, init)
      if (r.ok) return r

      // Respect 429 / 5xx with backoff (and Retry-After if sent)
      if (r.status === 429 || r.status >= 500) {
        const ra = r.headers.get("retry-after")
        const wait = ra ? Number(ra) * 1000 : 500 * (i + 1) + Math.floor(Math.random() * 300)
        await sleep(wait)
        continue
      }
      // Other status = fatal
      throw new Error(`${r.status} ${await r.text()}`)
    } catch (e) {
      err = e
      // network/timeout -> backoff
      await sleep(500 * (i + 1) + Math.floor(Math.random() * 300))
    }
  }
  throw err
}

function buildKey(vs: string, category: string, per_page: number, page: number, order: string) {
  return `${vs}|${category}|${per_page}|${page}|${order}`
}

function edgeCacheHeaders(xcache: "HIT" | "MISS" | "STALE") {
  return {
    "x-cache": xcache,
    // CDN/Edge cache for ALL users/regions; origin still enforces our in-proc TTL + single-flight.
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    "Content-Type": "application/json",
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vs = (searchParams.get("vs_currency") || "usd").toLowerCase()
  // ✅ correct CoinGecko slug
  const category = (searchParams.get("category") || "letsbonk-fun-ecosystem").toLowerCase()
  const per_page = Math.min(Number(searchParams.get("per_page") || "100"), MAX_PER_PAGE)
  const page = Math.max(1, Number(searchParams.get("page") || "1"))
  const order = searchParams.get("order") || "market_cap_desc"

  const key = buildKey(vs, category, per_page, page, order)
  const now = Date.now()
  const hit = cache.get(key)

  // Serve fresh local cache fast
  if (hit && now - hit.ts < TTL) {
    return new Response(JSON.stringify(hit.json), { headers: edgeCacheHeaders("HIT") })
  }

  // Collapse concurrent cache misses
  if (inflight.has(key)) {
    const data = await inflight.get(key)!
    return new Response(JSON.stringify(data), { headers: edgeCacheHeaders("HIT") })
  }

  const qs = new URLSearchParams({
    vs_currency: vs,
    category,
    order,
    per_page: String(per_page),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  })
  const url = `https://api.coingecko.com/api/v3/coins/markets?${qs.toString()}`

  const p = (async () => {
    try {
      const r = await fetchWithRetry(url, { headers: cgHeaders() }, 3)
      const rows = (await r.json()) as any[]

      const tokens: RowOut[] = rows.map((row) => ({
        id: String(row.id),
        symbol: String(row.symbol ?? "").toUpperCase(),
        name: String(row.name ?? ""),
        logoUrl: row.image || null,
        price: typeof row.current_price === "number" ? row.current_price : null,
        change1h:
          typeof row.price_change_percentage_1h_in_currency === "number"
            ? row.price_change_percentage_1h_in_currency
            : null,
        change24h:
          typeof row.price_change_percentage_24h_in_currency === "number"
            ? row.price_change_percentage_24h_in_currency
            : null,
        change7d:
          typeof row.price_change_percentage_7d_in_currency === "number"
            ? row.price_change_percentage_7d_in_currency
            : null,
        volume: typeof row.total_volume === "number" ? row.total_volume : null,
        marketCap: typeof row.market_cap === "number" ? row.market_cap : null,
        sparkline: Array.isArray(row?.sparkline_in_7d?.price)
          ? row.sparkline_in_7d.price.slice(-168)
          : undefined,
      }))

      const totalMarketCap = tokens.reduce((s, t) => s + (t.marketCap ?? 0), 0)
      const totalVolume = tokens.reduce((s, t) => s + (t.volume ?? 0), 0)
      const avg24h =
        tokens.length ? tokens.reduce((s, t) => s + (t.change24h ?? 0), 0) / tokens.length : null

      const json = {
        tokens,
        meta: { totalMarketCap, totalVolume, avg24h, updatedAt: Date.now(), source: "coingecko" },
      }

      cache.set(key, { ts: Date.now(), json })
      return json
    } catch (e: any) {
      // On upstream failure, return stale if we have it
      if (hit) {
        return { ...hit.json, stale: true, error: "upstream" }
      }
      // Surface minimal error if no cache exists
      throw new Response(JSON.stringify({ error: e?.message || "fetch_failed" }), { status: 502 })
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, p)

  try {
    const data = await p
    // Distinguish MISS vs STALE for debugging
    const x = data?.stale ? "STALE" : "MISS"
    return new Response(JSON.stringify(data), { headers: edgeCacheHeaders(x as any) })
  } catch (resp) {
    // If p threw a Response (502), just return it
    if (resp instanceof Response) return resp
    return new Response(JSON.stringify({ error: "unknown_error" }), { status: 502 })
  }
}
