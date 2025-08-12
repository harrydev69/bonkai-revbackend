"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Brain,
  TrendingUp,
  Users,
  MessageSquare,
  Eye,
  Target,
  Flame,
  ExternalLink,
  Calendar,
  Activity,
  Zap,
} from "lucide-react"
import { MindshareRadarChart } from "./mindshare-radar-chart"
import { SocialWordCloud } from "./social-word-cloud"

interface MindshareData {
  rank: number
  score: number
  change24h: number
  socialMentions: number
  influencerMentions: number
  communityEngagement: number
  brandAwareness: number
  competitorComparison: {
    name: string
    score: number
    change: number
  }[]
}

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  timestamp: string
  source: string
  trending: boolean
  engagement: number
  sentiment: "positive" | "neutral" | "negative"
}

export function MindshareTracker() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const mindshareData: MindshareData = {
    rank: 3,
    score: 89.2,
    change24h: 15.7,
    socialMentions: 18750,
    influencerMentions: 312,
    communityEngagement: 94.3,
    brandAwareness: 82.1,
    competitorComparison: [
      { name: "DOGE", score: 95.2, change: -1.8 },
      { name: "SHIB", score: 91.4, change: 2.3 },
      { name: "BONK", score: 89.2, change: 15.7 },
      { name: "PEPE", score: 78.9, change: -3.2 },
      { name: "WIF", score: 72.1, change: 4.8 },
    ],
  }

  const latestNews: NewsItem[] = [
    {
      id: "1",
      title: "BONK Reaches New All-Time High of $0.000055",
      summary:
        "BONK token surged 340% in the past month, breaking previous ATH records amid massive community support and increased utility adoption.",
      category: "Price Action",
      timestamp: "2 hours ago",
      source: "CoinDesk",
      trending: true,
      engagement: 15420,
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Solana Mobile Integration Boosts BONK Ecosystem",
      summary:
        "Partnership with Solana Mobile brings BONK to millions of Saga phone users, enabling seamless mobile payments and rewards.",
      category: "Partnerships",
      timestamp: "6 hours ago",
      source: "Solana Foundation",
      trending: true,
      engagement: 12890,
      sentiment: "positive",
    },
    {
      id: "3",
      title: "BONK Community Celebrates 1.5M+ Holders Milestone",
      summary:
        "The BONK community has grown to over 1.5 million unique holders, making it one of the most distributed tokens on Solana.",
      category: "Community",
      timestamp: "12 hours ago",
      source: "BONK Official",
      trending: true,
      engagement: 9876,
      sentiment: "positive",
    },
    {
      id: "4",
      title: "Major DeFi Protocol Adds BONK Liquidity Pools",
      summary:
        "Jupiter DEX announces new BONK trading pairs with enhanced liquidity incentives, boosting trading volume by 200%.",
      category: "DeFi",
      timestamp: "1 day ago",
      source: "Jupiter Exchange",
      trending: false,
      engagement: 7654,
      sentiment: "positive",
    },
    {
      id: "5",
      title: "BONK Burn Mechanism Removes 1 Trillion Tokens",
      summary:
        "Community-driven burn event successfully removes 1 trillion BONK tokens from circulation, reducing total supply by 2.1%.",
      category: "Tokenomics",
      timestamp: "2 days ago",
      source: "BONK DAO",
      trending: false,
      engagement: 11234,
      sentiment: "positive",
    },
    {
      id: "6",
      title: "BONK NFT Collection Launches on Magic Eden",
      summary:
        "Official BONK NFT collection featuring 10,000 unique dog avatars launches with utility features and staking rewards.",
      category: "NFTs",
      timestamp: "3 days ago",
      source: "Magic Eden",
      trending: false,
      engagement: 5432,
      sentiment: "positive",
    },
  ]

  const trendingTopics = [
    { topic: "ATH Breakout", mentions: 2340, trend: "up", category: "Price" },
    { topic: "Solana Mobile", mentions: 1890, trend: "up", category: "Tech" },
    { topic: "Community Growth", mentions: 1567, trend: "up", category: "Social" },
    { topic: "Jupiter Integration", mentions: 1234, trend: "up", category: "DeFi" },
    { topic: "Token Burns", mentions: 987, trend: "stable", category: "Tokenomics" },
    { topic: "NFT Launch", mentions: 756, trend: "up", category: "NFTs" },
    { topic: "Staking Rewards", mentions: 654, trend: "up", category: "Rewards" },
    { topic: "Mobile Payments", mentions: 543, trend: "up", category: "Utility" },
  ]

  const categories = ["all", "Price Action", "Partnerships", "Community", "DeFi", "Tokenomics", "NFTs"]

  const filteredNews =
    selectedCategory === "all" ? latestNews : latestNews.filter((news) => news.category === selectedCategory)

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200"
      case "negative":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
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
            Rank #{mindshareData.rank}
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
            <div className="text-2xl font-bold text-orange-700">{mindshareData.score}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+{mindshareData.change24h}% from yesterday
            </div>
            <Progress value={mindshareData.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{mindshareData.socialMentions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
            <div className="text-xs text-green-600 mt-1">+23% vs yesterday</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencer Mentions</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{mindshareData.influencerMentions}</div>
            <p className="text-xs text-muted-foreground">Verified accounts</p>
            <div className="text-xs text-green-600 mt-1">+18% this week</div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Awareness</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{mindshareData.brandAwareness}%</div>
            <Progress value={mindshareData.brandAwareness} className="mt-2" />
            <div className="text-xs text-green-600 mt-1">All-time high</div>
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
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
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

          {/* News Items */}
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
                    price: 0.000055,
                    change24h: 15.7,
                    volume24h: 125000000,
                    marketCap: 3200000000,
                    holders: 1500000,
                    transactions24h: 45000,
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
                {/* bonkData prop is optional now */}
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
                {mindshareData.competitorComparison.map((competitor, index) => (
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
                        {competitor.change >= 0 ? "+" : ""}
                        {competitor.change}%
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Positive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-700 mb-2">72%</div>
                <Progress value={72} className="mt-2 mb-3" />
                <div className="space-y-2 text-sm">
                  <p className="text-green-600 font-medium">• ATH celebrations</p>
                  <p className="text-green-600 font-medium">• Community growth</p>
                  <p className="text-green-600 font-medium">• Partnership news</p>
                </div>
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
                <div className="text-4xl font-bold text-yellow-700 mb-2">19%</div>
                <Progress value={19} className="mt-2 mb-3" />
                <div className="space-y-2 text-sm">
                  <p className="text-yellow-600 font-medium">• Market analysis</p>
                  <p className="text-yellow-600 font-medium">• Technical discussions</p>
                  <p className="text-yellow-600 font-medium">• Wait and see</p>
                </div>
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
                <div className="text-4xl font-bold text-red-700 mb-2">9%</div>
                <Progress value={9} className="mt-2 mb-3" />
                <div className="space-y-2 text-sm">
                  <p className="text-red-600 font-medium">• Profit taking concerns</p>
                  <p className="text-red-600 font-medium">• Market volatility</p>
                  <p className="text-red-600 font-medium">• General skepticism</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Timeline</CardTitle>
              <CardDescription>How sentiment has evolved over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Today", positive: 72, neutral: 19, negative: 9, event: "ATH reached" },
                  { date: "Yesterday", positive: 68, neutral: 22, negative: 10, event: "Mobile integration announced" },
                  { date: "2 days ago", positive: 65, neutral: 25, negative: 10, event: "Community milestone" },
                  { date: "3 days ago", positive: 62, neutral: 28, negative: 10, event: "DeFi partnerships" },
                  { date: "4 days ago", positive: 58, neutral: 30, negative: 12, event: "Token burn event" },
                  { date: "5 days ago", positive: 55, neutral: 32, negative: 13, event: "NFT collection launch" },
                  { date: "6 days ago", positive: 52, neutral: 35, negative: 13, event: "Regular trading" },
                ].map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium w-20">{day.date}</span>
                      <span className="text-sm text-muted-foreground">{day.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{day.positive}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">{day.neutral}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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

// Export both for compatibility
export const MindshareAnalyticsDashboard = MindshareTracker
