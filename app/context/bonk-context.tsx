"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type SentimentText = "bullish" | "bearish" | "neutral";

export interface BonkData {
  price: number;
  marketCap: number;
  change24h: number;
  volume24h: number;
  sentiment: SentimentText;
  socialVolume: number;
  mindshareRank: number;
}

type PriceOut = {
  symbol: "BONK";
  currency: "USD";
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  updatedAt: number;
  sourceUpdatedAt?: number;
  provider: "coingecko" | "coinmarketcap" | "cryptocompare" | "messari";
};

type SentimentOut = {
  score: number;        // 0..100 assumption
  change24h: number;
  mentions24h: number;
  lastUpdated: string;
  source: "lunarcrush";
};

type BonkContextValue = {
  bonkData: BonkData | null;
  loading: boolean;
  error?: string | null;
  lastUpdated: number | null;
};

const BonkContext = createContext<BonkContextValue>({
  bonkData: null,
  loading: true,
  lastUpdated: null,
});

export function BonkProvider({
  children,
  refreshMs = 30_000,     // 0 disables background updates
  useWebSocket = false,    // if true and refreshMs>0, use SSE stream instead of polling
}: {
  children: React.ReactNode;
  refreshMs?: number;
  useWebSocket?: boolean;
}) {
  const [price, setPrice] = useState<PriceOut | null>(null);
  const [senti, setSenti] = useState<SentimentOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function safeJson(res: Response) {
    if (!res.ok) throw new Error(String(res.status));
    try {
      return await res.json();
    } catch {
      throw new Error("bad_json");
    }
  }

  async function fetchBoth() {
    try {
      const [pr, se] = await Promise.all([
        fetch("/api/bonk/price", { cache: "no-store" }).then(safeJson),
        fetch("/api/bonk/sentiment", { cache: "no-store" }).then(safeJson),
      ]);
      setPrice(pr);
      setSenti(se);
      setErr(null);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setErr(e?.message || "load_error");
    }
  }

  const sentimentText: SentimentText = useMemo(() => {
    const score = senti?.score;
    if (typeof score !== "number") return "neutral";
    if (score >= 60) return "bullish";
    if (score <= 40) return "bearish";
    return "neutral";
  }, [senti]);

  const bonkData: BonkData | null = useMemo(() => {
    if (!price) return null;
    const nz = (n: unknown, fallback = 0): number =>
      typeof n === "number" && Number.isFinite(n) ? n : fallback;
    return {
      price: nz(price.price),
      marketCap: nz(price.marketCap),
      change24h: nz(price.change24h),
      volume24h: nz(price.volume24h),
      sentiment: sentimentText,
      socialVolume: 0,
      mindshareRank: 0,
    };
  }, [price, sentimentText]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      await fetchBoth();
      if (alive) setLoading(false);
    })();

    // tear down any previous stream/interval
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    if (refreshMs <= 0) {
      return () => { alive = false; };
    }

    if (useWebSocket) {
      const seconds = Math.max(1, Math.floor(refreshMs / 1000));
      const es = new EventSource(`/api/bonk/stream?interval=${seconds}`);
      esRef.current = es;
      es.onmessage = (ev) => {
        // some servers send keep-alives; ignore non-JSON
        try {
          const j = JSON.parse(ev.data) as PriceOut;
          setPrice(prev => ({ ...(prev ?? j), ...j }));
          setLastUpdated(Date.now());
        } catch {
          // ignore
        }
      };
      es.onerror = () => {
        // let browser auto-reconnect; could add UI toast here if desired
      };
      return () => { alive = false; es.close(); esRef.current = null; };
    } else {
      const id = setInterval(fetchBoth, refreshMs);
      pollRef.current = id;
      return () => { alive = false; clearInterval(id); pollRef.current = null; };
    }
  }, [refreshMs, useWebSocket]);

  return (
    <BonkContext.Provider value={{ bonkData, loading, error: err, lastUpdated }}>
      {children}
    </BonkContext.Provider>
  );
}

export function useBonk() {
  return useContext(BonkContext);
}
