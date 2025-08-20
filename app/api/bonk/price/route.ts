// app/api/bonk/price/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = 'edge'; // Process closer to users for faster response

type Out = {
  symbol: "BONK";
  currency: "USD";
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  sentiment: "neutral";
  socialVolume: number;
  mindshareRank: number;
  updatedAt: number;
  sourceUpdatedAt?: number;
  provider: "coingecko" | "coinmarketcap" | "cryptocompare" | "messari";
};

// In-memory fallback cache to avoid 502s when all providers fail temporarily
let lastGoodOut: Out | null = null;
let lastGoodAt = 0;
const FALLBACK_TTL_MS = 60_000; // serve last good for up to 60s if providers fail
const SOFT_CACHE_MS = 10_000; // serve last good immediately for up to 10s to collapse bursts

type Provider = Out["provider"];
const backoffUntil: Record<Provider, number> = {
  coingecko: 0,
  coinmarketcap: 0,
  cryptocompare: 0,
  messari: 0,
};

function setBackoff(provider: Provider, ms: number) {
  backoffUntil[provider] = Date.now() + ms;
}

function isBackedOff(provider: Provider) {
  return Date.now() < backoffUntil[provider];
}

const toNum = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const ok = (n: any): n is number => typeof n === "number" && Number.isFinite(n);

// Fast timeout with race condition (slightly higher to avoid false timeouts)
async function withTimeout<T>(p: Promise<T>, ms = 3000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

// Fast CoinGecko fetch (most reliable)
async function fromCoinGecko(signal?: AbortSignal): Promise<Out | null> {
  try {
    const key = process.env.COINGECKO_API_KEY;
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bonk&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
    
    const headers = new Headers();
    if (key) headers.set("x-cg-pro-api-key", key);
    headers.set("accept", "application/json");

    const res = await withTimeout(fetch(url, { 
      headers, 
      cache: "no-store",
      // Add keep-alive for faster connections
      keepalive: true,
      signal
    }));
    
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) setBackoff("coingecko", 90_000);
      if (res.status === 401 || res.status === 403 || res.status === 429) return null;
      throw new Error(`CoinGecko ${res.status}`);
    }
    const j = await res.json();
    
    const p = toNum(j?.bonk?.usd);
    const mc = toNum(j?.bonk?.usd_market_cap);
    const vol = toNum(j?.bonk?.usd_24h_vol);
    const chg = toNum(j?.bonk?.usd_24h_change);
    
    if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null;

    return {
      symbol: "BONK",
      currency: "USD",
      price: p,
      marketCap: mc,
      volume24h: vol,
      change24h: chg,
      sentiment: "neutral",
      socialVolume: 0,
      mindshareRank: 0,
      updatedAt: Date.now(),
      provider: "coingecko",
    };
  } catch (error) {
    console.error("CoinGecko error:", error);
    return null;
  }
}

// Fast CoinMarketCap fetch
async function fromCMC(signal?: AbortSignal): Promise<Out | null> {
  try {
    const key = process.env.COINMARKETCAP_API_KEY;
    if (!key) return null;
    
    const url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BONK";
    const headers = new Headers({ "X-CMC_PRO_API_KEY": key });
    headers.set("accept", "application/json");

    const res = await withTimeout(fetch(url, { 
      headers, 
      cache: "no-store",
      keepalive: true,
      signal
    }));
    
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) setBackoff("coinmarketcap", 90_000);
      if (res.status === 401 || res.status === 403 || res.status === 429) return null;
      throw new Error(`CMC ${res.status}`);
    }
    const j = await res.json();
    
    const coin = j?.data?.BONK?.[0];
    const q = coin?.quote?.USD;
    
    const p = toNum(q?.price);
    const mc = toNum(q?.market_cap);
    const vol = toNum(q?.volume_24h);
    const chg = toNum(q?.percent_change_24h);
    
    if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null;

    let sourceUpdatedAt: number | undefined;
    const ts = q?.last_updated || j?.status?.timestamp;
    if (ts) {
      const t = new Date(ts).getTime();
      if (Number.isFinite(t)) sourceUpdatedAt = t;
    }

    return {
      symbol: "BONK",
      currency: "USD",
      price: p,
      marketCap: mc,
      volume24h: vol,
      change24h: chg,
      sentiment: "neutral",
      socialVolume: 0,
      mindshareRank: 0,
      updatedAt: Date.now(),
      sourceUpdatedAt,
      provider: "coinmarketcap",
    };
  } catch (error) {
    console.error("CMC error:", error);
    return null;
  }
}

// Fast CryptoCompare fetch
async function fromCryptoCompare(signal?: AbortSignal): Promise<Out | null> {
  try {
    const key = process.env.CRYPTOPCOMPARE_API_KEY;
    const url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BONK&tsyms=USD";
    
    const headers = new Headers();
    if (key) headers.set("Authorization", `Apikey ${key}`);
    headers.set("accept", "application/json");

    const res = await withTimeout(fetch(url, { 
      headers, 
      cache: "no-store",
      keepalive: true,
      signal
    }));
    
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) setBackoff("cryptocompare", 60_000);
      if (res.status === 401 || res.status === 403 || res.status === 429) return null;
      throw new Error(`CryptoCompare ${res.status}`);
    }
    const j = await res.json();
    
    const r = j?.RAW?.BONK?.USD;
    const p = toNum(r?.PRICE);
    const mc = toNum(r?.MKTCAP);
    const vol = toNum(r?.TOTALVOLUME24H);
    const chg = toNum(r?.CHANGEPCT24HOUR);
    
    if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null;

    let sourceUpdatedAt: number | undefined;
    const ts = r?.LASTUPDATE;
    if (ok(ts)) sourceUpdatedAt = Number(ts) * 1000;

    return {
      symbol: "BONK",
      currency: "USD",
      price: p,
      marketCap: mc,
      volume24h: vol,
      change24h: chg,
      sentiment: "neutral",
      socialVolume: 0,
      mindshareRank: 0,
      updatedAt: Date.now(),
      sourceUpdatedAt,
      provider: "cryptocompare",
    };
  } catch (error) {
    console.error("CryptoCompare error:", error);
    return null;
  }
}

// Fast Messari fetch
async function fromMessari(signal?: AbortSignal): Promise<Out | null> {
  try {
    const key = process.env.MESSARI_API_KEY;
    if (!key) return null; // skip if not configured
    const url = "https://data.messari.io/api/v1/assets/bonk/metrics";
    
    const headers = new Headers();
    if (key) headers.set("x-messari-api-key", key);
    headers.set("accept", "application/json");

    const res = await withTimeout(fetch(url, { 
      headers, 
      cache: "no-store",
      keepalive: true,
      signal
    }));
    
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) setBackoff("messari", 60_000);
      if (res.status === 401 || res.status === 403 || res.status === 429) return null;
      throw new Error(`Messari ${res.status}`);
    }
    const j = await res.json();

    const p = toNum(j?.data?.market_data?.price_usd);
    const mc = toNum(j?.data?.marketcap?.current_marketcap_usd) ?? toNum(j?.data?.marketcap?.liquid_marketcap_usd);
    const vol = toNum(j?.data?.market_data?.volume_last_24_hours) ?? toNum(j?.data?.market_data?.real_volume_last_24_hours);
    const chg = toNum(j?.data?.market_data?.percent_change_usd_last_24_hours);
    
    if (!ok(p)) return null;

    let sourceUpdatedAt: number | undefined;
    const ts = j?.status?.timestamp || j?.data?.market_data?.last_trade_at;
    if (ts) {
      const t = new Date(ts).getTime();
      if (Number.isFinite(t)) sourceUpdatedAt = t;
    }

    return {
      symbol: "BONK",
      currency: "USD",
      price: p,
      marketCap: ok(mc) ? mc! : 0,
      volume24h: ok(vol) ? vol! : 0,
      change24h: ok(chg) ? chg! : 0,
      sentiment: "neutral",
      socialVolume: 0,
      mindshareRank: 0,
      updatedAt: Date.now(),
      sourceUpdatedAt,
      provider: "messari",
    };
  } catch (error) {
    console.error("Messari error:", error);
    return null;
  }
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Short soft-cache to collapse bursts
    if (lastGoodOut && Date.now() - lastGoodAt < SOFT_CACHE_MS) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json(lastGoodOut, {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "X-Response-Time": `${responseTime}ms`,
          "X-Cache": "soft-hit",
        },
      });
    }

    // Race providers with a CoinGecko head-start; abort losers when one succeeds
    // Head-start schedule (ms): CG 0, CC 400, CMC 800, Messari 1200
    const providerFns = [fromCoinGecko, fromCryptoCompare, fromCMC, fromMessari] as const;
    const providerNames: Provider[] = ["coingecko", "cryptocompare", "coinmarketcap", "messari"];
    const baseDelays = [0, 400, 800, 1200];

    // Skip providers currently in backoff window
    const indices = providerFns
      .map((_, i) => i)
      .filter((i) => !isBackedOff(providerNames[i]));

    const controllers = indices.map(() => new AbortController());

    const delayedAttempt = (fn: (s?: AbortSignal) => Promise<Out | null>, ctrl: AbortController, delayMs: number) =>
      new Promise<Out>((resolve, reject) => {
        const start = () => {
          fn(ctrl.signal)
            .then((out) => {
              if (out) resolve(out);
              else reject(new Error("no_data"));
            })
            .catch(reject);
        };
        if (delayMs > 0) setTimeout(start, delayMs); else start();
      });

    const attempts = indices.map((idx, i) => {
      const fn = providerFns[idx];
      const delay = baseDelays[idx];
      return delayedAttempt(fn, controllers[i], delay);
    });

    let data: Out | null = null;
    try {
      // First provider to succeed wins
      data = await Promise.any(attempts);
      // Abort others to reduce load
      controllers.forEach((c) => {
        try { c.abort(); } catch {}
      });
    } catch (e) {
      data = null;
    }

    if (data) {
      lastGoodOut = data;
      lastGoodAt = Date.now();
      const responseTime = Date.now() - startTime;
      console.log(`✅ BONK price fetched in ${responseTime}ms from ${data.provider}`);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Response-Time": `${responseTime}ms`,
          "X-Provider": data.provider,
        }
      });
    }

    // If all providers failed, fall back to last good within TTL
    if (lastGoodOut && Date.now() - lastGoodAt < FALLBACK_TTL_MS) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json(lastGoodOut, {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "X-Response-Time": `${responseTime}ms`,
          "X-Cache": "stale-hit"
        }
      });
    }

    // Gather detailed errors for observability (after all delayed attempts have fired)
    const results = await Promise.allSettled(attempts);
    const errors = results.map((r, idx) => {
      if (r.status === 'rejected') {
        const msg = (r.reason && (r.reason.message || String(r.reason))) || 'unknown';
        return `p${idx}:${msg}`;
      }
      return '';
    }).filter(Boolean);
    console.error("❌ All BONK price providers failed", { errors });

    return NextResponse.json(
      {
        error: "Failed to fetch BONK price from all providers",
        errors,
        updatedAt: Date.now()
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
          "X-Response-Time": `${Date.now() - startTime}ms`
        }
      }
    );
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("❌ BONK price API error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: Date.now() 
      },
      { 
        status: 500, 
        headers: { 
          "Cache-Control": "no-store",
          "X-Response-Time": `${responseTime}ms`
        } 
      }
    );
  }
}
