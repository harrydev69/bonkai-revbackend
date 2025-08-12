"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Flame, Users, MessageCircle, Share2 } from "lucide-react"
import type { BonkData } from "../dashboard/page"

interface NarrativeTrackerProps {
  bonkData: BonkData
}

interface Narrative {
  id: string
  title: string
  description: string
  sentiment: "bullish" | "bearish" | "neutral"
  strength: number
  mentions: number
  engagement: number
  trend: "up" | "down" | "stable"
  tags: string[]
  sources: string[]
  timeframe: string
}

export function NarrativeTracker({ bonkData }: NarrativeTrackerProps) {
  const narratives: Narrative[] = [
    {
      id: "1",
      title: "BONK Ecosystem Expansion",
      description: "Growing adoption of BONK across DeFi protocols and gaming platforms on Solana",
      sentiment: "bullish",
      strength: 85,
      mentions: 12400,
      engagement: 89,
      trend: "up",
      tags: ["defi", "gaming", "adoption"],
      sources: ["Twitter", "Discord", "Reddit", "Telegram"],
      timeframe: "7 days",
    },
    {
      id: "2",
      title: "Solana Network Upgrades",
      description: "Positive sentiment around Solana's performance improvements and reduced fees",
      sentiment: "bullish",
      strength: 78,
      mentions: 8900,
      engagement: 76,
      trend: "up",
      tags: ["solana", "upgrades", "performance"],
      sources: ["Twitter", "Medium", "Discord"],
      timeframe: "3 days",
    },
    {
      id: "3",
      title: "Meme Coin Market Rotation",
      description: "Discussion about capital rotation from other meme coins into BONK",
      sentiment: "bullish",
      strength: 72,
      mentions: 15600,
      engagement: 82,
      trend: "up",
      tags: ["meme-coins", "rotation", "capital-flow"],
      sources: ["Twitter", "Reddit", "TikTok"],
      timeframe: "5 days",
    },
    {
      id: "4",
      title: "Regulatory Concerns",
      description: "General crypto market uncertainty due to regulatory discussions",
      sentiment: "bearish",
      strength: 45,
      mentions: 6700,
      engagement: 34,
      trend: "down",
      tags: ["regulation", "uncertainty", "market"],
      sources: ["News", "Twitter", "LinkedIn"],
      timeframe: "2 days",
    },
    {
      id: "5",
      title: "Community Building Initiatives",
      description: "Strong community engagement through events, contests, and educational content",
      sentiment: "bullish",
      strength: 91,
      mentions: 18200,
      engagement: 94,
      trend: "up",
      tags: ["community", "events", "education"],
      sources: ["Discord", "Twitter", "YouTube"],
      timeframe: "10 days",
    },
  ]

  const getSentimentColor = (sentiment: Narrative["sentiment"]) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-500"
      case "bearish":
        return "text-red-500"
      case "neutral":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getSentimentBadge = (sentiment: Narrative["sentiment"]) => {
    switch (sentiment) {
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

  const getTrendIcon = (trend: Narrative["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "stable":
        return <div className="w-4 h-4 bg-yellow-500 rounded-full" />
      default:
        return null
    }
  }

  const topNarratives = narratives.sort((a, b) => b.strength - a.strength).slice(0, 3)
  const bullishNarratives = narratives.filter((n) => n.sentiment === "bullish")
  const bearishNarratives = narratives.filter((n) => n.sentiment === "bearish")

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
            <div className="text-2xl font-bold">Community Building</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">91% strength</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {narratives.reduce((sum, n) => sum + n.mentions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(narratives.reduce((sum, n) => sum + n.engagement, 0) / narratives.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Community interaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bullish Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {Math.round((bullishNarratives.length / narratives.length) * 100)}%
            </div>
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
                        {narrative.sources.map((source, idx) => (
                          <Badge key={source} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    {index < topNarratives.length - 1 && <div className="border-b" />}
                  </div>
                ))}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

