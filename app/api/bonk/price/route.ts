import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

type Out = {
  symbol: "BONK"
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  sentiment: "neutral"
  socialVolume: number
  mindshareRank: number
  updatedAt: number
}

const toNum = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}
const ok = (n: any): n is number => typeof n === "number" && Number.isFinite(n)

async function fromCoinGecko(): Promise<Out | null> {
  const key = process.env.COINGECKO_API_KEY
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=bonk&vs_currencies=usd" +
    "&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
  const headers = new Headers()
  if (key) headers.set("x-cg-pro-api-key", key)

  const res = await fetch(url, { headers, cache: "no-store", next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const j = await res.json()
  const p = toNum(j?.bonk?.usd)
  const mc = toNum(j?.bonk?.usd_market_cap)
  const vol = toNum(j?.bonk?.usd_24h_vol)
  const chg = toNum(j?.bonk?.usd_24h_change)
  if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null
  return {
    symbol: "BONK",
    price: p,
    marketCap: mc,
    volume24h: vol,
    change24h: chg,
    sentiment: "neutral",
    socialVolume: 0,
    mindshareRank: 0,
    updatedAt: Date.now(),
  }
}

async function fromCMC(): Promise<Out | null> {
  const key = process.env.COINMARKETCAP_API_KEY
  if (!key) return null
  const url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BONK"
  const headers = new Headers({ "X-CMC_PRO_API_KEY": key })

  const res = await fetch(url, { headers, cache: "no-store" })
  if (!res.ok) throw new Error(`CMC ${res.status}`)
  const j = await res.json()
  const coin = j?.data?.BONK?.[0]
  const q = coin?.quote?.USD
  const p = toNum(q?.price)
  const mc = toNum(q?.market_cap)
  const vol = toNum(q?.volume_24h)
  const chg = toNum(q?.percent_change_24h)
  if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null
  return {
    symbol: "BONK",
    price: p,
    marketCap: mc,
    volume24h: vol,
    change24h: chg,
    sentiment: "neutral",
    socialVolume: 0,
    mindshareRank: 0,
    updatedAt: Date.now(),
  }
}

async function fromCryptoCompare(): Promise<Out | null> {
  const key = process.env.CRYPTOPCOMPARE_API_KEY
  const url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BONK&tsyms=USD"
  const headers = new Headers()
  if (key) headers.set("Authorization", `Apikey ${key}`)

  const res = await fetch(url, { headers, cache: "no-store" })
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`)
  const j = await res.json()
  const r = j?.RAW?.BONK?.USD
  const p = toNum(r?.PRICE)
  const mc = toNum(r?.MKTCAP)
  const vol = toNum(r?.TOTALVOLUME24H)
  const chg = toNum(r?.CHANGEPCT24HOUR)
  if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null
  return {
    symbol: "BONK",
    price: p,
    marketCap: mc,
    volume24h: vol,
    change24h: chg,
    sentiment: "neutral",
    socialVolume: 0,
    mindshareRank: 0,
    updatedAt: Date.now(),
  }
}

async function fromMessari(): Promise<Out | null> {
  const key = process.env.MESSARI_API_KEY
  const url = "https://data.messari.io/api/v1/assets/bonk/metrics"
  const headers = new Headers()
  if (key) headers.set("x-messari-api-key", key)

  const res = await fetch(url, { headers, cache: "no-store" })
  if (!res.ok) throw new Error(`Messari ${res.status}`)
  const j = await res.json()
  const p = toNum(j?.data?.market_data?.price_usd)
  const mc =
    toNum(j?.data?.marketcap?.current_marketcap_usd) ??
    toNum(j?.data?.marketcap?.liquid_marketcap_usd)
  const vol =
    toNum(j?.data?.market_data?.volume_last_24_hours) ??
    toNum(j?.data?.market_data?.real_volume_last_24_hours)
  const chg = toNum(j?.data?.market_data?.percent_change_usd_last_24_hours)
  if (!ok(p)) return null
  return {
    symbol: "BONK",
    price: p,
    marketCap: ok(mc) ? mc! : 0,
    volume24h: ok(vol) ? vol! : 0,
    change24h: ok(chg) ? chg! : 0,
    sentiment: "neutral",
    socialVolume: 0,
    mindshareRank: 0,
    updatedAt: Date.now(),
  }
}

export async function GET() {
  const tried: string[] = []
  const providers: Array<[string, () => Promise<Out | null>]> = [
    ["coingecko", fromCoinGecko],
    ["coinmarketcap", fromCMC],
    ["cryptocompare", fromCryptoCompare],
    ["messari", fromMessari],
  ]

  for (const [name, fn] of providers) {
    try {
      const out = await fn()
      if (out) {
        return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } })
      }
      tried.push(`${name}: parse-null`)
    } catch (e: any) {
      tried.push(`${name}: ${e?.message || e}`)
    }
  }

  return NextResponse.json({ error: "Failed to resolve BONK price", providers: tried }, { status: 502 })
}

