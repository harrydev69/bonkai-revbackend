"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Crown,
  Target,
  Users,
  MessageSquare,
  Activity,
  Rocket,
  Gamepad2,
  Coins,
  FlameIcon as Fire,
} from "lucide-react"
import type { BonkData } from "../page"

interface MindshareData {
  token: string
  share: number
  change24h: number
  rank: number
  marketCap: string
  socialVolume: number
  color: string
  trend: "up" | "down" | "stable"
}

interface Narrative {
  id: string
  title: string
  description: string
  momentum: "High" | "Medium" | "Low"
  trend: "up" | "down" | "stable"
  strength: number
  timeframe: string
  category: "ecosystem" | "utility" | "community" | "technical" | "market"
  keyEvents: string[]
  impact: "Bullish" | "Bearish" | "Neutral"
}

interface CombinedAnalyticsProps {
  bonkData: BonkData
}

export function CombinedAnalyticsDashboard({ bonkData }: CombinedAnalyticsProps) {
  const [mindshareData] = useState<MindshareData[]>([
    {
      token: "BONK",
      share: 87,
      change24h: 15.2,
      rank: 1,
      marketCap: "$2.34B",
      socialVolume: 2847,
      color: "bg-orange-500",
      trend: "up",
    },
    {
      token: "DOGE",
      share: 72,
      change24h: -2.8,
      rank: 2,
      marketCap: "$12.8B",
      socialVolume: 1923,
      color: "bg-yellow-500",
      trend: "down",
    },
    {
      token: "SHIB",
      share: 58,
      change24h: 4.1,
      rank: 3,
      marketCap: "$5.2B",
      socialVolume: 1456,
      color: "bg-blue-500",
      trend: "up",
    },
    {
      token: "PEPE",
      share: 45,
      change24h: -7.3,
      rank: 4,
      marketCap: "$1.8B",
      socialVolume: 892,
      color: "bg-green-500",
      trend: "down",
    },
  ])

  const [narratives] = useState<Narrative[]>([
    {
      id: "1",
      title: "Solana Meme King",
      description: "BONK has established itself as the dominant meme coin on Solana, becoming the unofficial mascot",
      momentum: "High",
      trend: "up",
      strength: 94,
      timeframe: "Last 30 days",
      category: "ecosystem",
      keyEvents: ["Solana Foundation recognition", "Major DEX integrations", "Gaming partnerships"],
      impact: "Bullish",
    },
    {
      id: "2",
      title: "Gaming & P2E Integration",
      description: "BONK's integration into Solana gaming ecosystem driving utility-based adoption",
      momentum: "High",
      trend: "up",
      strength: 89,
      timeframe: "Last 14 days",
      category: "utility",
      keyEvents: ["Star Atlas partnership", "Magic Eden gaming", "P2E game launches"],
      impact: "Bullish",
    },
    {
      id: "3",
      title: "Community Governance Evolution",
      description: "Transition to DAO governance model with community-driven decision making",
      momentum: "Medium",
      trend: "up",
      strength: 76,
      timeframe: "Last 21 days",
      category: "community",
      keyEvents: ["DAO proposal system", "Community treasury", "Governance token mechanics"],
      impact: "Bullish",
    },
  ])

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ecosystem":
        return Rocket
      case "utility":
        return Gamepad2
      case "community":
        return Users
      case "technical":
        return Coins
      case "market":
        return Target
      default:
        return Zap
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ecosystem":
        return "bg-orange-500"
      case "utility":
        return "bg-blue-500"
      case "community":
        return "bg-green-500"
      case "technical":
        return "bg-purple-500"
      case "market":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const topNarratives = narratives.filter((n) => n.momentum === "High")

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="w-full p-6 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">BONK Analytics Hub</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Comprehensive mindshare tracking and narrative analysis
            </p>
          </div>
        </div>

        {/* Analytics Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-10 h-10 text-orange-500" />
                <Badge className="bg-orange-500 text-white text-sm px-3 py-1">Rank #1</Badge>
              </div>
              <div className="text-3xl font-bold text-orange-500 mb-2">87%</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Mindshare Score</div>
              <div className="text-base font-medium text-green-500">+15.2% today</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Fire className="w-10 h-10 text-red-500" />
                <Badge className="bg-red-500 text-white text-sm px-3 py-1">Hot</Badge>
              </div>
              <div className="text-3xl font-bold text-red-500 mb-2">{topNarratives.length}</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Hot Narratives</div>
              <div className="text-base font-medium text-red-500">High momentum</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-10 h-10 text-blue-500" />
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-2">2,847</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Mentions/Hour</div>
              <div className="text-base font-medium text-blue-500">+23% vs avg</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-10 h-10 text-green-500" />
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">Strong</Badge>
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2">94%</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Ecosystem Share</div>
              <div className="text-base font-medium text-green-500">Solana dominance</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Container */}
        <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mindshare tracking and narrative momentum analysis
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                Real-time
              </Badge>
            </div>
          </CardHeader>

          <div className="p-6">
            <Tabs defaultValue="mindshare" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                <TabsTrigger value="mindshare" className="text-base">
                  <Brain className="w-4 h-4 mr-2" />
                  Token Mindshare
                </TabsTrigger>
                <TabsTrigger value="narratives" className="text-base">
                  <Zap className="w-4 h-4 mr-2" />
                  Narrative Tracker
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-base">
                  <Target className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mindshare" className="space-y-8">
                <div className="space-y-6">
                  {mindshareData.map((token, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-6 rounded-lg ${
                        token.token === "BONK"
                          ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-600"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-2xl font-bold text-gray-400">#{token.rank}</div>
                        <div
                          className={`w-12 h-12 rounded-xl ${token.color} flex items-center justify-center shadow-sm`}
                        >
                          <span className="text-white font-bold">{token.token.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{token.token}</h3>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            {token.socialVolume.toLocaleString()} mentions/hr
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-2xl font-bold">{token.share}%</div>
                          <div className="text-sm text-gray-500">Mindshare</div>
                        </div>
                        <div className="w-32">
                          <Progress value={token.share} className="h-3" />
                        </div>
                        <div className="flex items-center gap-2">
                          {token.trend === "up" ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`font-medium ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="narratives" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {narratives.map((narrative) => {
                    const CategoryIcon = getCategoryIcon(narrative.category)
                    return (
                      <Card
                        key={narrative.id}
                        className="border-orange-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 hover:shadow-lg transition-all duration-200"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-xl ${getCategoryColor(narrative.category)} flex items-center justify-center shadow-sm`}
                              >
                                <CategoryIcon className="w-6 h-6 text-white" />
                              </div>
                              <Badge className={`${getMomentumColor(narrative.momentum)} text-white text-sm px-3 py-1`}>
                                {narrative.momentum}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <span className="text-lg font-bold text-green-500">{narrative.strength}%</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl leading-tight">{narrative.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">{narrative.description}</p>
                          <Progress value={narrative.strength} className="h-3 mb-4" />
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-sm">
                              {narrative.category}
                            </Badge>
                            <Badge
                              className={`${narrative.impact === "Bullish" ? "bg-green-500" : "bg-gray-500"} text-white text-sm px-3 py-1`}
                            >
                              {narrative.impact}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-8">
                <div className="space-y-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h3 className="font-semibold text-lg mb-3 text-orange-700 dark:text-orange-400">
                      🎯 Key Insight: BONK's Solana Dominance
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      BONK has achieved unprecedented mindshare dominance within the Solana ecosystem, capturing 94% of
                      meme coin discussions. This positions BONK as the unofficial mascot of Solana DeFi.
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-lg mb-3 text-blue-700 dark:text-blue-400">
                      📈 Growth Opportunity: Gaming Integration
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      BONK's gaming partnerships are driving 23% higher engagement rates compared to traditional meme
                      coins, suggesting utility-driven growth potential.
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                    <h3 className="font-semibold text-lg mb-3 text-green-700 dark:text-green-400">
                      🚀 Competitive Advantage: Community Governance
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      BONK's transition to community governance is generating 40% more positive sentiment than
                      competitor tokens, indicating strong community alignment.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  )
}

