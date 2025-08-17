// app/services/useBonk.ts
import { useEffect, useMemo, useRef, useState } from "react";

export type PriceOut = {
  symbol: "BONK";
  currency?: "USD";
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  updatedAt: number;
  sourceUpdatedAt?: number;
  provider?: "coingecko" | "coinmarketcap" | "cryptocompare" | "messari";
};

export type SentimentOut = {
  score: number;        // 0..100 assumed
  change24h: number;
  mentions24h: number;
  lastUpdated: string;
  source: "lunarcrush";
};

async function safeJson(res: Response) {
  if (!res.ok) throw new Error(String(res.status));
  try {
    return await res.json();
  } catch {
    throw new Error("bad_json");
  }
}

async function fetchWithRetry(url: string, init?: RequestInit, retries = 1, delayMs = 600) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (e) {
    if (retries <= 0) throw e;
    await new Promise((r) => setTimeout(r, delayMs));
    const res2 = await fetch(url, init);
    if (!res2.ok) throw new Error(String(res2.status));
    return await res2.json();
  }
}

export function useBonkPrice(opts: { stream?: boolean; interval?: number } = {}) {
  const { stream = true, interval = 5 } = opts;
  const [data, setData] = useState<PriceOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let canceled = false;

    async function prime() {
      try {
        setLoading(true);
        // small retry for 429/5xx
        const j = (await fetchWithRetry("/api/bonk/price", { cache: "no-store" })) as PriceOut;
        if (!canceled) {
          setData(j);
          setErr(null);
        }
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "fetch_error");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    prime();

    if (stream && typeof window !== "undefined") {
      const sec = Math.max(1, Math.floor(Number(interval) || 5));
      const es = new EventSource(`/api/bonk/stream?interval=${sec}`);
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const j = JSON.parse(ev.data) as PriceOut;
          setData((prev) => ({ ...(prev ?? j), ...j }));
        } catch {
          // likely keep-alive/comment; ignore
        }
      };

      es.onerror = () => {
        // let browser auto-reconnect; optionally surface to UI
      };

      return () => {
        es.close();
        esRef.current = null;
      };
    }

    return () => {
      canceled = true;
    };
  }, [stream, interval]);

  const up = useMemo(() => (data?.change24h ?? 0) >= 0, [data]);

  const safe: PriceOut = {
    symbol: "BONK",
    currency: "USD",
    price: data?.price ?? 0,
    marketCap: data?.marketCap ?? 0,
    volume24h: data?.volume24h ?? 0,
    change24h: data?.change24h ?? 0,
    updatedAt: data?.updatedAt ?? Date.now(),
    sourceUpdatedAt: data?.sourceUpdatedAt,
    provider: data?.provider,
  };

  return { data: safe, up, loading, err };
}

export function useBonkSentiment() {
  const [data, setData] = useState<SentimentOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const r = await fetch("/api/bonk/sentiment", { cache: "no-store" });
        const j = (await safeJson(r)) as SentimentOut;
        if (!canceled) {
          setData(j);
          setErr(null);
        }
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "fetch_error");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const safe: SentimentOut = {
    score: typeof data?.score === "number" ? data.score : 50,
    change24h: typeof data?.change24h === "number" ? data.change24h : 0,
    mentions24h: typeof data?.mentions24h === "number" ? data.mentions24h : 0,
    lastUpdated: data?.lastUpdated ?? new Date().toISOString(),
    source: "lunarcrush",
  };

  return { data: safe, loading, err };
}
