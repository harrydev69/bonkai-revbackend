"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Waves, TrendingUp, Clock, BarChart3 } from "lucide-react"

interface VolumeData {
  hour: string
  day: string
  volume: number
  intensity: number
  change: number
}

interface BonkData {
  price: number
  marketCap: number
  change24h: number
  volume24h: number
  sentiment: "bullish" | "bearish" | "neutral"
  socialVolume: number
  mindshareRank: number
}

interface VolumeHeatmapProps {
  bonkData?: BonkData
}

export function VolumeHeatmap({ bonkData }: VolumeHeatmapProps) {
  const [timeframe, setTimeframe] = useState("24h")
  const [volumeData, setVolumeData] = useState<VolumeData[]>([])

  // Default values if bonkData is not provided
  const defaultBonkData: BonkData = {
    price: 0.00003435,
    marketCap: 2340000000,
    change24h: 18.6,
    volume24h: 45600000,
    sentiment: "bullish",
    socialVolume: 2847,
    mindshareRank: 3,
  }

  const currentBonkData = bonkData || defaultBonkData

  useEffect(() => {
    // Generate mock volume data for heatmap
    const generateVolumeData = () => {
      const data: VolumeData[] = []
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

      days.forEach((day) => {
        hours.forEach((hour) => {
          const baseVolume = currentBonkData.volume24h / 24
          const randomMultiplier = 0.3 + Math.random() * 1.4 // 0.3x to 1.7x variation
          const volume = baseVolume * randomMultiplier
          const intensity = Math.min(100, (volume / (currentBonkData.volume24h / 10)) * 100)

          data.push({
            hour: `${hour}:00`,
            day,
            volume,
            intensity,
            change: (Math.random() - 0.5) * 40, // -20% to +20%
          })
        })
      })
      return data
    }

    setVolumeData(generateVolumeData())
  }, [currentBonkData.volume24h, timeframe])

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return "bg-red-500"
    if (intensity >= 60) return "bg-orange-500"
    if (intensity >= 40) return "bg-yellow-500"
    if (intensity >= 20) return "bg-green-500"
    return "bg-blue-500"
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return "Very High"
    if (intensity >= 60) return "High"
    if (intensity >= 40) return "Medium"
    if (intensity >= 20) return "Low"
    return "Very Low"
  }

  const peakHours = volumeData.sort((a, b) => b.volume - a.volume).slice(0, 3)

  const totalVolume = volumeData.reduce((sum, data) => sum + data.volume, 0)
  const avgVolume = totalVolume / volumeData.length

  return (
    <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Volume Heatmap</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trading volume intensity across time periods</p>
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
              Live Data
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Volume Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ${(totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ${(avgVolume / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average/Hour</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{peakHours[0]?.hour || "N/A"}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Volume Intensity by Time</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Hours header */}
              <div className="grid grid-cols-25 gap-1 mb-2">
                <div className="w-12"></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-xs text-center text-gray-500 w-6">
                    {i.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="grid grid-cols-25 gap-1 mb-1">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex items-center">
                    {day}
                  </div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const dataPoint = volumeData.find(
                      (d) => d.day === day && d.hour === `${hour.toString().padStart(2, "0")}:00`,
                    )
                    const intensity = dataPoint?.intensity || 0
                    return (
                      <div
                        key={hour}
                        className={`w-6 h-6 rounded-sm ${getIntensityColor(intensity)} opacity-${Math.max(20, Math.min(100, intensity))} hover:scale-110 transition-transform cursor-pointer`}
                        title={`${day} ${hour}:00 - Volume: $${((dataPoint?.volume || 0) / 1000000).toFixed(2)}M (${getIntensityLabel(intensity)})`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Volume Intensity:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span className="text-xs">Very Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span className="text-xs">Very High</span>
            </div>
          </div>
          <Button variant="outline" className="text-sm bg-transparent">
            Export Data
          </Button>
        </div>

        {/* Peak Hours Analysis */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-400">Peak Trading Hours</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peakHours.map((peak, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">#{index + 1}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {peak.day} {peak.hour}
                </div>
                <div className="text-lg font-semibold">${(peak.volume / 1000000).toFixed(2)}M</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

