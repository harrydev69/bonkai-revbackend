"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, TrendingUp, TrendingDown, Users, ExternalLink } from "lucide-react"

type Sentiment = "bullish" | "bearish" | "neutral"

type Influencer = {
  id?: string | number
  handle?: string
  username?: string
  display_name?: string
  name?: string
  avatar?: string
  image?: string
  followers?: number
  followers_count?: number
  engagement?: number
  engagement_score?: number
  score?: number
  posts?: number
  platform?: string
  url?: string
  sentiment?: number // numeric -1..1 or 0..100
}

function labelFromSentiment(n?: number): Sentiment {
  if (typeof n !== "number" || Number.isNaN(n)) return "neutral"
  // support both -1..1 and 0..100 scales
  const v = Math.abs(n) <= 1.2 ? n : (n - 50) / 50
  if (v > 0.1) return "bullish"
  if (v < -0.1) return "bearish"
  return "neutral"
}
function sentimentBadgeVariant(s: Sentiment) {
  return s === "bullish" ? "default" : s === "bearish" ? "destructive" : "secondary"
}

type SortKey = "impact" | "followers" | "posts"
const sorters: Record<SortKey, (a: any, b: any) => number> = {
  impact: (a, b) => (b.impact ?? 0) - (a.impact ?? 0),
  followers: (a, b) => (b.followers ?? 0) - (a.followers ?? 0),
  posts: (a, b) => (b.posts ?? 0) - (a.posts ?? 0),
}

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as any).influencers)) return (data as any).influencers
  if (data && Array.isArray((data as any).data)) return (data as any).data
  if (data && Array.isArray((data as any).items)) return (data as any).items
  return []
}

function dedupeByKey<T extends Record<string, any>>(arr: T[], pick: (x: T, i: number) => string) {
  const seen = new Set<string>()
  const out: T[] = []
  for (let i = 0; i < arr.length; i++) {
    const k = pick(arr[i], i)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(arr[i])
    }
  }
  return out
}

export default function InfluencerList({
  limit = 20,
  refreshMs = 60_000,
  initialDelayMs,
}: {
  limit?: number
  refreshMs?: number
  initialDelayMs?: number
}) {
  const [raw, setRaw] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [platform, setPlatform] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("impact")

  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  // gentle jitter so multiple widgets don't call at the same millisecond
  const jitter = initialDelayMs ?? 300 + Math.floor(Math.random() * 500)

  const load = async (signal?: AbortSignal) => {
    try {
      setError(null)
      const res = await fetch(`/api/influencers/bonk?limit=${limit}`, {
        cache: "no-store",
        signal,
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`influencers ${res.status}: ${body || res.statusText}`)
      }
      const j = await res.json().catch(() => ({}))
      const arr = toArray(j)
      // de-dupe by (id || handle || username)
      const deduped = dedupeByKey(arr, (x, i) =>
        String(x.id ?? x.handle ?? x.username ?? `idx:${i}`)
      )
      setRaw(deduped)
    } catch (e: any) {
      setError(String(e?.message ?? e))
      setRaw([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ac = new AbortController()

    const kickOff = () => {
      // stagger first call
      window.setTimeout(() => load(ac.signal), jitter)
      // periodic refresh (visibility-aware)
      const tick = async () => {
        if (document.visibilityState === "visible") await load()
        timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
      }
      timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
    }

    if (!startedRef.current) {
      startedRef.current = true
      kickOff()
    }

    const onVis = () => {
      if (document.visibilityState === "visible") void load()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      ac.abort()
      if (timerRef.current) window.clearTimeout(timerRef.current)
      document.removeEventListener("visibilitychange", onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refreshMs, jitter])

  const rows = useMemo(() => {
    const mapped = raw.map((i, idx) => {
      const handle = i.handle || i.username || i.name || i.display_name || `user_${idx}`
      const normHandle = handle.startsWith("@") ? handle : `@${handle}`
      const name = i.display_name || i.name || handle.replace(/^@/, "")
      const followers = Number(i.followers ?? i.followers_count ?? 0)
      const impact = Number(i.engagement ?? i.engagement_score ?? i.score ?? 0)
      const posts = Number(i.posts ?? 0)
      const plt = (i.platform || "social").toString()
      const avatar = i.avatar || i.image || ""
      const sentimentNum = typeof i.sentiment === "number" ? i.sentiment : undefined
      const sentiment = labelFromSentiment(sentimentNum)
      const url =
        i.url ||
        (["twitter", "x"].includes(plt.toLowerCase())
          ? `https://twitter.com/${handle.replace(/^@/, "")}`
          : undefined)

      return {
        id: i.id ?? `${idx}`,
        name,
        handle: normHandle,
        followers,
        impact,
        posts,
        platform: plt,
        avatar,
        sentiment,
        url,
      }
    })

    const filtered = mapped.filter((r) => {
      if (platform !== "all" && r.platform.toLowerCase() !== platform) return false
      if (!q) return true
      const needle = q.toLowerCase()
      return r.name.toLowerCase().includes(needle) || r.handle.toLowerCase().includes(needle)
    })

    return filtered.sort(sorters[sortKey]).slice(0, limit)
  }, [raw, q, platform, sortKey, limit])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-purple-500" />
          <div>
            <CardTitle>Creator Leaderboard</CardTitle>
            <p className="text-sm text-muted-foreground">Top BONK voices ranked by impact and reach</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex gap-2">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="x">X</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impact">Impact</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input
              className="w-48"
              placeholder="Search creators…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outline" onClick={() => setSortKey(sortKey === "impact" ? "followers" : "impact")}>
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && <div className="h-24 w-full rounded-md bg-muted animate-pulse" />}

        {!loading && error && (
          <div className="text-sm text-red-600">
            Unable to load influencers: {error}
          </div>
        )}

        {!loading && !error && rows.map((r, idx) => (
          <div key={`${r.id}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-muted-foreground w-6 text-right">#{idx + 1}</div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={r.avatar || ""} />
                <AvatarFallback>{r.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  <Badge variant="secondary">{r.platform}</Badge>
                  <Badge variant={sentimentBadgeVariant(r.sentiment)}>{r.sentiment}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{r.handle}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm font-semibold">{(r.impact ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {r.impact >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  Impact
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{(r.followers ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{(r.posts ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>

              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}

        {!loading && !error && !rows.length && (
          <div className="text-sm text-muted-foreground">No influencers found.</div>
        )}
      </CardContent>
    </Card>
  )
}
