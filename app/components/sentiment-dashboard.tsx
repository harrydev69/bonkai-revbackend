"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Heart, MessageCircle, Users, Activity, Zap } from "lucide-react"
import type { BonkData } from "../dashboard/page"

interface SentimentDashboardProps {
  bonkData: BonkData
}

export function SentimentDashboard({ bonkData }: SentimentDashboardProps) {
  const sentimentData = {
    overall: bonkData.sentiment,
    score: bonkData.sentiment === "bullish" ? 78 : bonkData.sentiment === "bearish" ? 32 : 55,
    socialVolume: bonkData.socialVolume,
    platforms: [
      { name: "Twitter", sentiment: "bullish", score: 82, mentions: 15420, change: "+12%" },
      { name: "Reddit", sentiment: "bullish", score: 76, mentions: 8930, change: "+8%" },
      { name: "Discord", sentiment: "bullish", score: 85, mentions: 12100, change: "+15%" },
      { name: "Telegram", sentiment: "neutral", score: 58, mentions: 6750, change: "-3%" },
      { name: "YouTube", sentiment: "bullish", score: 71, mentions: 3200, change: "+22%" },
    ],
    keywords: [
      { word: "bullish", count: 8420, sentiment: "positive" },
      { word: "moon", count: 6890, sentiment: "positive" },
      { word: "hodl", count: 5670, sentiment: "positive" },
      { word: "pump", count: 4320, sentiment: "positive" },
      { word: "dip", count: 2890, sentiment: "negative" },
      { word: "sell", count: 1450, sentiment: "negative" },
    ],
    influencers: [
      { name: "@CryptoWhale", followers: "2.1M", sentiment: "bullish", impact: 95 },
      { name: "@SolanaDaily", followers: "890K", sentiment: "bullish", impact: 87 },
      { name: "@DeFiGuru", followers: "1.5M", sentiment: "neutral", impact: 72 },
      { name: "@MemeCoinKing", followers: "650K", sentiment: "bullish", impact: 89 },
    ],
  }

  const getSentimentColor = (sentiment: string) => {
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

  const getSentimentBadge = (sentiment: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sentiment Analysis</h1>
        <p className="text-muted-foreground">Real-time sentiment tracking across social media platforms</p>
      </div>

      {/* Overall Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{sentimentData.overall}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">{sentimentData.score}% positive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Volume</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentData.socialVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Mentions (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500">+2.3% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94</div>
            <p className="text-xs text-muted-foreground">Trending potential</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Sentiment Breakdown</CardTitle>
              <CardDescription>Sentiment analysis across different social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sentimentData.platforms.map((platform) => (
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
                            <span className={platform.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                              {platform.change}
                            </span>
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

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Keywords</CardTitle>
              <CardDescription>Most mentioned keywords and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentimentData.keywords.map((keyword) => (
                  <div key={keyword.word} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${keyword.sentiment === "positive" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <div>
                        <span className="font-medium">#{keyword.word}</span>
                        <p className="text-sm text-muted-foreground">{keyword.count.toLocaleString()} mentions</p>
                      </div>
                    </div>
                    <Badge variant={keyword.sentiment === "positive" ? "default" : "destructive"}>
                      {keyword.sentiment}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Influencers</CardTitle>
              <CardDescription>Influential voices and their sentiment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.influencers.map((influencer) => (
                  <div key={influencer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{influencer.name}</h3>
                        <p className="text-sm text-muted-foreground">{influencer.followers} followers</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={getSentimentBadge(influencer.sentiment)}>{influencer.sentiment}</Badge>
                      <p className="text-sm text-muted-foreground">Impact: {influencer.impact}%</p>
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
              <CardTitle>Sentiment Trends</CardTitle>
              <CardDescription>Historical sentiment patterns and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-500">+15%</div>
                    <p className="text-sm text-muted-foreground">Sentiment improvement (7d)</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">2.3x</div>
                    <p className="text-sm text-muted-foreground">Volume increase (24h)</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-500">89%</div>
                    <p className="text-sm text-muted-foreground">Positive mentions ratio</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Key Insights</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Sentiment has been consistently bullish for the past 5 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Social volume peaked during recent ecosystem announcements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Influencer sentiment alignment at 94% - highest in 30 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Viral potential score indicates strong momentum continuation</span>
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

