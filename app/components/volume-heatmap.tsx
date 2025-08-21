"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Waves, TrendingUp, Clock, BarChart3, Activity, RefreshCw, Download } from "lucide-react"
import { useVolumeHeatmap, formatVolume, getIntensityColor, getIntensityLabel, getDayName, formatHour } from "@/app/hooks/useVolumeHeatmap"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { HeatmapPayload } from "@/app/types/heatmap"

interface VolumeHeatmapProps {
  bonkData?: {
    price: number
    marketCap: number
    change24h: number
    volume24h: number
    sentiment: "bullish" | "bearish" | "neutral"
    socialVolume: number
    mindshareRank: number
  }
}

export function VolumeHeatmap({ bonkData }: VolumeHeatmapProps) {
  const [days, setDays] = useState(30)
  const { data, isLoading, error, refetch, isRefetching } = useVolumeHeatmap(days)

  const handleExport = () => {
    if (!data) return
    
    const csvContent = generateCSV(data)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bonk-volume-heatmap-${days}days-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateCSV = (data: HeatmapPayload) => {
    const headers = ["Day", "Hour", "Total Volume (USD)", "Count", "Average Volume (USD)", "Intensity"]
    const rows = data.buckets.map((bucket) => [
      getDayName(bucket.dow),
      formatHour(bucket.hour),
      bucket.totalUsd,
      bucket.count,
      bucket.avgUsd,
      bucket.intensity
    ])
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")
  }

  if (error) {
    return (
      <Card className="border-red-200/50 dark:border-red-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Failed to Load Volume Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time BONK trading volume from CoinGecko
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
              {isRefetching ? "Updating..." : "Live Data"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {isLoading ? (
          <VolumeHeatmapSkeleton />
        ) : data ? (
          <>
            {/* Volume Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatVolume(data.totalUsd)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.windowHours} hours of data
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatVolume(data.avgPerHour)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average/Hour</div>
                <div className="text-xs text-gray-500 mt-1">
                  Across {days} days
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatHour(data.peakHourUTC)} UTC
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</div>
                <div className="text-xs text-gray-500 mt-1">
                  Highest average volume
                </div>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Volume Intensity by Time (UTC)</h3>
                <div className="text-xs text-gray-500">
                  Data from CoinGecko • Updates every 5 minutes
                </div>
              </div>
              
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
                  {Array.from({ length: 7 }, (_, dow) => (
                    <div key={dow} className="grid grid-cols-25 gap-1 mb-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 flex items-center">
                        {getDayName(dow)}
                      </div>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const bucket = data.buckets.find(b => b.dow === dow && b.hour === hour)
                        if (!bucket) return <div key={hour} className="w-6 h-6" />
                        
                        return (
                          <TooltipProvider key={hour}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-6 h-6 rounded-sm ${getIntensityColor(bucket.intensity)} hover:scale-110 transition-transform cursor-pointer ${
                                    bucket.avgUsd > 0 ? "opacity-80" : "opacity-20"
                                  }`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">{getDayName(dow)} {formatHour(hour)} UTC</div>
                                  <div>Total: {formatVolume(bucket.totalUsd)}</div>
                                  <div>Average: {formatVolume(bucket.avgUsd)}</div>
                                  <div>Count: {bucket.count} hours</div>
                                  <div>Intensity: {getIntensityLabel(bucket.intensity)}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mb-6">
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
              
              <Button 
                onClick={handleExport} 
                variant="outline" 
                className="text-sm bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>

            {/* Thresholds Info */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <h4 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-400">
                Intensity Thresholds (Quantiles)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">Q20</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Very Low</div>
                  <div className="text-lg font-semibold">{formatVolume(data.thresholds.q20)}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">Q40</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
                  <div className="text-lg font-semibold">{formatVolume(data.thresholds.q40)}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">Q60</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
                  <div className="text-lg font-semibold">{formatVolume(data.thresholds.q60)}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">Q80</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
                  <div className="text-lg font-semibold">{formatVolume(data.thresholds.q80)}</div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function VolumeHeatmapSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Skeleton className="w-8 h-8 mx-auto mb-2" />
            <Skeleton className="h-8 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Heatmap Skeleton */}
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-25 gap-1 mb-2">
              <div className="w-12"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <Skeleton key={i} className="w-6 h-4" />
              ))}
            </div>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="grid grid-cols-25 gap-1 mb-1">
                <Skeleton className="w-12 h-4" />
                {Array.from({ length: 24 }, (_, hour) => (
                  <Skeleton key={hour} className="w-6 h-6" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      
      {/* Thresholds Skeleton */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-6 w-8 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-6 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

