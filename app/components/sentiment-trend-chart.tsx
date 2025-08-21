"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Activity, MessageSquare, Globe } from "lucide-react"
import type { BonkData } from "../context/bonk-context"

interface SentimentPoint {
  timestamp: string
  overall: number
  social: number
  news: number
  technical: number
  volume: number
}

interface SentimentTrendChartProps {
  bonkData?: BonkData
}

export function SentimentTrendChart({ bonkData }: SentimentTrendChartProps) {
  const [timeframe, setTimeframe] = useState("24h")
  const [sentimentData, setSentimentData] = useState<SentimentPoint[]>([])

  // Provide default values if bonkData is undefined
  const safeBonkData = bonkData || { socialVolume: 1000000 } // Default social volume

  useEffect(() => {
    // Generate mock sentiment trend data
    const generateSentimentData = () => {
      const data: SentimentPoint[] = []
      const points = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30

      for (let i = 0; i < points; i++) {
        const timestamp =
          timeframe === "24h"
            ? `${(23 - i).toString().padStart(2, "0")}:00`
            : timeframe === "7d"
              ? `Day ${7 - i}`
              : `Day ${30 - i}`

        // Generate correlated sentiment data with some randomness
        const baseOverall = 65 + Math.sin(i * 0.3) * 15 + (Math.random() - 0.5) * 10
        const social = baseOverall + (Math.random() - 0.5) * 20
        const news = baseOverall + (Math.random() - 0.5) * 15
        const technical = baseOverall + (Math.random() - 0.5) * 25

        data.unshift({
          timestamp,
          overall: Math.max(0, Math.min(100, baseOverall)),
          social: Math.max(0, Math.min(100, social)),
          news: Math.max(0, Math.min(100, news)),
          technical: Math.max(0, Math.min(100, technical)),
          volume: safeBonkData.socialVolume * (0.5 + Math.random()),
        })
      }
      return data
    }

    setSentimentData(generateSentimentData())
  }, [timeframe, safeBonkData.socialVolume])

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getSentimentBg = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const currentSentiment = sentimentData[sentimentData.length - 1]
  const previousSentiment = sentimentData[sentimentData.length - 2]
  const sentimentChange =
    currentSentiment && previousSentiment ? currentSentiment.overall - previousSentiment.overall : 0

  const sentimentMetrics = [
    {
      label: "Overall Sentiment",
      value: currentSentiment?.overall.toFixed(0) || "0",
      change: sentimentChange,
      icon: Activity,
      color: "blue",
    },
    {
      label: "Social Sentiment",
      value: currentSentiment?.social.toFixed(0) || "0",
      change: (Math.random() - 0.5) * 10,
      icon: MessageSquare,
      color: "green",
    },
    {
      label: "News Sentiment",
      value: currentSentiment?.news.toFixed(0) || "0",
      change: (Math.random() - 0.5) * 8,
      icon: Globe,
      color: "purple",
    },
    {
      label: "Technical Sentiment",
      value: currentSentiment?.technical.toFixed(0) || "0",
      change: (Math.random() - 0.5) * 12,
      icon: TrendingUp,
      color: "orange",
    },
  ]

  return (
    <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Sentiment Trend Analysis</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time sentiment tracking across multiple sources
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">
              Live Updates
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Sentiment Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sentimentMetrics.map((metric, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <metric.icon className={`w-8 h-8 text-${metric.color}-500 mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${getSentimentColor(Number.parseFloat(metric.value))}`}>
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
              <div
                className={`text-sm font-medium flex items-center justify-center gap-1 ${
                  metric.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.change >= 0 ? "+" : ""}
                {metric.change.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Sentiment Trends Over Time</h3>
          <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 relative overflow-hidden">
            {/* Chart Grid */}
            <div className="absolute inset-6 grid grid-rows-5 grid-cols-12 gap-0 opacity-20">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="border border-gray-300 dark:border-gray-600"></div>
              ))}
            </div>

            {/* Chart Lines */}
            <svg className="absolute inset-6 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Overall Sentiment Line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                points={sentimentData
                  .map((point, index) => `${(index / (sentimentData.length - 1)) * 100},${100 - point.overall}`)
                  .join(" ")}
              />

              {/* Social Sentiment Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
                points={sentimentData
                  .map((point, index) => `${(index / (sentimentData.length - 1)) * 100},${100 - point.social}`)
                  .join(" ")}
              />

              {/* News Sentiment Line */}
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="0.5"
                points={sentimentData
                  .map((point, index) => `${(index / (sentimentData.length - 1)) * 100},${100 - point.news}`)
                  .join(" ")}
              />

              {/* Technical Sentiment Line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.5"
                points={sentimentData
                  .map((point, index) => `${(index / (sentimentData.length - 1)) * 100},${100 - point.technical}`)
                  .join(" ")}
              />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-500">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-6 right-6 flex justify-between text-xs text-gray-500">
              {sentimentData.slice(0, 6).map((point, index) => (
                <span key={index}>{point.timestamp}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-blue-500 rounded"></div>
              <span className="text-sm">Overall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-500 rounded"></div>
              <span className="text-sm">Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-purple-500 rounded"></div>
              <span className="text-sm">News</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-yellow-500 rounded"></div>
              <span className="text-sm">Technical</span>
            </div>
          </div>
          <Button variant="outline" className="text-sm bg-transparent">
            Export Chart
          </Button>
        </div>

        {/* Sentiment Analysis */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-4 text-purple-700 dark:text-purple-400">AI Sentiment Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Current Trend</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sentimentChange >= 0
                  ? "📈 Sentiment is trending upward with increasing positive mentions across social platforms."
                  : "📉 Sentiment shows slight decline but remains within normal volatility range."}
              </p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Key Drivers</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🎯 Gaming partnerships and Solana ecosystem growth are primary positive sentiment drivers.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

