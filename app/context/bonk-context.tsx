"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { bonkDataService } from "../services/fast-data-service";

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

  // Fast data fetching with progressive loading
  const fetchBoth = useCallback(async () => {
    try {
      // Use fast data service for progressive loading
      const [pr, se] = await Promise.all([
        bonkDataService.getPrice(),
        bonkDataService.getSentiment(),
      ]);
      
      setPrice(pr);
      setSenti(se);
      setErr(null);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setErr(e?.message || "load_error");
    }
  }, []);

  // Prefetch data on mount for instant loading
  useEffect(() => {
    bonkDataService.prefetchAll().catch(() => {
      // Silently handle prefetch errors
    });
  }, []);

  // Memoize sentiment calculation
  const sentimentText: SentimentText = useMemo(() => {
    const score = senti?.score;
    if (typeof score !== "number") return "neutral";
    if (score >= 60) return "bullish";
    if (score <= 40) return "bearish";
    return "neutral";
  }, [senti]);

  // Memoize bonkData to prevent unnecessary re-renders
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

  // Optimized useEffect with proper cleanup and dependencies
  useEffect(() => {
    let alive = true;

    const initializeData = async () => {
      setLoading(true);
      await fetchBoth();
      if (alive) setLoading(false);
    };

    initializeData();

    // Cleanup previous connections
    if (esRef.current) { 
      esRef.current.close(); 
      esRef.current = null; 
    }
    if (pollRef.current) { 
      clearInterval(pollRef.current); 
      pollRef.current = null; 
    }

    if (refreshMs <= 0) {
      return () => { alive = false; };
    }

    if (useWebSocket) {
      const seconds = Math.max(1, Math.floor(refreshMs / 1000));
      const es = new EventSource(`/api/bonk/stream?interval=${seconds}`);
      esRef.current = es;
      
      es.onmessage = (ev) => {
        try {
          const j = JSON.parse(ev.data) as PriceOut;
          setPrice(prev => ({ ...(prev ?? j), ...j }));
          setLastUpdated(Date.now());
        } catch {
          // ignore invalid JSON
        }
      };
      
      es.onerror = () => {
        // let browser auto-reconnect
      };
      
      return () => { 
        alive = false; 
        es.close(); 
        esRef.current = null; 
      };
    } else {
      const id = setInterval(fetchBoth, refreshMs);
      pollRef.current = id;
      return () => { 
        alive = false; 
        clearInterval(id); 
        pollRef.current = null; 
      };
    }
  }, [refreshMs, useWebSocket, fetchBoth]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    bonkData,
    loading,
    error: err,
    lastUpdated,
  }), [bonkData, loading, err, lastUpdated]);

  return (
    <BonkContext.Provider value={contextValue}>
      {children}
    </BonkContext.Provider>
  );
}

export function useBonk() {
  return useContext(BonkContext);
}
