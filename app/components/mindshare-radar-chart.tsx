"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Crown, TrendingUp, Users, MessageSquare, Activity } from "lucide-react"
import type { BonkData } from "../context/bonk-context"

interface TokenData {
  name: string
  mindshare: number
  social: number
  technical: number
  community: number
  utility: number
  momentum: number
  color: string
}

interface MindshareRadarChartProps {
  bonkData?: BonkData
}

export function MindshareRadarChart({ bonkData }: MindshareRadarChartProps) {
  const [selectedTokens, setSelectedTokens] = useState<string[]>(["BONK", "DOGE", "SHIB"])
  const [tokenData, setTokenData] = useState<TokenData[]>([])

  useEffect(() => {
    // Generate mock radar chart data
    const generateTokenData = (): TokenData[] => [
      {
        name: "BONK",
        mindshare: 87,
        social: 94,
        technical: 71,
        community: 89,
        utility: 76,
        momentum: 92,
        color: "#f97316",
      },
      {
        name: "DOGE",
        mindshare: 72,
        social: 85,
        technical: 68,
        community: 78,
        utility: 45,
        momentum: 62,
        color: "#eab308",
      },
      {
        name: "SHIB",
        mindshare: 58,
        social: 71,
        technical: 54,
        community: 65,
        utility: 52,
        momentum: 48,
        color: "#3b82f6",
      },
      {
        name: "PEPE",
        mindshare: 45,
        social: 62,
        technical: 41,
        community: 58,
        utility: 38,
        momentum: 35,
        color: "#10b981",
      },
      {
        name: "WIF",
        mindshare: 38,
        social: 55,
        technical: 47,
        community: 42,
        utility: 41,
        momentum: 44,
        color: "#8b5cf6",
      },
    ]

    setTokenData(generateTokenData())
  }, [])

  const radarMetrics = [
    { key: "mindshare", label: "Mindshare", icon: Crown },
    { key: "social", label: "Social", icon: MessageSquare },
    { key: "technical", label: "Technical", icon: Activity },
    { key: "community", label: "Community", icon: Users },
    { key: "utility", label: "Utility", icon: Target },
    { key: "momentum", label: "Momentum", icon: TrendingUp },
  ]

  const toggleToken = (tokenName: string) => {
    setSelectedTokens((prev) => (prev.includes(tokenName) ? prev.filter((t) => t !== tokenName) : [...prev, tokenName]))
  }

  const selectedTokenData = tokenData.filter((token) => selectedTokens.includes(token.name))

  // Calculate radar chart points for SVG
  const getRadarPoints = (data: TokenData) => {
    const center = 150
    const maxRadius = 120
    const angleStep = (2 * Math.PI) / radarMetrics.length

    return radarMetrics
      .map((metric, index) => {
        const angle = index * angleStep - Math.PI / 2 // Start from top
        const value = (data as any)[metric.key]
        const radius = (value / 100) * maxRadius
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return `${x},${y}`
      })
      .join(" ")
  }

  // Calculate axis points for grid
  const getAxisPoints = () => {
    const center = 150
    const maxRadius = 120
    const angleStep = (2 * Math.PI) / radarMetrics.length

    return radarMetrics.map((metric, index) => {
      const angle = index * angleStep - Math.PI / 2
      const x = center + maxRadius * Math.cos(angle)
      const y = center + maxRadius * Math.sin(angle)
      return { x, y, label: metric.label, icon: metric.icon }
    })
  }

  const axisPoints = getAxisPoints()

  return (
    <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Mindshare Radar Comparison</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Multi-dimensional token comparison across key metrics
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            Interactive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Token Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Tokens to Compare</h3>
          <div className="flex flex-wrap gap-3">
            {tokenData.map((token) => (
              <Button
                key={token.name}
                variant={selectedTokens.includes(token.name) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleToken(token.name)}
                className={`${
                  selectedTokens.includes(token.name)
                    ? `bg-[${token.color}] hover:bg-[${token.color}]/80 text-white`
                    : "border-gray-300"
                }`}
                style={
                  selectedTokens.includes(token.name)
                    ? {
                        backgroundColor: token.color,
                        borderColor: token.color,
                      }
                    : {}
                }
              >
                {token.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Radar Chart</h3>
            <div className="relative">
              <svg width="300" height="300" className="overflow-visible">
                {/* Grid circles */}
                {[20, 40, 60, 80, 100].map((percentage) => (
                  <circle
                    key={percentage}
                    cx="150"
                    cy="150"
                    r={(percentage / 100) * 120}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    className="dark:stroke-gray-600"
                  />
                ))}

                {/* Grid lines */}
                {axisPoints.map((point, index) => (
                  <line
                    key={index}
                    x1="150"
                    y1="150"
                    x2={point.x}
                    y2={point.y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    className="dark:stroke-gray-600"
                  />
                ))}

                {/* Token data polygons */}
                {selectedTokenData.map((token, index) => (
                  <g key={token.name}>
                    <polygon
                      points={getRadarPoints(token)}
                      fill={token.color}
                      fillOpacity="0.2"
                      stroke={token.color}
                      strokeWidth="2"
                    />
                    {/* Data points */}
                    {radarMetrics.map((metric, metricIndex) => {
                      const center = 150
                      const maxRadius = 120
                      const angleStep = (2 * Math.PI) / radarMetrics.length
                      const angle = metricIndex * angleStep - Math.PI / 2
                      const value = (token as any)[metric.key]
                      const radius = (value / 100) * maxRadius
                      const x = center + radius * Math.cos(angle)
                      const y = center + radius * Math.sin(angle)

                      return (
                        <circle
                          key={`${token.name}-${metric.key}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={token.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })}
                  </g>
                ))}

                {/* Axis labels */}
                {axisPoints.map((point, index) => (
                  <g key={index}>
                    <text
                      x={point.x + (point.x > 150 ? 10 : point.x < 150 ? -10 : 0)}
                      y={point.y + (point.y > 150 ? 15 : point.y < 150 ? -5 : 0)}
                      textAnchor={point.x > 150 ? "start" : point.x < 150 ? "end" : "middle"}
                      className="text-sm font-medium fill-gray-600 dark:fill-gray-400"
                    >
                      {point.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Metrics Breakdown</h3>
            <div className="space-y-4">
              {radarMetrics.map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  {selectedTokenData.map((token) => (
                    <div key={`${metric.key}-${token.name}`} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: token.color }}></div>
                      <span className="text-sm w-12">{token.name}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(token as any)[metric.key]}%`,
                            backgroundColor: token.color,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{(token as any)[metric.key]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-4 text-orange-700 dark:text-orange-400">
            Competitive Analysis Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">BONK's Strengths</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Highest social engagement (94/100)</li>
                <li>• Strong momentum indicators (92/100)</li>
                <li>• Leading mindshare position (87/100)</li>
                <li>• Active community participation (89/100)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Growth Opportunities</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Technical analysis improvements needed</li>
                <li>• Utility expansion potential</li>
                <li>• Cross-chain integration opportunities</li>
                <li>• DeFi protocol partnerships</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" className="text-sm bg-transparent">
            Export Comparison
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

