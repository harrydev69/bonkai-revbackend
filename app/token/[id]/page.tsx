// app/token/[id]/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowUpRight,
  Activity,
  BarChart3,
  DollarSign,
  Copy,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Details = {
  id: string
  symbol: string
  name: string
  image: string | null
  price: number | null
  change1h: number | null
  change24h: number | null
  change7d: number | null
  marketCap: number | null
  volume: number | null
  fdv: number | null
  circulatingSupply: number | null
  totalSupply: number | null
  maxSupply: number | null
  contract: string | null
  explorers: string[]
  homepage?: string | null
  twitter?: string | null
  discord?: string | null
}

type ApiOut = {
  details: Details
  prices: { t: number; p: number }[]
  updatedAt: number
  source: string
}

/* ---------- formatters ---------- */
function fmtCurrency(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—"
  const min = n < 1 ? 4 : 2
  const max = n < 1 ? 8 : 6
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}
function fmtBig(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—"
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${n.toFixed(0)}`
}
function fmtNum(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—"
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
function shorten(addr?: string | null, left = 6, right = 6) {
  if (!addr) return ""
  if (addr.length <= left + right + 1) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}
function hostLabel(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "")
  } catch {
    return "Explorer"
  }
}
const PctBadge = ({ v }: { v: number | null | undefined }) =>
  v == null ? (
    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[11px]">—</span>
  ) : v >= 0 ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[11px] dark:bg-green-500/15 dark:text-green-400">
      <TrendingUp className="w-3 h-3" /> {`+${v.toFixed(2)}%`}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[11px] dark:bg-red-500/15 dark:text-red-400">
      <TrendingDown className="w-3 h-3" /> {`${v.toFixed(2)}%`}
    </span>
  )

export default function TokenPage() {
  const { id } = useParams<{ id: string }>()
  const search = useSearchParams()
  const vs = (search.get("vs") || "usd").toLowerCase()

  const [range, setRange] = useState<"1" | "7" | "30">((search.get("days") as any) || "7")
  const [data, setData] = useState<ApiOut | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  // watch dark-mode class so the chart can react instantly
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  )
  useEffect(() => {
    const el = document.documentElement
    const update = () => setIsDark(el.classList.contains("dark"))
    update()
    const mo = new MutationObserver(update)
    mo.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])

  async function load() {
    setLoading(true)
    try {
      // Try requested range; if chart is empty and not 24h, automatically fall back to 24h
      const res = await fetch(`/api/tokens/${id}?vs_currency=${vs}&days=${range}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`api ${res.status}`)
      const j: ApiOut = await res.json()
      if ((j?.prices?.length ?? 0) === 0 && range !== "1") {
        const r2 = await fetch(`/api/tokens/${id}?vs_currency=${vs}&days=1`, { cache: "no-store" })
        if (r2.ok) {
          const j2: ApiOut = await r2.json()
          setData(j2)
          setErr(null)
        } else {
          setData(j)
          setErr(null)
        }
      } else {
        setData(j)
        setErr(null)
      }
    } catch (e: any) {
      setErr(e?.message ?? "load_error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let stop = false
    ;(async () => {
      if (!stop) await load()
    })()
    return () => {
      stop = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, vs, range, refreshTick])

  const chartRows = useMemo(
    () =>
      data
        ? data.prices.map((pt) => ({
            time: new Date(pt.t).toLocaleString(),
            p: typeof pt.p === "number" ? pt.p : Number(pt.p),
          }))
        : [],
    [data]
  )
  const hasChart = chartRows.length > 0

  async function copyContract(full?: string | null) {
    if (!full) return
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  /* ---------- loading/error states ---------- */
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500/20 dark:to-orange-500/10 dark:text-amber-100 opacity-70 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-muted/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-muted/60 rounded-2xl animate-pulse" />
          <div className="h-28 bg-muted/60 rounded-2xl animate-pulse" />
        </div>
        <div className="h-80 bg-muted/60 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/dashboard" className="inline-flex items-center text-sm hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <p className="text-red-600 dark:text-red-400">Failed to load token: {err}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshTick((n) => n + 1)}
          className="inline-flex items-center gap-1"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    )
  }

  const d = data.details
  const up = (d.change24h ?? 0) >= 0
  const primaryExplorer = d.explorers?.find(Boolean)

  // chart colors that adapt to theme
  const areaStroke = isDark ? "#f59e0b" /* amber-500 */ : "#111827" /* gray-900 */
  const fillTop = isDark ? "#f59e0b" : "#9ca3af" // amber-500 vs gray-400
  const fillTopOpacity = isDark ? 0.25 : 0.35
  const fillBottomOpacity = isDark ? 0.06 : 0.05

  /* ---------- page ---------- */
  return (
    <div className="p-6 space-y-6">
      {/* BONKAI hero */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm dark:from-amber-500/20 dark:to-orange-500/10 dark:text-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {d.image ? (
              <img
                src={d.image}
                alt={d.symbol}
                className="h-10 w-10 rounded-full ring-2 ring-white/60 dark:ring-amber-300/30"
              />
            ) : null}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {d.name} <span className="opacity-90 text-base">({d.symbol})</span>
              </h1>
              <p className="text-xs opacity-90">
                Updated {new Date(data.updatedAt).toLocaleTimeString()} · src: {data.source}
              </p>
            </div>
          </div>
          <Link href="/dashboard" className="inline-flex items-center text-sm hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{fmtCurrency(d.price)}</div>
            <div className={`text-sm ${up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {d.change24h == null ? "—" : `${up ? "+" : ""}${d.change24h.toFixed(2)}% (24h)`}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBig(d.marketCap)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBig(d.volume)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Change badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Change:</span>
        <PctBadge v={d.change1h} />
        <PctBadge v={d.change24h} />
        <PctBadge v={d.change7d} />
      </div>

      {/* Supply / FDV */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Fully Diluted Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtBig(d.fdv)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Circulating Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtNum(d.circulatingSupply)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtNum(d.totalSupply)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Max Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtNum(d.maxSupply)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Price Chart
          </CardTitle>
          <div className="inline-flex rounded-xl border overflow-hidden bg-background">
            {(["1", "7", "30"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-sm transition-colors ${range === r ? "bg-muted" : "hover:bg-muted/60"}`}
                title={r === "1" ? "24h" : r === "7" ? "7d" : "30d"}
              >
                {r === "1" ? "24h" : r === "7" ? "7d" : "30d"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            {hasChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartRows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={fillTop} stopOpacity={fillTopOpacity} />
                      <stop offset="100%" stopColor={fillTop} stopOpacity={fillBottomOpacity} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip
                    formatter={(v: any) => (typeof v === "number" ? fmtCurrency(v) : v)}
                    labelFormatter={(l) => l}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--popover-foreground))",
                      borderRadius: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="p" fill="url(#areaFill)" stroke={areaStroke} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full grid place-items-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Chart data isn’t available right now (API throttled or empty range).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefreshTick((n) => n + 1)}
                    className="inline-flex items-center gap-1"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links / Contract */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {d.contract ? (
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Contract:</span>
              <code title={d.contract} className="px-2 py-1 rounded bg-muted text-xs font-mono tracking-tight">
                {shorten(d.contract)}
              </code>
              <Button size="sm" variant="outline" onClick={() => copyContract(d.contract)} className="h-7">
                <Copy className="w-3.5 h-3.5 mr-1" />
                {copied ? "Copied" : "Copy"}
              </Button>
              {primaryExplorer ? (
                <Button asChild size="sm" variant="outline" className="h-7">
                  <a href={primaryExplorer} target="_blank" rel="noreferrer" title={primaryExplorer}>
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                    {hostLabel(primaryExplorer)}
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {d.homepage ? (
              <Button asChild variant="outline">
                <a href={d.homepage} target="_blank" rel="noreferrer">
                  <DollarSign className="w-4 h-4 mr-1" /> Website
                </a>
              </Button>
            ) : null}
            {d.twitter ? (
              <Button asChild variant="outline">
                <a href={d.twitter} target="_blank" rel="noreferrer">
                  <ArrowUpRight className="w-4 h-4 mr-1" /> Twitter
                </a>
              </Button>
            ) : null}
            {d.discord ? (
              <Button asChild variant="outline">
                <a href={d.discord} target="_blank" rel="noreferrer">
                  <Activity className="w-4 h-4 mr-1" /> Discord
                </a>
              </Button>
            ) : null}
            {d.explorers
              ?.filter((u) => u && u !== primaryExplorer)
              .slice(0, 6)
              .map((u) => (
                <Button asChild key={u} variant="outline" title={u}>
                  <a href={u} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="w-4 h-4 mr-1" /> {hostLabel(u)}
                  </a>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
