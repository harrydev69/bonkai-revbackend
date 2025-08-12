"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, TrendingUp, Hash, Users, Globe, RefreshCw } from "lucide-react"

// ----- Types -----
type Sent = "positive" | "negative" | "neutral"
type Trend = "up" | "down" | "stable"

interface WordData {
  word: string
  count: number
  sentiment: Sent
  trend: Trend
  size: number
}

interface SocialWordCloudProps {
  // Optional minimal shape so we don’t depend on ../page
  bonkData?: {
    keywords?: Array<{ word: string; count: number; sentiment?: Sent }>
  }
}

type FeedItem = {
  id?: string
  platform?: string
  text?: string
  title?: string
  tags?: string[]
  sentiment?: number // optional numeric sentiment from API
  engagement?: number
  timestamp?: string
}

// ----- Component -----
export function SocialWordCloud({ bonkData }: SocialWordCloudProps) {
  const [timeframe, setTimeframe] = useState("24h")
  const [platform, setPlatform] = useState("all")
  const [wordData, setWordData] = useState<WordData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    generateWordCloud()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, platform])

  async function generateWordCloud() {
    try {
      const res = await fetch(`/api/feeds/bonk?limit=100`, { cache: "no-store" })
      if (!res.ok) throw new Error("feeds endpoint not available")
      const json = await res.json()
      const feeds: FeedItem[] = Array.isArray(json?.feeds) ? json.feeds : []

      const derived = extractTagsFromFeeds(feeds, platform)
      const merged = addProvidedKeywords(derived, bonkData?.keywords)

      const ranked = merged.sort((a, b) => b.count - a.count).slice(0, 30)
      setWordData(scaleWithTrend(ranked))
    } catch {
      setWordData(scaleWithTrend(buildMockData()))
    }
  }

  const refreshWordCloud = async () => {
    setIsRefreshing(true)
    await generateWordCloud()
    setIsRefreshing(false)
  }

  const getSentimentColor = (sentiment: Sent) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500"
      case "negative":
        return "text-red-500"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getSentimentBg = (sentiment: Sent) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-700"
      case "negative":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-700"
      default:
        return "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600"
    }
  }

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case "up":
        return "↗️"
      case "down":
        return "↘️"
      default:
        return "➡️"
    }
  }

  const topWords = useMemo(() => wordData.slice(0, 10), [wordData])
  const positiveWords = useMemo(() => wordData.filter((w) => w.sentiment === "positive").length, [wordData])
  const negativeWords = useMemo(() => wordData.filter((w) => w.sentiment === "negative").length, [wordData])
  const totalMentions = useMemo(() => wordData.reduce((sum, w) => sum + w.count, 0), [wordData])

  return (
    <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Social Mention Word Cloud</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trending topics and sentiment from social media mentions
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshWordCloud} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Word Cloud Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Hash className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{wordData.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Trending Words</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">{positiveWords}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Positive Words</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-500">{negativeWords}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Negative Words</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Globe className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-500">{totalMentions.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Word Cloud Visualization */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Visual Word Cloud</h3>
            <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-4 gap-2">
                {wordData.map((word) => (
                  <span
                    key={word.word}
                    className={`inline-block px-3 py-1 rounded-full border cursor-pointer hover:scale-110 transition-all duration-200 ${getSentimentBg(word.sentiment)} ${getSentimentColor(word.sentiment)}`}
                    style={{
                      fontSize: `${Math.max(12, Math.min(24, word.size))}px`,
                      fontWeight: word.count > 500 ? "bold" : "normal",
                      transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                      zIndex: word.count > 500 ? 10 : 1,
                    }}
                    title={`${word.word}: ${word.count} mentions (${word.sentiment})`}
                  >
                    {word.word} {getTrendIcon(word.trend)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Words List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Trending Words</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {topWords.map((word, index) => (
                <div
                  key={word.word}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getSentimentColor(word.sentiment)}`}>{word.word}</span>
                        <span className="text-sm">{getTrendIcon(word.trend)}</span>
                      </div>
                      <div className="text-sm text-gray-500">{word.count.toLocaleString()} mentions</div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      word.sentiment === "positive"
                        ? "bg-green-500"
                        : word.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    } text-white`}
                  >
                    {word.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-4 text-green-700 dark:text-green-400">Social Sentiment Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Dominant Themes</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>🎮 Gaming partnerships driving positive sentiment</li>
                <li>🚀 “Moon” and “pump” indicate bullish expectations</li>
                <li>💎 “Diamond hands” shows strong community conviction</li>
                <li>🏗️ Solana ecosystem integration praised</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Sentiment Distribution</h5>
              <div className="space-y-2">
                <BarLine label="Positive" valuePct={(positiveWords / Math.max(1, wordData.length)) * 100} className="bg-green-500" />
                <BarLine label="Negative" valuePct={(negativeWords / Math.max(1, wordData.length)) * 100} className="bg-red-500" />
                <BarLine
                  label="Neutral"
                  valuePct={((wordData.length - positiveWords - negativeWords) / Math.max(1, wordData.length)) * 100}
                  className="bg-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" className="text-sm bg-transparent">
            Export Word Cloud
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ----- Helpers -----

function classifySentiment(score?: number, text?: string): Sent {
  if (typeof score === "number") {
    if (score > 0.1) return "positive"
    if (score < -0.1) return "negative"
    return "neutral"
  }
  const t = (text || "").toLowerCase()
  if (/\b(bull|moon|pump|ath|up)\b/.test(t)) return "positive"
  if (/\b(bear|dump|down|crash|sell)\b/.test(t)) return "negative"
  return "neutral"
}

function extractTagsFromFeeds(
  feeds: FeedItem[],
  platform: string
): Array<{ word: string; count: number; sentiment: Sent }> {
  const counts = new Map<string, { c: number; s: number }>()
  const filtered = platform === "all" ? feeds : feeds.filter((f) => (f.platform || "").toLowerCase() === platform)

  for (const p of filtered) {
    const text = p.text || p.title || ""
    const hashTags = Array.from(new Set([...(p.tags || []), ...(text.match(/#\w+/g) || [])]))
    const sent = classifySentiment(p.sentiment, text)
    const sentScore = sent === "positive" ? 1 : sent === "negative" ? -1 : 0

    for (let t of hashTags) {
      t = t.toLowerCase().replace(/^#/, "")
      if (!t) continue
      const rec = counts.get(t) || { c: 0, s: 0 }
      rec.c += 1
      rec.s += sentScore
      counts.set(t, rec)
    }
  }

  return Array.from(counts.entries()).map(([word, { c, s }]) => ({
    word,
    count: c,
    sentiment: (s > 0 ? "positive" : s < 0 ? "negative" : "neutral") as Sent,
  }))
}

function addProvidedKeywords(
  derived: Array<{ word: string; count: number; sentiment: Sent }>,
  provided?: Array<{ word: string; count: number; sentiment?: Sent }>
): Array<{ word: string; count: number; sentiment: Sent }> {
  if (!provided?.length) return derived
  const map = new Map<string, { c: number; s: number }>()

  for (const d of derived) {
    map.set(d.word, { c: d.count, s: d.sentiment === "positive" ? 1 : d.sentiment === "negative" ? -1 : 0 })
  }

  for (const k of provided) {
    const key = k.word.toLowerCase()
    const rec = map.get(key) || { c: 0, s: 0 }
    rec.c += k.count
    if (k.sentiment) rec.s += k.sentiment === "positive" ? 1 : k.sentiment === "negative" ? -1 : 0
    map.set(key, rec)
  }

  return Array.from(map.entries()).map(([word, { c, s }]) => ({
    word,
    count: c,
    sentiment: (s > 0 ? "positive" : s < 0 ? "negative" : "neutral") as Sent,
  }))
}

function scaleWithTrend(
  items: Array<{ word: string; count: number; sentiment: Sent }>
): WordData[] {
  if (!items.length) return []
  const counts = items.map((i) => i.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const range = Math.max(1, max - min)

  return items.map((t) => {
    const w = (t.count - min) / range
    const size = Math.round(12 + w * 12) // 12–24
    const trend: Trend = w > 0.66 ? "up" : w < 0.33 ? "down" : "stable"
    return { ...t, size, trend }
  }) as WordData[]
}

// Mock fallback
function buildMockData(): Array<{ word: string; count: number; sentiment: Sent; size: number; trend: Trend }> {
  const positive = [
    "bullish",
    "moon",
    "pump",
    "hodl",
    "diamond",
    "hands",
    "solana",
    "ecosystem",
    "gaming",
    "partnership",
    "community",
    "strong",
    "growth",
    "potential",
    "buy",
  ]
  const negative = ["dump", "bearish", "sell", "crash", "dip", "fear", "uncertainty", "volatile"]
  const neutral = [
    "bonk",
    "token",
    "price",
    "volume",
    "trading",
    "analysis",
    "chart",
    "market",
    "crypto",
    "blockchain",
    "defi",
    "nft",
    "meme",
    "coin",
    "investment",
  ]

  const raw = [
    ...positive.map<WordData>((word) => ({
      word,
      count: Math.floor(Math.random() * 1000) + 50,
      sentiment: "positive",
      size: 16,
      trend: "up",
    })),
    ...negative.map<WordData>((word) => ({
      word,
      count: Math.floor(Math.random() * 800) + 20,
      sentiment: "negative",
      size: 16,
      trend: "down",
    })),
    ...neutral.map<WordData>((word) => ({
      word,
      count: Math.floor(Math.random() * 700) + 30,
      sentiment: "neutral",
      size: 16,
      trend: "stable",
    })),
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)

  return scaleWithTrend(raw.map(({ size, trend, ...rest }) => rest))
}

// Small presentational helper
function BarLine({ label, valuePct, className }: { label: string; valuePct: number; className: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className={`${className} h-2 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, valuePct))}%` }} />
        </div>
        <span className="text-sm font-medium">{Math.round(valuePct)}%</span>
      </div>
    </div>
  )
}
