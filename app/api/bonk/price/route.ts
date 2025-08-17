// app/api/bonk/price/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// Optional: uncomment if you want lower latency on Vercel
// export const runtime = "edge";

type Out = {
  symbol: "BONK";
  currency: "USD";
  price: number;        // raw, in USD
  marketCap: number;    // USD
  volume24h: number;    // USD
  change24h: number;    // percent, e.g. -2.34
  sentiment: "neutral"; // reserved for future merge
  socialVolume: number; // reserved for future merge
  mindshareRank: number;// reserved for future merge
  updatedAt: number;    // server time (ms)
  sourceUpdatedAt?: number; // provider time (ms), if available
  provider: "coingecko" | "coinmarketcap" | "cryptocompare" | "messari";
};

const toNum = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const ok = (n: any): n is number => typeof n === "number" && Number.isFinite(n);

// Small helper to timeout fetches
async function withTimeout<T>(p: Promise<T>, ms = 3000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function fromCoinGecko(): Promise<Out | null> {
  const key = process.env.COINGECKO_API_KEY;
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=bonk&vs_currencies=usd" +
    "&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
  const headers = new Headers();
  if (key) headers.set("x-cg-pro-api-key", key);

  const res = await withTimeout(fetch(url, { headers, cache: "no-store", next: { revalidate: 0 } }));
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const j = await res.json();
  const p = toNum(j?.bonk?.usd);
  const mc = toNum(j?.bonk?.usd_market_cap);
  const vol = toNum(j?.bonk?.usd_24h_vol);
  const chg = toNum(j?.bonk?.usd_24h_change); // already percent
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
}

async function fromCMC(): Promise<Out | null> {
  const key = process.env.COINMARKETCAP_API_KEY;
  if (!key) return null;
  const url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BONK";
  const headers = new Headers({ "X-CMC_PRO_API_KEY": key });

  const res = await withTimeout(fetch(url, { headers, cache: "no-store" }));
  if (!res.ok) throw new Error(`CMC ${res.status}`);
  const j = await res.json();
  const coin = j?.data?.BONK?.[0];
  const q = coin?.quote?.USD;
  const p = toNum(q?.price);
  const mc = toNum(q?.market_cap);
  const vol = toNum(q?.volume_24h);
  const chg = toNum(q?.percent_change_24h); // percent
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
}

async function fromCryptoCompare(): Promise<Out | null> {
  const key = process.env.CRYPTOPCOMPARE_API_KEY;
  const url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BONK&tsyms=USD";
  const headers = new Headers();
  if (key) headers.set("Authorization", `Apikey ${key}`);

  const res = await withTimeout(fetch(url, { headers, cache: "no-store" }));
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const j = await res.json();
  const r = j?.RAW?.BONK?.USD;
  const p = toNum(r?.PRICE);
  const mc = toNum(r?.MKTCAP);
  const vol = toNum(r?.TOTALVOLUME24H);
  const chg = toNum(r?.CHANGEPCT24HOUR); // percent
  if (!ok(p) || !ok(mc) || !ok(vol) || !ok(chg)) return null;

  let sourceUpdatedAt: number | undefined;
  const ts = r?.LASTUPDATE; // unix seconds
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
}

async function fromMessari(): Promise<Out | null> {
  const key = process.env.MESSARI_API_KEY;
  const url = "https://data.messari.io/api/v1/assets/bonk/metrics";
  const headers = new Headers();
  if (key) headers.set("x-messari-api-key", key);

  const res = await withTimeout(fetch(url, { headers, cache: "no-store" }));
  if (!res.ok) throw new Error(`Messari ${res.status}`);
  const j = await res.json();

  const p = toNum(j?.data?.market_data?.price_usd);
  const mc =
    toNum(j?.data?.marketcap?.current_marketcap_usd) ??
    toNum(j?.data?.marketcap?.liquid_marketcap_usd);
  const vol =
    toNum(j?.data?.market_data?.volume_last_24_hours) ??
    toNum(j?.data?.market_data?.real_volume_last_24_hours);
  const chg = toNum(j?.data?.market_data?.percent_change_usd_last_24_hours); // percent
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
}

export async function GET() {
  const tried: string[] = [];
  const providers: Array<[Out["provider"], () => Promise<Out | null>]> = [
    ["coingecko", fromCoinGecko],
    ["coinmarketcap", fromCMC],
    ["cryptocompare", fromCryptoCompare],
    ["messari", fromMessari],
  ];

  for (const [name, fn] of providers) {
    try {
      const out = await fn();
      if (out) {
        return NextResponse.json(out, {
          headers: { "Cache-Control": "no-store" },
        });
      }
      tried.push(`${name}: parse-null`);
    } catch (e: any) {
      tried.push(`${name}: ${e?.message || e}`);
    }
  }

  return NextResponse.json(
    { error: "Failed to resolve BONK price", providers: tried, updatedAt: Date.now() },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
}
