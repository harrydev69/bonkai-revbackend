// app/lib/letsbonk-list.ts
import "server-only"

type CgCoin = { id: string; symbol: string; name: string }
type JupToken = {
  address: string
  chainId: number
  name: string
  symbol: string
  logoURI?: string
  extensions?: { coingeckoId?: string }
}

export type EcoToken = { mint: string; symbol: string; name: string; coingeckoId?: string }

const LB_CATEGORY = "bonk-fun-ecosystem"
const TTL = 12 * 60 * 60 * 1000 // 12h

// in-memory cache
const g = globalThis as any
if (!g.__LB_MEMBERS__) g.__LB_MEMBERS__ = { list: null as EcoToken[] | null, ts: 0 }
const cache = g.__LB_MEMBERS__ as { list: EcoToken[] | null; ts: number }

// tiny seed list used only if CG/Jup both fail
const SEEDS: EcoToken[] = [
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    coingeckoId: "bonk",
  },
]

function cgHeaders(): HeadersInit {
  const h: Record<string, string> = { accept: "application/json" }
  const demo = process.env.COINGECKO_API_KEY || process.env.CG_DEMO_API_KEY
  const pro  = process.env.CG_PRO_API_KEY
  if (demo) h["x-cg-demo-api-key"] = demo
  if (pro)  h["x-cg-pro-api-key"] = pro
  return h
}

async function fetchWithRetry(url: string, init?: RequestInit, tries = 3) {
  let err: any
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, init)
      if (r.ok) return r
      if (r.status === 429 || r.status >= 500) {
        await new Promise(res => setTimeout(res, 700 * (i + 1)))
        continue
      }
      throw new Error(`${url} -> ${r.status}`)
    } catch (e) {
      err = e
      await new Promise(res => setTimeout(res, 700 * (i + 1)))
    }
  }
  throw err
}

async function fetchCgMembers(): Promise<CgCoin[]> {
  const qs = new URLSearchParams({
    vs_currency: "usd",
    category: LB_CATEGORY,
    order: "market_cap_desc",
    per_page: "250",
    page: "1",
    sparkline: "false",
  })
  const url = `https://api.coingecko.com/api/v3/coins/markets?${qs.toString()}`
  const r = await fetchWithRetry(url, { headers: cgHeaders() })
  const rows = (await r.json()) as any[]
  return rows.map((r) => ({
    id: String(r.id),
    symbol: String(r.symbol ?? "").toUpperCase(),
    name: String(r.name ?? ""),
  }))
}

async function fetchJupIndex() {
  const r = await fetchWithRetry("https://token.jup.ag/strict", { next: { revalidate: 86400 } })
  const list = (await r.json()) as JupToken[]
  const byCg = new Map<string, JupToken>()
  const bySym = new Map<string, JupToken[]>()

  for (const t of list) {
    if (t.chainId !== 101) continue // Solana only
    const cg = t.extensions?.coingeckoId?.toLowerCase()
    if (cg) byCg.set(cg, t)
    const s = (t.symbol || "").toUpperCase()
    if (!s) continue
    const arr = bySym.get(s) ?? []
    arr.push(t)
    bySym.set(s, arr)
  }

  return { byCg, bySym }
}

async function buildList(): Promise<EcoToken[]> {
  const [cg, jup] = await Promise.all([fetchCgMembers(), fetchJupIndex()])
  const out: EcoToken[] = []

  for (const c of cg) {
    const key = c.id?.toLowerCase()
    let t = key ? jup.byCg.get(key) : undefined
    if (!t) {
      const sym = (c.symbol || "").toUpperCase()
      const cand = jup.bySym.get(sym)
      if (cand && cand.length) t = cand[0]
    }
    if (!t) continue
    out.push({ mint: t.address, symbol: t.symbol.toUpperCase(), name: t.name, coingeckoId: c.id })
  }

  // ensure BONK present
  if (!out.find((x) => x.mint === SEEDS[0].mint)) out.unshift(SEEDS[0])
  return out
}

export async function getLetsBonkMints(): Promise<EcoToken[]> {
  const now = Date.now()
  if (cache.list && now - cache.ts < TTL) return cache.list
  try {
    const list = await buildList()
    cache.list = list
    cache.ts = now
    return list
  } catch {
    // serve last-good or seeds
    return cache.list ?? SEEDS
  }
}
