"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, BarChart3, ExternalLink, RefreshCw } from "lucide-react"
import { LetsBonkEcosystemTicker } from "./letsbonk-ecosystem-ticker"
import { LetsBonkEcosystemDashboard } from "./letsbonk-ecosystem-dashboard"
import type { BonkData } from "../dashboard/page"

interface EnhancedDashboardProps {
  bonkData: BonkData
}

export function EnhancedDashboard({ bonkData }: EnhancedDashboardProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(
      () => {
        setLastUpdated(new Date())
      },
      15 * 60 * 1000,
    ) // Update every 15 minutes

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return `$${price.toFixed(8)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    }
    return `$${(marketCap / 1e6).toFixed(2)}M`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    }
    return `$${(volume / 1e3).toFixed(2)}K`
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`
    }
    if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`
    }
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BONKai Dashboard</h1>
          <p className="text-muted-foreground">Real-time analytics for the LetsBonk.fun ecosystem</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Badge variant="outline">Live</Badge>
        </div>
      </div>

      {/* Ecosystem Ticker */}
      <LetsBonkEcosystemTicker />

      {/* BONK Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BONK Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(bonkData.price)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {bonkData.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              <span className={bonkData.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                {bonkData.change24h >= 0 ? "+" : ""}
                {bonkData.change24h.toFixed(2)}% (24h)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMarketCap(bonkData.marketCap)}</div>
            <p className="text-xs text-muted-foreground">Fully diluted valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(bonkData.volume24h)}</div>
            <p className="text-xs text-muted-foreground">Trading volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(bonkData.holders)}</div>
            <p className="text-xs text-muted-foreground">Unique addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
            <CardDescription>Current community sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold capitalize">{bonkData.sentiment}</div>
                <p className="text-sm text-muted-foreground">Overall sentiment</p>
              </div>
              <Badge
                variant={bonkData.sentiment === "bullish" ? "default" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {bonkData.sentiment === "bullish" ? "🚀" : "📉"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mindshare Ranking</CardTitle>
            <CardDescription>Position in crypto mindshare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">#{bonkData.mindshareRank}</div>
                <p className="text-sm text-muted-foreground">Global ranking</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Top 5
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24h Transactions</CardTitle>
            <CardDescription>Network activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatNumber(bonkData.transactions24h)}</div>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ecosystem Dashboard */}
      <Tabs defaultValue="ecosystem" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ecosystem">Ecosystem Tokens</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ecosystem" className="space-y-4">
          <LetsBonkEcosystemDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>Technical indicators and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Support Level</span>
                    <span className="font-medium">$0.00002890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resistance Level</span>
                    <span className="font-medium">$0.00004120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <Badge variant="outline">67.3 (Neutral)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MACD</span>
                    <Badge variant="default">Bullish</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Metrics</CardTitle>
                <CardDescription>Community engagement data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Twitter Mentions</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reddit Posts</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telegram Members</span>
                    <span className="font-medium">45.2K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Score</span>
                    <Badge variant="default">8.7/10</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key features and external resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="https://www.coingecko.com/en/coins/bonk" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on CoinGecko
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.coingecko.com/en/categories/letsbonk-fun-ecosystem"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ecosystem Overview
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://solscan.io/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Solscan
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

