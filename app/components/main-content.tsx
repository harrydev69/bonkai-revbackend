// app/components/main-content.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BonkEcosystemTicker } from "./bonk-ecosystem-ticker";
import { VolumeHeatmap } from "./volume-heatmap";
import { SentimentTrendChart } from "./sentiment-trend-chart";
import { MindshareRadarChart } from "./mindshare-radar-chart";
import { SocialWordCloud } from "./social-word-cloud";
import { WhaleMovementTracker } from "./whale-movement-tracker";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Target,
  Brain,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
} from "lucide-react";

import type { ViewType } from "@/app/dashboard/page";
import type { BonkData } from "../context/bonk-context";

export interface MainContentProps {
  setCurrentView: (view: ViewType) => void;
  bonkData: BonkData;
}

/** Row shape returned by /api/tokens/top (CoinGecko category) */
type TokenRow = {
  id: string;
  symbol: string;
  name: string;
  price: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  volume: number | null;
  marketCap: number | null;
  logoUrl: string | null;
  sparkline?: number[];
};

type ApiMeta = {
  totalMarketCap: number;
  totalVolume: number;
  avg24h: number | null;
  updatedAt: number;
  source?: string;
};

type ApiOut = {
  tokens: TokenRow[];
  meta?: ApiMeta;
};

export function MainContent({ setCurrentView, bonkData }: MainContentProps) {
  const [activeTab, setActiveTab] = useState("letsbonk");

  // ---- ecosystem list state (from CoinGecko category via our API) ----
  const [ecoRows, setEcoRows] = useState<TokenRow[]>([]);
  const [ecoMeta, setEcoMeta] = useState<ApiMeta | null>(null);
  const [ecoLoading, setEcoLoading] = useState(true);
  const [ecoError, setEcoError] = useState<string | null>(null);
  const [ecoUpdatedAt, setEcoUpdatedAt] = useState<number | null>(null);

  // Memoize the fetch function to prevent recreation
  const fetchEcoData = useCallback(async () => {
    try {
      setEcoLoading(true);
      const q = new URLSearchParams({
        vs_currency: "usd",
        category: "letsbonk-fun-ecosystem",
        per_page: "100",
        page: "1",
        order: "market_cap_desc",
      });
      let res = await fetch(`/api/tokens/top?${q.toString()}`);
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 600));
        res = await fetch(`/api/tokens/top?${q.toString()}`);
      }
      if (!res.ok) throw new Error(`api ${res.status}`);
      const j: ApiOut = await res.json();
      setEcoRows(Array.isArray(j.tokens) ? j.tokens : []);
      setEcoMeta(j.meta ?? null);
      setEcoError(null);
      setEcoUpdatedAt(j.meta?.updatedAt ?? Date.now());
    } catch (e: any) {
      setEcoError(e?.message ?? "load_error");
    } finally {
      setEcoLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcoData();
  }, [fetchEcoData]);

  // ---- helpers ----
  const asNumber = useCallback((v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }, []);

  const formatPrice = useCallback((
    v: unknown,
    opts?: { min?: number; max?: number; currency?: string }
  ) => {
    const n = asNumber(v);
    if (n === null) return "—";
    const {
      min = n < 1 ? 4 : 2,
      max = n < 1 ? 8 : 6,
      currency = "USD",
    } = opts ?? {};
    return n.toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });
  }, [asNumber]);

  const formatNumber = useCallback((v: unknown, opts?: { min?: number; max?: number }) => {
    const n = asNumber(v);
    if (n === null) return "—";
    const { min = 0, max = 4 } = opts ?? {};
    return n.toLocaleString(undefined, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });
  }, [asNumber]);

  const formatMarketCap = useCallback((v: unknown) => {
    const n = asNumber(v);
    if (n === null) return "—";
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(0)}`;
  }, [asNumber]);

  const formatVolume = useCallback((v: unknown) => {
    const n = asNumber(v);
    if (n === null) return "—";
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(0)}`;
  }, [asNumber]);

  const getSentimentColor = useCallback((sentiment: BonkData["sentiment"]) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600 bg-green-50 border-green-200";
      case "bearish":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  }, []);

  const getSentimentIcon = useCallback((sentiment: BonkData["sentiment"]) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  }, []);

  // Memoize expensive calculations
  const { change, isUp } = useMemo(() => {
    const changeValue = asNumber(bonkData?.change24h);
    return {
      change: changeValue,
      isUp: changeValue !== null && changeValue >= 0
    };
  }, [bonkData?.change24h, asNumber]);

  // ---- client-side fallback summary ----
  const computedMeta: ApiMeta | null = useMemo(() => {
    if (ecoMeta) return ecoMeta;
    if (!ecoRows.length) return null;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const totalMarketCap = sum(
      ecoRows
        .map((r) => asNumber(r.marketCap))
        .filter((n): n is number => n !== null)
    );
    const totalVolume = sum(
      ecoRows
        .map((r) => asNumber(r.volume))
        .filter((n): n is number => n !== null)
    );
    const changes = ecoRows
      .map((r) => asNumber(r.change24h))
      .filter((n): n is number => n !== null);
    const avg24h = changes.length ? sum(changes) / changes.length : null;
    return {
      totalMarketCap,
      totalVolume,
      avg24h,
      updatedAt: ecoUpdatedAt ?? Date.now(),
    };
  }, [ecoMeta, ecoRows, ecoUpdatedAt, asNumber]);

  const SummaryTiles = ({ meta }: { meta: ApiMeta | null }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Total Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatMarketCap(meta?.totalMarketCap)}
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatVolume(meta?.totalVolume)}
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Avg 24h Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (meta?.avg24h ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {meta?.avg24h == null ? "—" : `${meta.avg24h.toFixed(2)}%`}
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Active Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ecoRows.length.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const LetsBonkTable = () => {
    if (ecoLoading)
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Loading ecosystem tokens…
        </div>
      );
    if (ecoError)
      return (
        <div className="p-6 text-sm text-red-500">
          Failed to load: {ecoError}
        </div>
      );

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground sticky top-0 bg-background">
            <tr>
              <th className="text-left py-3 px-4 w-16">Rank</th>
              <th className="text-left py-3 px-4 w-48">Token</th>
              <th className="text-right py-3 px-4 w-24">Price</th>
              <th className="text-right py-3 px-4 w-20">1h</th>
              <th className="text-right py-3 px-4 w-20">24h</th>
              <th className="text-right py-3 px-4 w-20">7d</th>
              <th className="text-right py-3 px-4 w-32">Volume (24h)</th>
              <th className="text-right py-3 px-4 w-32">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {ecoRows.map((t, i) => {
              const up1 = (t.change1h ?? 0) >= 0;
              const up24 = (t.change24h ?? 0) >= 0;
              const up7 = (t.change7d ?? 0) >= 0;
              return (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4">#{i + 1}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/token/${t.id}`}
                      prefetch={false}
                      className="group inline-flex items-center gap-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      aria-label={`Open ${t.name} details`}
                      title={`Open ${t.name}`}
                    >
                      {t.logoUrl ? (
                        <img
                          src={t.logoUrl}
                          alt={t.symbol}
                          className="h-6 w-6 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted grid place-items-center text-[10px]">
                          {(t.symbol ?? "?").slice(0, 1)}
                        </div>
                      )}
                      <span className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {t.symbol}
                      </span>
                    </Link>
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatPrice(t.price)}
                  </td>
                  <td
                    className={`text-right py-3 px-4 ${
                      up1 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.change1h == null ? "—" : `${t.change1h.toFixed(2)}%`}
                  </td>
                  <td
                    className={`text-right py-3 px-4 ${
                      up24 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.change24h == null ? "—" : `${t.change24h.toFixed(2)}%`}
                  </td>
                  <td
                    className={`text-right py-3 px-4 ${
                      up7 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.change7d == null ? "—" : `${t.change7d.toFixed(2)}%`}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatVolume(t.volume)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatMarketCap(t.marketCap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
          {ecoUpdatedAt
            ? `Updated ${new Date(ecoUpdatedAt).toLocaleTimeString()}`
            : null}
          {computedMeta?.source ? (
            <span className="text-muted-foreground">
              src: {computedMeta.source}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6" style={{ padding: '24px', paddingRight: '80px', border: '2px solid transparent' }}>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            BONKAI Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time analytics for BONK and LetsBonk.fun ecosystem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {ecoUpdatedAt
              ? `Updated ${new Date(ecoUpdatedAt).toLocaleTimeString()}`
              : "Updated now"}
          </Badge>
        </div>
      </div>

      {/* BONK Ticker */}
      <BonkEcosystemTicker />

      {/* Main BONK Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BONK Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(bonkData?.price, { min: 4, max: 8 })}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {change !== null ? (
                isUp ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )
              ) : (
                <Activity className="w-3 h-3 text-muted-foreground" />
              )}
              <span
                className={
                  change === null
                    ? "text-muted-foreground"
                    : isUp
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {change === null
                  ? "—"
                  : `${isUp ? "+" : ""}${change.toFixed(2)}% (24h)`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMarketCap(bonkData?.marketCap)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rank #{formatNumber(bonkData?.mindshareRank, { min: 0, max: 0 })}{" "}
              by mindshare
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatVolume(bonkData?.volume24h)}
            </div>
            <p className="text-xs text-muted-foreground">Trading activity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge
                className={getSentimentColor(bonkData?.sentiment || "neutral")}
              >
                {getSentimentIcon(bonkData?.sentiment || "neutral")}
                <span className="ml-1 capitalize">
                  {bonkData?.sentiment || "neutral"}
                </span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(bonkData?.socialVolume, { min: 0, max: 0 })} social
              mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="letsbonk">LetsBonk.fun</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="letsbonk" className="space-y-6">
          <SummaryTiles meta={computedMeta} />

          <Card>
            <CardHeader>
              <CardTitle>LetsBonk.fun Ecosystem</CardTitle>
              <CardDescription>
                Data from CoinGecko’s <code>letsbonk-fun-ecosystem</code>{" "}
                category via <code>/api/tokens/top</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LetsBonkTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VolumeHeatmap bonkData={bonkData} />
            <SentimentTrendChart bonkData={bonkData} />
            <MindshareRadarChart bonkData={bonkData} />
            {/* pass a typed, compatible object */}
            <SocialWordCloud bonkData={bonkData} />
          </div>

          <WhaleMovementTracker bonkData={bonkData} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Advanced Tools
              </CardTitle>
              <CardDescription>Deep dive into market analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  asChild
                >
                  <a href="/analytics">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">Full Analytics</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  asChild
                >
                  <a href="/narrative">
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">Narrative Tracker</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  asChild
                >
                  <a href="/calendar">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Event Calendar</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainContent;
