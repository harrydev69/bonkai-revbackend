// app/api/tokens/top/route.ts
import { NextResponse } from "next/server"

// Next.js requires revalidate to be a constant value
export const revalidate = 120

type CgCoin = {
  id: string
  symbol: string
  name: string
  image: string | null
  current_price: number | null
  market_cap: number | null
  total_volume: number | null
  price_change_percentage_1h_in_currency?: number | null
  price_change_percentage_24h_in_currency?: number | null
  price_change_percentage_7d_in_currency?: number | null
}

type TokenRow = {
  id: string
  symbol: string
  name: string
  price: number | null
  change1h: number | null
  change24h: number | null
  change7d: number | null
  volume: number | null
  marketCap: number | null
  logoUrl: string | null
}

function cgHeaders(): HeadersInit {
  const headers: Record<string, string> = { accept: "application/json" }
  // Use any available key. Free/demo key uses x-cg-demo-api-key; Pro uses x-cg-pro-api-key.
  const demo = process.env.COINGECKO_API_KEY || process.env.CG_DEMO_API_KEY
  const pro = process.env.CG_PRO_API_KEY
  if (demo) headers["x-cg-demo-api-key"] = demo
  if (pro) headers["x-cg-pro-api-key"] = pro
  return headers
}

async function fetchCgWithRetry(url: string, tries = 3): Promise<CgCoin[]> {
  let lastErr: unknown = null
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: cgHeaders(), next: { revalidate } })
      if (r.ok) return (await r.json()) as CgCoin[]

      // Retry on rate-limit or server hiccups
      if (r.status === 429 || r.status >= 500) {
        await new Promise(res => setTimeout(res, 600 * (i + 1)))
        continue
      }

      const text = await r.text()
      throw new Error(`coingecko ${r.status}: ${text}`)
    } catch (e) {
      lastErr = e
      await new Promise(res => setTimeout(res, 600 * (i + 1)))
    }
  }
  throw lastErr ?? new Error("coingecko_unavailable")
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const vs = searchParams.get("vs_currency") ?? "usd"
    const ids = searchParams.get("ids")              // optional: comma-separated CG ids
    const category = searchParams.get("category")    // e.g. "bonk-fun-ecosystem"
    const perPage = String(searchParams.get("per_page") ?? 50)
    const page = String(searchParams.get("page") ?? 1)
    const order = searchParams.get("order") ?? "market_cap_desc"

    const qs = new URLSearchParams({
      vs_currency: vs,
      order,
      per_page: perPage,
      page,
      sparkline: "false",
      price_change_percentage: "1h,24h,7d",
    })
    if (ids && ids.trim()) qs.set("ids", ids.trim())
    if (category && category.trim()) qs.set("category", category.trim())

    const url = `https://api.coingecko.com/api/v3/coins/markets?${qs.toString()}`
    const rows = await fetchCgWithRetry(url, 3)

    const tokens: TokenRow[] = rows.map((c) => ({
      id: c.id,
      symbol: String(c.symbol ?? "").toUpperCase(),
      name: c.name,
      price: c.current_price ?? null,
      change1h: c.price_change_percentage_1h_in_currency ?? null,
      change24h: c.price_change_percentage_24h_in_currency ?? null,
      change7d: c.price_change_percentage_7d_in_currency ?? null,
      volume: c.total_volume ?? null,
      marketCap: c.market_cap ?? null,
      logoUrl: c.image ?? null, // pass CoinGecko image directly
    }))

    return NextResponse.json({ tokens }, { headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}` } })
  } catch (e: any) {
    // Brief stale fallback if we have an edge cache layer present; otherwise just return error
    return NextResponse.json({ error: String(e?.message ?? e ?? "coingecko_error") }, { status: 502 })
  }
}
