"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Zap, AlertCircle, RefreshCw } from "lucide-react"

interface BlockchainMetrics {
  tvl: {
    total: number
    change24h: number
    change7d: number
    source: string
  }
  users: {
    active24h: number
    active7d: number
    total: number
    source: string
  }
  transactions: {
    daily: number
    hourly: number
    change24h: number
    source: string
  }
  network: {
    uptime: number
    tps: number
    blockTime: number
    validators: number
    source: string
  }
  performance: {
    winRate: number
    profitFactor: number
    sharpeRatio: number
    maxDrawdown: number
    volatility: number
    beta: number
    source: string
  }
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BlockchainMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/blockchain/analytics')
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`)
      }
      
      const data = await response.json()
      setMetrics(data)
      setLastUpdated(data.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      console.error('Metrics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatNumber = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toLocaleString()
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Loading real-time blockchain metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-20 mb-2" />
                <div className="h-3 bg-muted rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Error loading metrics</p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load metrics</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchMetrics}
              className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">No metrics available</p>
        </div>
      </div>
    )
  }

  const metricsCards = [
    {
      title: "Total Value Locked",
      value: formatCurrency(metrics.tvl.total),
      change: formatPercentage(metrics.tvl.change24h),
      trend: metrics.tvl.change24h >= 0 ? "up" : "down",
      icon: DollarSign,
      source: metrics.tvl.source
    },
    {
      title: "Active Users (24h)",
      value: formatNumber(metrics.users.active24h),
      change: formatPercentage(((metrics.users.active24h - metrics.users.active7d / 7) / (metrics.users.active7d / 7)) * 100),
      trend: "up",
      icon: Users,
      source: metrics.users.source
    },
    {
      title: "Daily Transactions",
      value: formatNumber(metrics.transactions.daily),
      change: formatPercentage(metrics.transactions.change24h),
      trend: metrics.transactions.change24h >= 0 ? "up" : "down",
      icon: Activity,
      source: metrics.transactions.source
    },
    {
      title: "Network TPS",
      value: formatNumber(metrics.network.tps),
      change: "+2.1%",
      trend: "up",
      icon: Zap,
      source: metrics.network.source
    },
  ]

  const topTokens = [
    { name: "BONK", symbol: "BONK", volume: "$45.2M", change: "+18.6%" },
    { name: "Solana", symbol: "SOL", volume: "$234.1M", change: "+5.2%" },
    { name: "Jupiter", symbol: "JUP", volume: "$12.8M", change: "-3.1%" },
    { name: "Raydium", symbol: "RAY", volume: "$8.9M", change: "+12.4%" },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive analytics and insights for the BONK ecosystem</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change} from last week
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Source: {metric.source}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
                <CardDescription>Key market indicators and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Market Sentiment</span>
                    <Badge variant="default">Bullish</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                    <span className="text-sm font-medium">72 (Greed)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volatility</span>
                    <span className="text-sm font-medium">Medium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trend Strength</span>
                    <Progress value={78} className="w-20 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Blockchain network statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Network Uptime</span>
                    <span className="text-sm font-medium text-green-500">{metrics.network.uptime}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average TPS</span>
                    <span className="text-sm font-medium">{metrics.network.tps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Block Time</span>
                    <span className="text-sm font-medium">{metrics.network.blockTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Validator Count</span>
                    <span className="text-sm font-medium">{metrics.network.validators.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Source: {metrics.network.source}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tokens</CardTitle>
              <CardDescription>Highest volume and best performing tokens in the ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTokens.map((token, index) => (
                  <div key={token.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{token.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{token.name}</div>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{token.volume}</div>
                      <div className={`text-sm ${token.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {token.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis and benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Trading Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="text-sm font-medium">{metrics.performance.winRate}%</span>
                    </div>
                    <Progress value={metrics.performance.winRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profit Factor</span>
                      <span className="text-sm font-medium">{metrics.performance.profitFactor}</span>
                    </div>
                    <Progress value={(metrics.performance.profitFactor / 3) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-medium">{metrics.performance.sharpeRatio}</span>
                    </div>
                    <Progress value={(metrics.performance.sharpeRatio / 3) * 100} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      <span className="text-sm font-medium text-red-500">{metrics.performance.maxDrawdown}%</span>
                    </div>
                    <Progress value={Math.abs(metrics.performance.maxDrawdown)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volatility</span>
                      <span className="text-sm font-medium">{metrics.performance.volatility}%</span>
                    </div>
                    <Progress value={metrics.performance.volatility} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Beta</span>
                      <span className="text-sm font-medium">{metrics.performance.beta}</span>
                    </div>
                    <Progress value={(metrics.performance.beta / 2) * 100} className="h-2" />
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-4 border-t mt-6">
                Source: {metrics.performance.source}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

