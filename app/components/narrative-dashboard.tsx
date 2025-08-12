"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Flame, Users, MessageCircle, Share2 } from "lucide-react"
// keep prop for compatibility with your page, but it's unused now
import type { BonkData } from "../dashboard/page"

interface NarrativeTrackerProps {
  bonkData?: BonkData
}

type Sentiment = "bullish" | "bearish" | "neutral"
type Trend = "up" | "down" | "stable"

interface Narrative {
  id: string
  title: string
  description: string
  sentiment: Sentiment
  strength: number
  mentions: number
  engagement: number
  trend: Trend
  tags: string[]
  sources: string[]
  timeframe: string
}

function classifySentiment(n: number): Sentiment {
  if (n > 0.1) return "bullish"
  if (n < -0.1) return "bearish"
  return "neutral"
}

function timeframeFromTimestamps(timestamps: number[]) {
  if (!timestamps.length) return "recent"
  const last = Math.max(...timestamps)
  const diffH = Math.max(0, Math.floor((Date.now() - last) / 3_600_000))
  return diffH < 24 ? `${diffH}h` : `${Math.floor(diffH / 24)}d`
}

function getSentimentBadge(s: Sentiment) {
  switch (s) {
    case "bullish":
      return "default"
    case "bearish":
      return "destructive"
    case "neutral":
      return "secondary"
    default:
      return "outline"
  }
}

function getTrendIcon(t: Trend) {
  switch (t) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />
    case "stable":
      return <div className="w-4 h-4 bg-yellow-500 rounded-full" />
  }
}

function buildNarratives(feeds: any[]): Narrative[] {
  // Group by hashtag (case-insensitive)
  const groups: Record<
    string,
    { mentions: number; engagement: number; sentimentSum: number; sources: Set<string>; timestamps: number[] }
  > = {}

  for (const p of feeds) {
    const text: string = p.text || p.title || ""
    // tags from explicit field or infer from text
    const tags: string[] = Array.from(new Set([...(p.tags || []), ...(text.match(/#\w+/g) || [])])).map((t) =>
      String(t).toLowerCase()
    )
    if (!tags.length) continue

    const likes = Number(p.likes ?? p.like_count ?? 0)
    const shares = Number(p.shares ?? p.retweet_count ?? p.quote_count ?? 0)
    const comments = Number(p.comments ?? p.reply_count ?? 0)
    const engage = Math.max(0, likes + shares + comments)
    const sent = Number(p.sentiment ?? 0)
    const ts = p.timestamp ? Date.parse(p.timestamp) : p.time ? Date.parse(p.time) : Date.now()

    for (const raw of tags) {
      const tag = raw.startsWith("#") ? raw : `#${raw}`
      if (!groups[tag]) {
        groups[tag] = { mentions: 0, engagement: 0, sentimentSum: 0, sources: new Set(), timestamps: [] }
      }
      groups[tag].mentions += 1
      groups[tag].engagement += engage
      groups[tag].sentimentSum += Number.isFinite(sent) ? sent : 0
      if (p.platform) groups[tag].sources.add(String(p.platform))
      groups[tag].timestamps.push(isNaN(ts) ? Date.now() : ts)
    }
  }

  // Compute normalized strength (0–100) by avg engagement per mention
  const perTagAvg = Object.fromEntries(
    Object.entries(groups).map(([tag, g]) => [tag, g.mentions ? g.engagement / g.mentions : 0]),
  )
  const maxAvg = Math.max(1, ...Object.values(perTagAvg))

  const list: Narrative[] = Object.entries(groups).map(([tag, g], i) => {
    const avgEngage = g.mentions ? g.engagement / g.mentions : 0
    const avgSent = g.mentions ? g.sentimentSum / g.mentions : 0
    const sentiment = classifySentiment(avgSent)
    const strength = Math.round((avgEngage / maxAvg) * 100)
    // Simple trend heuristic: strength buckets
    const trend: Trend = strength >= 60 ? "up" : strength <= 30 ? "down" : "stable"
    const tf = timeframeFromTimestamps(g.timestamps)

    return {
      id: String(i + 1),
      title: tag.replace(/^#/, "").replace(/[-_]/g, " ").toUpperCase(),
      description: `Conversation around ${tag.toUpperCase()} with ${g.mentions} mentions in the observed window.`,
      sentiment,
      strength,
      mentions: g.mentions,
      engagement: Math.round(avgEngage),
      trend,
      tags: [tag.replace(/^#/, "")],
      sources: Array.from(g.sources),
      timeframe: tf,
    }
  })

  // Sort by strength (desc) and limit to top 12 for UI sanity
  return list.sort((a, b) => b.strength - a.strength).slice(0, 12)
}

export function NarrativeTracker({ bonkData }: NarrativeTrackerProps) {
  const [feeds, setFeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/feeds/bonk?limit=100", { cache: "no-store" })
        const json = await res.json().catch(() => ({}))
        if (!active) return
        setFeeds(Array.isArray(json?.feeds) ? json.feeds : [])
      } catch (e) {
        console.error("Narrative feeds error:", e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const narratives = useMemo(() => buildNarratives(feeds), [feeds])
  const topNarratives = useMemo(() => [...narratives].sort((a, b) => b.strength - a.strength).slice(0, 3), [narratives])
  const bullishNarratives = useMemo(() => narratives.filter((n) => n.sentiment === "bullish"), [narratives])
  const bearishNarratives = useMemo(() => narratives.filter((n) => n.sentiment === "bearish"), [narratives])

  const dominant = topNarratives[0]
  const totalMentions = narratives.reduce((sum, n) => sum + n.mentions, 0)
  const avgEngagement = narratives.length
    ? Math.round(narratives.reduce((sum, n) => sum + n.engagement, 0) / narratives.length)
    : 0
  const bullishPct = narratives.length ? Math.round((bullishNarratives.length / narratives.length) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Narrative Tracker</h1>
          <p className="text-muted-foreground">Loading narratives…</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          <Card><CardHeader /><CardContent className="h-24" /></Card>
          <Card><CardHeader /><CardContent className="h-24" /></Card>
          <Card><CardHeader /><CardContent className="h-24" /></Card>
          <Card><CardHeader /><CardContent className="h-24" /></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Narrative Tracker</h1>
        <p className="text-muted-foreground">Track dominant narratives and sentiment trends in the BONK ecosystem</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dominant Narrative</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dominant ? dominant.title : "—"}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className={dominant ? "text-green-500" : ""}>
                {dominant ? `${dominant.strength}% strength` : "awaiting data"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Observed window</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">Per-narrative average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bullish Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{bullishPct}%</div>
            <p className="text-xs text-muted-foreground">Of all narratives</p>
          </CardContent>
        </Card>
      </div>

      {/* Narrative Analysis */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="bullish">Bullish</TabsTrigger>
          <TabsTrigger value="bearish">Bearish</TabsTrigger>
          <TabsTrigger value="all">All Narratives</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Trending Narratives</CardTitle>
              <CardDescription>Most influential narratives driving current sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topNarratives.map((narrative, index) => (
                  <div key={narrative.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                          <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{narrative.title}</h3>
                          <p className="text-sm text-muted-foreground">{narrative.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {narrative.mentions.toLocaleString()} mentions
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {narrative.engagement}% engagement
                            </div>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(narrative.trend)}
                              {narrative.timeframe}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSentimentBadge(narrative.sentiment)}>{narrative.sentiment}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Narrative Strength</span>
                        <span>{narrative.strength}%</span>
                      </div>
                      <Progress value={narrative.strength} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {narrative.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Sources:</span>
                        {narrative.sources.length ? (
                          narrative.sources.map((source) => (
                            <Badge key={source} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs">Various</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    {index < topNarratives.length - 1 && <div className="border-b" />}
                  </div>
                ))}
                {!topNarratives.length && <div className="text-sm text-muted-foreground">No trending narratives yet.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bullish" className="space-y-4">
          <div className="space-y-4">
            {bullishNarratives.map((narrative) => (
              <Card key={narrative.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{narrative.title}</h3>
                      <p className="text-sm text-muted-foreground">{narrative.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {narrative.mentions.toLocaleString()} mentions
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {narrative.engagement}% engagement
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(narrative.trend)}
                          {narrative.timeframe}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {narrative.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="default">{narrative.sentiment}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strength</span>
                      <span>{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!bullishNarratives.length && <div className="text-sm text-muted-foreground">No bullish narratives yet.</div>}
          </div>
        </TabsContent>

        <TabsContent value="bearish" className="space-y-4">
          <div className="space-y-4">
            {bearishNarratives.map((narrative) => (
              <Card key={narrative.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{narrative.title}</h3>
                      <p className="text-sm text-muted-foreground">{narrative.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {narrative.mentions.toLocaleString()} mentions
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {narrative.engagement}% engagement
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(narrative.trend)}
                          {narrative.timeframe}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {narrative.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="destructive">{narrative.sentiment}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strength</span>
                      <span>{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!bearishNarratives.length && <div className="text-sm text-muted-foreground">No bearish narratives yet.</div>}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {narratives.map((narrative) => (
              <Card key={narrative.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{narrative.title}</h3>
                      <p className="text-sm text-muted-foreground">{narrative.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {narrative.mentions.toLocaleString()} mentions
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {narrative.engagement}% engagement
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(narrative.trend)}
                          {narrative.timeframe}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {narrative.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={getSentimentBadge(narrative.sentiment)}>{narrative.sentiment}</Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strength</span>
                      <span>{narrative.strength}%</span>
                    </div>
                    <Progress value={narrative.strength} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!narratives.length && <div className="text-sm text-muted-foreground">No narratives found.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
