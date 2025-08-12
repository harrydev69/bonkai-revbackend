"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonkEcosystemTicker } from "./bonk-ecosystem-ticker"
import { LetsBonkEcosystemDashboard } from "./letsbonk-ecosystem-dashboard"
import { BonkEcosystemDashboard } from "./bonk-ecosystem-dashboard"
import { VolumeHeatmap } from "./volume-heatmap"
import { SentimentTrendChart } from "./sentiment-trend-chart"
import { MindshareRadarChart } from "./mindshare-radar-chart"
import { SocialWordCloud } from "./social-word-cloud"
import { WhaleMovementTracker } from "./whale-movement-tracker"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Target,
  Brain,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
} from "lucide-react"

interface MainContentProps {
  setCurrentView: (view: string) => void
  bonkData: {
    price: number
    marketCap: number
    change24h: number
    volume24h: number
    sentiment: "bullish" | "bearish" | "neutral"
    socialVolume: number
    mindshareRank: number
  }
}

export function MainContent({ setCurrentView, bonkData }: MainContentProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // ---- safe number helpers ----
  const asNumber = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string") {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  const formatPrice = (v: unknown, opts?: { min?: number; max?: number; currency?: string }) => {
    const n = asNumber(v)
    if (n === null) return "—"
    const { min = 4, max = 8, currency = "USD" } = opts ?? {}
    return n.toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    })
  }

  const formatNumber = (v: unknown, opts?: { min?: number; max?: number }) => {
    const n = asNumber(v)
    if (n === null) return "—"
    const { min = 0, max = 4 } = opts ?? {}
    return n.toLocaleString(undefined, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    })
  }

  const formatMarketCap = (v: unknown) => {
    const n = asNumber(v)
    if (n === null) return "—"
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    return `$${n.toFixed(0)}`
  }

  const formatVolume = (v: unknown) => {
    const n = asNumber(v)
    if (n === null) return "—"
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(0)}`
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600 bg-green-50 border-green-200"
      case "bearish":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4" />
      case "bearish":
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const change = asNumber(bonkData?.change24h)
  const isUp = change !== null && change >= 0

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BONKAI Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time analytics for BONK and LetsBonk.fun ecosystem</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Updated now
          </Badge>
        </div>
      </div>

      {/* BONK Ticker */}
      <BonkEcosystemTicker />

      {/* Main BONK Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BONK Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(bonkData?.price, { min: 4, max: 8 })}</div>
            <div className="flex items-center space-x-1 text-xs">
              {change !== null ? (
                isUp ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )
              ) : (
                <Activity className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={change === null ? "text-muted-foreground" : isUp ? "text-green-500" : "text-red-500"}>
                {change === null ? "—" : `${isUp ? "+" : ""}${change.toFixed(2)}% (24h)`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMarketCap(bonkData?.marketCap)}</div>
            <p className="text-xs text-muted-foreground">
              Rank #{formatNumber(bonkData?.mindshareRank, { min: 0, max: 0 })} by mindshare
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(bonkData?.volume24h)}</div>
            <p className="text-xs text-muted-foreground">Trading activity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getSentimentColor(bonkData?.sentiment || "neutral")}>
                {getSentimentIcon(bonkData?.sentiment || "neutral")}
                <span className="ml-1 capitalize">{bonkData?.sentiment || "neutral"}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(bonkData?.socialVolume, { min: 0, max: 0 })} social mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Ecosystem Overview</TabsTrigger>
          <TabsTrigger value="letsbonk">LetsBonk.fun Top 10</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* BONK Ecosystem Dashboard */}
          <BonkEcosystemDashboard />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Access key features and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  onClick={() => setCurrentView("chat")}
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">AI Chat</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  onClick={() => setCurrentView("sentiment")}
                >
                  <Activity className="w-6 h-6" />
                  <span className="text-sm">Sentiment</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  onClick={() => setCurrentView("mindshare")}
                >
                  <Brain className="w-6 h-6" />
                  <span className="text-sm">Mindshare</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  onClick={() => setCurrentView("alerts")}
                >
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letsbonk" className="space-y-6">
          {/* LetsBonk.fun Ecosystem */}
          <LetsBonkEcosystemDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VolumeHeatmap bonkData={bonkData} />
            <SentimentTrendChart bonkData={bonkData} />
            <MindshareRadarChart bonkData={bonkData} />
            <SocialWordCloud bonkData={bonkData} />
          </div>

          {/* Whale Movement Tracker */}
          <WhaleMovementTracker bonkData={bonkData} />

          {/* Analytics Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Advanced Tools
              </CardTitle>
              <CardDescription>Deep dive into market analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  onClick={() => setCurrentView("analytics")}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Full Analytics</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  onClick={() => setCurrentView("narrative")}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm">Narrative Tracker</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  onClick={() => setCurrentView("calendar")}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Event Calendar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

