"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Search, Bell, BarChart3, Activity, Users, Bot, ChevronRight, Sparkles } from "lucide-react"
import type { ViewType, BonkData } from "../dashboard/page"

interface MobileDashboardProps {
  setCurrentView: (view: ViewType) => void
  bonkData: BonkData
}

export function MobileDashboard({ setCurrentView, bonkData }: MobileDashboardProps) {
  const quickActions = [
    {
      title: "AI Analysis",
      description: "Get instant BONK insights",
      icon: Bot,
      href: "/chat",
      color: "from-blue-500 to-blue-600",
      badge: "AI",
    },
    {
      title: "Price Alert",
      description: "Set smart notifications",
      icon: Bell,
      href: "/alerts",
      color: "from-red-500 to-red-600",
      badge: "New",
    },
    {
      title: "Search Data",
      description: "Explore BONK ecosystem",
      icon: Search,
      href: "/search",
      color: "from-green-500 to-green-600",
      badge: "Live",
    },
    {
      title: "Sentiment",
      description: "Market mood tracker",
      icon: TrendingUp,
      href: "/sentiment",
      color: "from-purple-500 to-purple-600",
      badge: bonkData.sentiment === "bullish" ? "↗" : "↘",
    },
  ]

  const stats = [
    {
      label: "Price",
      value: `$${bonkData.price.toFixed(8)}`,
      change: `${bonkData.change24h >= 0 ? "+" : ""}${bonkData.change24h.toFixed(1)}%`,
      icon: Activity,
      positive: bonkData.change24h >= 0,
    },
    {
      label: "Volume",
      value: `$${(bonkData.volume24h / 1000000).toFixed(1)}M`,
      change: "+23.4%",
      icon: BarChart3,
      positive: true,
    },
    {
      label: "Social",
      value: `${bonkData.socialVolume}`,
      change: "mentions/hr",
      icon: Users,
      positive: true,
    },
  ]

  return (
    <div className="pt-16 pb-20 px-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">🎩</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
          Welcome to BONKai
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Your BONK intelligence companion</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${stat.positive ? "bg-green-500" : "bg-red-500"} text-white text-xs`}>
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              asChild
            >
              <a href={action.href}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center shadow-sm`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge className={`bg-gradient-to-r ${action.color} text-white text-xs`}>{action.badge}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                                  </div>
                </CardContent>
              </a>
            </Card>
            ))}
          </div>
        </div>

      {/* Recent Activity */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Market Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">BONK price surge detected</span>
            </div>
            <span className="text-xs text-gray-500">2m ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Social sentiment: Bullish</span>
            </div>
            <span className="text-xs text-gray-500">5m ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Whale movement detected</span>
            </div>
            <span className="text-xs text-gray-500">12m ago</span>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2">Ready to dive deeper?</h3>
          <p className="text-orange-100 mb-4 text-sm">Explore advanced analytics and AI-powered insights</p>
          <Button
            asChild
            className="bg-white text-orange-600 hover:bg-orange-50 font-medium"
          >
            <a href="/chat">
              <Bot className="w-4 h-4 mr-2" />
              Start AI Chat
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

