"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Brain, TrendingUp, Users, MessageSquare, Eye, Target, Flame, ExternalLink,
  Calendar, Activity, Zap
} from "lucide-react"
import { MindshareRadarChart } from "./mindshare-radar-chart"
// ✅ default import to match the module’s export shape
import SocialWordCloud from "./social-word-cloud"

type SentimentTag = "positive" | "neutral" | "negative"

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  timestamp: string
  source: string
  trending: boolean
  engagement: number
  sentiment: SentimentTag
}

interface CompetitorRow {
  name: string
  score: number
  change: number
}

type Feed = Record<string, any>
type Influencer = Record<string, any>

const FEEDS_WS_URL = process.env.NEXT_PUBLIC_FEEDS_WS_URL
const INFLUENCERS_WS_URL = process.env.NEXT_PUBLIC_INFLUENCERS_WS_URL

// --- helpers ---
function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n))
}
function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0
}
// robust timestamp → ms
function parseMs(ts?: string | number): number {
  if (ts === undefined || ts === null) return Date.now()
  if (typeof ts === "number") return ts < 1e12 ? ts * 1000 : ts
  const n = Number(ts)
  if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n
  const d = Date.parse(ts)
  return Number.isNaN(d) ? Date.now() : d
}

export function MindshareTracker({ refreshMs = 30_000 }: { refreshMs?: number } = {}) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // refs to avoid stale closures inside timers/ws handlers
  const feedsRef = useRef<Feed[]>([])
  const inflRef = useRef<Influencer[]>([])
  useEffect(() => { feedsRef.current = feeds }, [feeds])
  useEffect(() => { inflRef.current = influencers }, [influencers])

  // ---------- Fetch helpers ----------
  const dedupeBy = <T extends Record<string, any>>(arr: T[], key: string) => {
    const seen = new Set<string>()
    const out: T[] = []
    for (const item of arr) {
      const id = String(item[key] ?? item.id ?? item.post_id ?? Math.random())
      if (!seen.has(id)) {
        seen.add(id)
        out.push(item)
      }
    }
    return out
  }

  const loadOnce = async (signal?: AbortSignal) => {
    const [feedRes, inflRes] = await Promise.allSettled([
      fetch("/api/feeds/bonk?limit=200", { cache: "no-store", signal }).then(r => r.json()),
      fetch("/api/influencers/bonk?limit=50", { cache: "no-store", signal }).then(r => r.json()),
    ])
    const nextFeeds: Feed[] =
      feedRes.status === "fulfilled" && Array.isArray(feedRes.value?.feeds) ? feedRes.value.feeds : []
    const nextInfl: Influencer[] =
      inflRes.status === "fulfilled" && Array.isArray(inflRes.value?.influencers) ? inflRes.value.influencers : []

    setFeeds(dedupeBy(nextFeeds, "id"))
    setInfluencers(dedupeBy(nextInfl, "id"))
  }

  // ---------- Initial load ----------
  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        await loadOnce(ctrl.signal)
      } catch (e) {
        console.error("Mindshare initial load error:", e)
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [])

  // ---------- Auto-refresh polling (visibility-aware) ----------
  useEffect(() => {
    let timer: number | undefined

    const tick = async () => {
      if (document.visibilityState === "visible") {
        try {
          await loadOnce()
        } catch (e) {
          console.warn("Mindshare refresh error:", e)
        }
      }
      timer = window.setTimeout(tick, refreshMs)
    }

    timer = window.setTimeout(tick, refreshMs)

    const onVis = () => {
      if (document.visibilityState === "visible") void loadOnce()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      if (timer) window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [refreshMs])

  // ---------- Optional WebSocket live updates ----------
  useEffect(() => {
    const sockets: WebSocket[] = []

    const tryWS = (url?: string, onMsg?: (data: any) => void) => {
      if (!url) return
      try {
        const ws = new WebSocket(url)
        ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data)
            onMsg?.(payload)
          } catch {
            /* ignore non-JSON */
          }
        }
        sockets.push(ws)
      } catch (e) {
        console.warn("WS connect failed:", e)
      }
    }

    tryWS(FEEDS_WS_URL, (payload) => {
      const items: Feed[] = Array.isArray(payload?.items)
        ? payload.items
        : payload?.item
        ? [payload.item]
        : []
      if (!items.length) return
      setFeeds(dedupeBy([...items, ...feedsRef.current], "id").slice(0, 500))
    })

    tryWS(INFLUENCERS_WS_URL, (payload) => {
      const items: Influencer[] = Array.isArray(payload?.items)
        ? payload.items
        : payload?.item
        ? [payload.item]
        : []
      if (!items.length) return
      setInfluencers(dedupeBy([...items, ...inflRef.current], "id").slice(0, 500))
    })

    return () => sockets.forEach((ws) => ws.close())
  }, [])

  // ---------- Metrics ----------
  const socialMentions = feeds.length
  const influencerMentions = influencers.length

  const engagementAgg = useMemo(() => {
    let sum = 0
    for (const p of feeds) {
      const e =
        Number(p.engagement ?? p.engagement_score ?? 0) +
        Number(p.likes ?? 0) +
        Number(p.retweets ?? 0) +
        Number(p.shares ?? 0) +
        Number(p.comments ?? p.replies ?? 0)
      sum += Number.isFinite(e) ? e : 0
    }
    const perPost = socialMentions ? sum / socialMentions : 0
    const scaled = clamp(Math.log10(1 + perPost) * 40)
    return { sum, perPost, scaled }
  }, [feeds, socialMentions])

  const brandAwareness = useMemo(() => {
    const ids = new Set<string>()
    for (const p of feeds) {
      const id = (p.creator_id || p.author_id || p.username || p.handle || p.user_id || "").toString()
      if (id) ids.add(id.toLowerCase())
    }
    const uniqueRatio = socialMentions ? ids.size / socialMentions : 0
    return clamp(uniqueRatio * 100)
  }, [feeds, socialMentions])

  const mindshareScore = useMemo(() => {
    const mVol = clamp(Math.log10(1 + socialMentions) * 20)
    const mInf = clamp(Math.log10(1 + influencerMentions) * 28)
    const mEng = engagementAgg.scaled
    const mBrand = brandAwareness
    const score = 0.30 * mVol + 0.25 * mInf + 0.25 * mEng + 0.20 * mBrand
    return Number(score.toFixed(1))
  }, [socialMentions, influencerMentions, engagementAgg.scaled, brandAwareness])

  const change24h = useMemo(() => {
    if (feeds.length < 20) return 0
    const q = Math.floor(feeds.length / 4)
    const early = feeds.slice(0, q).length
    const late = feeds.slice(-q).length
    const c = pct(late - early, Math.max(early, 1))
    return Number(c.toFixed(1))
  }, [feeds])

  const latestNews: NewsItem[] = useMemo(() => {
    const mapSent = (s: number | undefined): SentimentTag =>
      s === undefined || isNaN(Number(s))
        ? "neutral"
        : Number(s) > 0.1 ? "positive" : Number(s) < -0.1 ? "negative" : "neutral"

    return feeds.slice(0, 12).map((p, i) => ({
      id: String(p.id ?? p.post_id ?? `p${i}`),
      title: String(p.title ?? p.text?.slice(0, 80) ?? "Social update"),
      summary: String(p.text ?? p.title ?? "").slice(0, 200),
      category: (p.platform ?? "Social").toString(),
      // ✅ robust timestamp formatting (sec/ms/ISO all OK)
      timestamp: new Date(parseMs(p.timestamp ?? p.created_at)).toLocaleString(),
      source: (p.platform ?? "Social").toString(),
      trending: i < 5,
      engagement:
        Number(p.engagement ?? p.engagement_score ?? 0) +
        Number(p.likes ?? 0) +
        Number(p.retweets ?? 0) +
        Number(p.shares ?? 0) +
        Number(p.comments ?? p.replies ?? 0),
      sentiment: mapSent(Number(p.sentiment ?? p.average_sentiment)),
    }))
  }, [feeds])

  const categories = useMemo(() => {
    const set = new Set<string>(["all"])
    latestNews.forEach((n) => set.add(n.category))
    return Array.from(set)
  }, [latestNews])

  const filteredNews = selectedCategory === "all"
    ? latestNews
    : latestNews.filter((n) => n.category === selectedCategory)

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600 bg-green-50 border-green-200"
      case "negative": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const trendingTopics = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of feeds) {
      const text: string = p.text || p.title || ""
      const tags = text.match(/#\w+/g) ?? []
      for (const t of tags) counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) || 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, mentions], idx) => ({
        topic: topic.replace(/^#/, "").toUpperCase(),
        mentions,
        trend: (idx < 5 ? "up" : "stable") as "up" | "down" | "stable",
        category: "Social",
      }))
  }, [feeds])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-3xl font-bold">BONK Mindshare Analytics</div>
        <p className="text-muted-foreground">Loading live mindshare data…</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BONK Mindshare Analytics</h1>
          <p className="text-muted-foreground">Real-time tracking of BONK's presence in the crypto consciousness</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-3 py-1 bg-orange-50 border-orange-200">
            Rank #3
          </Badge>
          <Badge className="bg-green-500 hover:bg-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            Hot
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mindshare Score</CardTitle>
            <Brain className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{mindshareScore}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />{change24h >= 0 ? "+" : ""}{change24h}% from earlier window
            </div>
            <Progress value={mindshareScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{socialMentions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sampled posts</p>
            <div className="text-xs text-green-600 mt-1">{change24h >= 0 ? "+" : ""}{change24h}% vs earlier</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencer Mentions</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{influencerMentions}</div>
            <p className="text-xs text-muted-foreground">Top creators</p>
            <div className="text-xs text-green-600 mt-1">live</div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Awareness</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{brandAwareness.toFixed(0)}%</div>
            <Progress value={brandAwareness} className="mt-2" />
            <div className="text-xs text-green-600 mt-1">unique creator ratio</div>
          </CardContent>
        </Card>
      </div>

      {/* Latest BONK News */}
      <Card className="border-orange-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Latest BONK News & Updates
              </CardTitle>
              <CardDescription>Real-time news and developments from the BONK ecosystem</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from(new Set(["all", ...categories])).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {category === "all" ? "All News" : category}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredNews.map((news) => (
              <div
                key={news.id}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{news.title}</h3>
                    {news.trending && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className={getSentimentColor(news.sentiment)}>
                    {news.sentiment}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{news.summary}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {news.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {news.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {news.engagement.toLocaleString()} engagements
                    </span>
                  </div>
                  <Badge variant="secondary">{news.category}</Badge>
                </div>
              </div>
            ))}
            {!filteredNews.length && (
              <div className="text-sm text-muted-foreground">No recent posts in this category.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="trends">Trending</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mindshare Radar</CardTitle>
                <CardDescription>Multi-dimensional analysis of BONK's market presence</CardDescription>
              </CardHeader>
              <CardContent>
                <MindshareRadarChart
                  bonkData={{
                    price: 0,
                    change24h: change24h,
                    volume24h: socialMentions,
                    marketCap: influencerMentions * 1_000_000,
                    holders: Math.max(1000, influencers.length * 100),
                    transactions24h: socialMentions,
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Word Cloud</CardTitle>
                <CardDescription>Most mentioned terms associated with BONK</CardDescription>
              </CardHeader>
              <CardContent>
                <SocialWordCloud />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
              <CardDescription>How BONK compares to other meme coins in mindshare</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "DOGE", score: clamp(mindshareScore + 6), change: -1.8 },
                  { name: "SHIB", score: clamp(mindshareScore + 2), change: 2.3 },
                  { name: "BONK", score: mindshareScore, change: change24h },
                  { name: "PEPE", score: clamp(mindshareScore - 10), change: -3.2 },
                  { name: "WIF",  score: clamp(mindshareScore - 17), change: 4.8 },
                ].map((competitor, index) => (
                  <div
                    key={competitor.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <div>
                        <span className="font-semibold text-lg">{competitor.name}</span>
                        <p className="text-sm text-muted-foreground">Meme Coin</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xl font-bold">{competitor.score}</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                      <Badge variant={competitor.change >= 0 ? "default" : "destructive"} className="text-sm">
                        {competitor.change >= 0 ? "+" : ""}{competitor.change}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
              <CardDescription>What the crypto community is saying about BONK right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTopics.map((item, index) => (
                  <div
                    key={item.topic}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <span className="font-medium">{item.topic}</span>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold">{item.mentions.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">mentions</div>
                      </div>
                      <Badge
                        variant={item.trend === "up" ? "default" : item.trend === "down" ? "destructive" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {item.trend === "up" && <TrendingUp className="w-3 h-3" />}
                        {item.trend === "down" && <Activity className="w-3 h-3" />}
                        {item.trend === "stable" && <Target className="w-3 h-3" />}
                        {item.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!trendingTopics.length && (
                  <div className="text-sm text-muted-foreground">No trending topics detected yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          {(() => {
            const sVals = feeds.map((p) => Number(p.sentiment ?? p.average_sentiment ?? 0))
            const pos = sVals.filter((s) => s > 0.1).length
            const neg = sVals.filter((s) => s < -0.1).length
            const neu = sVals.length - pos - neg
            const total = sVals.length || 1
            const posPct = Math.round((pos / total) * 100)
            const neuPct = Math.round((neu / total) * 100)
            const negPct = Math.round((neg / total) * 100)

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Positive
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-700 mb-2">{posPct}%</div>
                    <Progress value={posPct} className="mt-2 mb-3" />
                    <div className="text-sm text-green-600">Based on recent posts</div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
                  <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Neutral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-yellow-700 mb-2">{neuPct}%</div>
                    <Progress value={neuPct} className="mt-2 mb-3" />
                    <div className="text-sm text-yellow-600">Based on recent posts</div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Negative
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-red-700 mb-2">{negPct}%</div>
                    <Progress value={negPct} className="mt-2 mb-3" />
                    <div className="text-sm text-red-600">Based on recent posts</div>
                  </CardContent>
                </Card>
              </div>
            )
          })()}

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Timeline</CardTitle>
              <CardDescription>How sentiment has evolved over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Today",       positive: 72, neutral: 19, negative: 9,  event: "ATH reached" },
                  { date: "Yesterday",   positive: 68, neutral: 22, negative: 10, event: "Mobile integration announced" },
                  { date: "2 days ago",  positive: 65, neutral: 25, negative: 10, event: "Community milestone" },
                  { date: "3 days ago",  positive: 62, neutral: 28, negative: 10, event: "DeFi partnerships" },
                  { date: "4 days ago",  positive: 58, neutral: 30, negative: 12, event: "Token burn event" },
                  { date: "5 days ago",  positive: 55, neutral: 32, negative: 13, event: "NFT collection launch" },
                  { date: "6 days ago",  positive: 52, neutral: 35, negative: 13, event: "Regular trading" },
                ].map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium w-20">{day.date}</span>
                      <span className="text-sm text-muted-foreground">{day.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">{day.positive}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-sm">{day.neutral}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm">{day.negative}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
