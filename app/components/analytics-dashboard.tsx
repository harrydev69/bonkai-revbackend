"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Zap } from "lucide-react"

export function AnalyticsDashboard() {
  const metrics = [
    {
      title: "Total Value Locked",
      value: "$2.34B",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Active Users",
      value: "847K",
      change: "+8.2%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Daily Transactions",
      value: "1.2M",
      change: "-2.1%",
      trend: "down",
      icon: Activity,
    },
    {
      title: "Network Activity",
      value: "94%",
      change: "+5.7%",
      trend: "up",
      icon: Zap,
    },
  ]

  const topTokens = [
    { name: "BONK", symbol: "BONK", volume: "$45.2M", change: "+18.6%" },
    { name: "Solana", symbol: "SOL", volume: "$234.1M", change: "+5.2%" },
    { name: "Jupiter", symbol: "JUP", volume: "$12.8M", change: "-3.1%" },
    { name: "Raydium", symbol: "RAY", volume: "$8.9M", change: "+12.4%" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive analytics and insights for the BONK ecosystem</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
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
            </CardContent>
          </Card>
        ))}
      </div>

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
                    <span className="text-sm font-medium text-green-500">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average TPS</span>
                    <span className="text-sm font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Block Time</span>
                    <span className="text-sm font-medium">400ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Validator Count</span>
                    <span className="text-sm font-medium">1,847</span>
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
                      <span className="text-sm font-medium">68.4%</span>
                    </div>
                    <Progress value={68.4} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profit Factor</span>
                      <span className="text-sm font-medium">2.34</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-medium">1.87</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      <span className="text-sm font-medium text-red-500">-12.3%</span>
                    </div>
                    <Progress value={12.3} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volatility</span>
                      <span className="text-sm font-medium">24.7%</span>
                    </div>
                    <Progress value={24.7} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Beta</span>
                      <span className="text-sm font-medium">1.23</span>
                    </div>
                    <Progress value={41} className="h-2" />
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

