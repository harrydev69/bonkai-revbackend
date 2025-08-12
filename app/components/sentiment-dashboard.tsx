"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Heart, MessageCircle, Users, Activity, Zap } from "lucide-react"
import type { BonkData } from "../dashboard/page"

interface SentimentDashboardProps {
  bonkData: BonkData
}

type PlatformRow = {
  name: string
  sentiment: "bullish" | "bearish" | "neutral"
  score: number
  mentions: number
  change?: string
}

type KeywordRow = {
  word: string
  count: number
  sentiment: "positive" | "negative" | "neutral"
}

type InfluencerRow = {
  name: string
  followers: number
  sentiment: "bullish" | "bearish" | "neutral"
  impact: number
}

export function SentimentDashboard({ bonkData }: SentimentDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [snapshot, setSnapshot] = useState<any>(null)
  const [timeseries, setTimeseries] = useState<any[]>([])
  const [feeds, setFeeds] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [snapRes, tsRes, feedRes, inflRes] = await Promise.all([
          fetch("/api/sentiment/bonk/snapshot", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/sentiment/bonk/timeseries?interval=hour&points=48", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/feeds/bonk?limit=100", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/influencers/bonk?limit=12", { cache: "no-store" }).then((r) => r.json()),
        ])
        if (!active) return
        setSnapshot(snapRes?.snapshot ?? null)
        setTimeseries(Array.isArray(tsRes?.timeseries) ? tsRes.timeseries : [])
        setFeeds(Array.isArray(feedRes?.feeds) ? feedRes.feeds : [])
        setInfluencers(Array.isArray(inflRes?.influencers) ? inflRes.influencers : [])
      } catch (e) {
        console.error("Sentiment dashboard load error:", e)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // helpers
  const normalizeScore = (v: number | undefined | null) => {
    if (v === undefined || v === null || Number.isNaN(v)) return 50
    // support -1..1 or 0..100
    if (Math.abs(Number(v)) <= 1.2) return Math.round(((Number(v) + 1) / 2) * 100)
    return Math.max(0, Math.min(100, Math.round(Number(v))))
  }
  const labelFromSentiment = (v: number | undefined | null): "bullish" | "bearish" | "neutral" => {
    if (v === undefined || v === null || Number.isNaN(v)) return "neutral"
    const n = Number(v)
    if (Math.abs(n) <= 1.2) {
      if (n > 0.1) return "bullish"
      if (n < -0.1) return "bearish"
      return "neutral"
    }
    if (n >= 66) return "bullish"
    if (n <= 33) return "bearish"
    return "neutral"
  }
  const getSentimentBadge = (s: string) =>
    s === "bullish" ? "default" : s === "bearish" ? "destructive" : s === "neutral" ? "secondary" : "outline"

  // overall
  const overallLabel = useMemo(() => {
    const apiAvg = snapshot?.average_sentiment ?? snapshot?.sentiment
    if (apiAvg !== undefined) return labelFromSentiment(apiAvg)
    return (bonkData?.sentiment as "bullish" | "bearish" | "neutral") ?? "neutral"
  }, [snapshot, bonkData])

  const overallScore = useMemo(() => {
    const apiAvg = snapshot?.average_sentiment ?? snapshot?.sentiment
    if (apiAvg !== undefined) return normalizeScore(apiAvg)
    return bonkData?.sentiment === "bullish" ? 78 : bonkData?.sentiment === "bearish" ? 32 : 55
  }, [snapshot, bonkData])

  const socialVolume = snapshot?.social_volume ?? bonkData?.socialVolume ?? 0
  const engagementScore = snapshot?.social_score ?? 0
  const viralScore = snapshot?.galaxy_score ?? 0

  // platforms from feeds
  const platformRows: PlatformRow[] = useMemo(() => {
    const byPlatform: Record<string, { mentions: number; sentimentSum: number; posts: number }> = {}
    for (const post of feeds) {
      const platform = (post.platform || "Social").toString()
      if (!byPlatform[platform]) byPlatform[platform] = { mentions: 0, sentimentSum: 0, posts: 0 }
      byPlatform[platform].mentions++
      byPlatform[platform].posts++
      const s = typeof post.sentiment === "number" ? post.sentiment : 0
      byPlatform[platform].sentimentSum += s
    }
    const rows: PlatformRow[] = Object.entries(byPlatform).map(([name, v]) => {
      const avg = v.posts ? v.sentimentSum / v.posts : 0
      return {
        name,
        mentions: v.mentions,
        score: normalizeScore(avg),
        sentiment: labelFromSentiment(avg),
      }
    })

    // make sure common platforms always appear
    const ensure = ["Twitter", "Reddit", "Discord", "Telegram", "YouTube"]
    ensure.forEach((p) => {
      if (!rows.find((r) => r.name.toLowerCase() === p.toLowerCase())) {
        rows.push({ name: p, mentions: 0, score: 50, sentiment: "neutral" })
      }
    })

    return rows.sort((a, b) => b.mentions - a.mentions).slice(0, 5)
  }, [feeds])

  // keywords from feeds
  const keywords: KeywordRow[] = useMemo(() => {
    const counts: Record<string, { c: number; pos: number; neg: number }> = {}
    for (const post of feeds) {
      const text: string = post.text || post.title || ""
      const tags = Array.from(new Set([...(text.match(/#\w+/g) || [])].map((t) => t.toLowerCase())))
      const s = typeof post.sentiment === "number" ? post.sentiment : 0
      for (const tag of tags) {
        if (!counts[tag]) counts[tag] = { c: 0, pos: 0, neg: 0 }
        counts[tag].c++
        if (s > 0.1) counts[tag].pos++
        else if (s < -0.1) counts[tag].neg++
      }
    }
    const out = Object.entries(counts)
      .map(([word, v]) => {
        const sentiment: KeywordRow["sentiment"] =
          v.pos > v.neg ? "positive" : v.neg > v.pos ? "negative" : "neutral"
        return { word: word.replace(/^#/, ""), count: v.c, sentiment }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return out.length ? out : [{ word: "bonk", count: 0, sentiment: "neutral" }]
  }, [feeds])

  // influencers
  const influencerRows: InfluencerRow[] = useMemo(
    () =>
      influencers
        .map((i: any) => {
          const handle = (i.handle || i.username || i.name || "").toString()
          const name = handle.startsWith("@") ? handle : handle ? `@${handle}` : i.display_name || "Influencer"
          const followers = Number(i.followers ?? i.followers_count ?? 0)
          const impact = Number(i.engagement ?? i.engagement_score ?? i.score ?? 0)
          const sNum = typeof i.sentiment === "number" ? i.sentiment : 0
          const sentiment = labelFromSentiment(sNum)
          return { name, followers, impact, sentiment }
        })
        .sort((a: InfluencerRow, b: InfluencerRow) => (b.impact || 0) - (a.impact || 0))
        .slice(0, 8),
    [influencers]
  )

  // trends from timeseries (last 48 points → compare last24 vs prev24)
  const trendMetrics = useMemo(() => {
    const arr = timeseries || []
    if (arr.length < 6) return { sentimentChangePct: 0, volumeFactor: 1, positiveRatio: 0.5 }
    const last = arr.slice(-24)
    const prev = arr.slice(-48, -24)
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
    const lastSent = avg(last.map((p: any) => Number(p.average_sentiment ?? p.sentiment ?? 0)))
    const prevSent = avg(prev.map((p: any) => Number(p.average_sentiment ?? p.sentiment ?? 0)))
    const sentimentChangePct = normalizeScore(lastSent) - normalizeScore(prevSent)
    const lastVol = last.reduce((s: number, p: any) => s + Number(p.social_volume ?? 0), 0)
    const prevVol = prev.reduce((s: number, p: any) => s + Number(p.social_volume ?? 0), 0)
    const volumeFactor = prevVol > 0 ? lastVol / prevVol : 1
    const positives = last.filter((p: any) => Number(p.average_sentiment ?? p.sentiment ?? 0) > 0.1).length
    const positiveRatio = last.length ? positives / last.length : 0.5
    return { sentimentChangePct, volumeFactor, positiveRatio }
  }, [timeseries])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sentiment Analysis</h1>
          <p className="text-muted-foreground">Loading real-time sentiment…</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-60 animate-pulse">
          <Card><CardHeader /><CardContent className="h-20" /></Card>
          <Card><CardHeader /><CardContent className="h-20" /></Card>
          <Card><CardHeader /><CardContent className="h-20" /></Card>
          <Card><CardHeader /><CardContent className="h-20" /></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sentiment Analysis</h1>
        <p className="text-muted-foreground">Real-time sentiment tracking across social media platforms</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{overallLabel}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className={`w-3 h-3 mr-1 ${overallLabel === "bearish" ? "text-red-500" : "text-green-500"}`} />
              <span className={overallLabel === "bearish" ? "text-red-500" : "text-green-500"}>
                {overallScore}% positive
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Volume</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(socialVolume).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Mentions (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(engagementScore).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">Higher = stronger community reaction</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(viralScore).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Galaxy Score™</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analysis */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Platforms */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Sentiment Breakdown</CardTitle>
              <CardDescription>Sentiment analysis across different social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {platformRows.map((platform) => (
                  <div key={platform.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{platform.name[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{platform.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{platform.mentions.toLocaleString()} mentions</span>
                            {platform.change && (
                              <span className={platform.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                                {platform.change}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getSentimentBadge(platform.sentiment)}>{platform.sentiment}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sentiment Score</span>
                        <span>{platform.score}%</span>
                      </div>
                      <Progress value={platform.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Keywords</CardTitle>
              <CardDescription>Most mentioned keywords and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keywords.map((keyword) => (
                  <div key={keyword.word} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          keyword.sentiment === "positive"
                            ? "bg-green-500"
                            : keyword.sentiment === "negative"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <span className="font-medium">#{keyword.word}</span>
                        <p className="text-sm text-muted-foreground">{keyword.count.toLocaleString()} mentions</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        keyword.sentiment === "positive"
                          ? "default"
                          : keyword.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {keyword.sentiment}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Influencers */}
        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Influencers</CardTitle>
              <CardDescription>Influential voices and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {influencerRows.map((influencer) => (
                  <div key={influencer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{influencer.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Number(influencer.followers || 0).toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={getSentimentBadge(influencer.sentiment)}>{influencer.sentiment}</Badge>
                      <p className="text-sm text-muted-foreground">Impact: {Math.round(influencer.impact)}%</p>
                    </div>
                  </div>
                ))}
                {!influencerRows.length && <div className="text-sm text-muted-foreground">No influencer data yet.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends</CardTitle>
              <CardDescription>Historical patterns and short-term momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        trendMetrics.sentimentChangePct >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {trendMetrics.sentimentChangePct >= 0 ? "+" : ""}
                      {Math.round(trendMetrics.sentimentChangePct)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Sentiment change (vs prev 24h)</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{trendMetrics.volumeFactor.toFixed(2)}x</div>
                    <p className="text-sm text-muted-foreground">Volume factor (24h/prev 24h)</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-500">
                      {Math.round(trendMetrics.positiveRatio * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Positive mentions ratio</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Key Insights</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        Sentiment {trendMetrics.sentimentChangePct >= 0 ? "improved" : "declined"} by{" "}
                        {Math.abs(Math.round(trendMetrics.sentimentChangePct))}% over the last day
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        Social volume is {trendMetrics.volumeFactor.toFixed(2)}× the previous window
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        {Math.round(trendMetrics.positiveRatio * 100)}% of recent posts skew positive
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Galaxy Score™ at {Number(viralScore).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
