import { useQuery } from "@tanstack/react-query"
import type { HeatmapPayload } from "@/app/types/heatmap"

async function fetchVolumeHeatmap(days: number): Promise<HeatmapPayload> {
  const response = await fetch(`/api/bonk/heatmap?days=${days}`, {
    cache: "no-store",
  })
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Failed to fetch volume heatmap")
    throw new Error(`Volume heatmap fetch failed: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

export function useVolumeHeatmap(days: number = 30) {
  return useQuery({
    queryKey: ["volume-heatmap", days],
    queryFn: () => fetchVolumeHeatmap(days),
    staleTime: 300000, // 5 minutes (matches API revalidate)
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Helper function to format volume numbers
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`
  }
  if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`
  }
  if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`
  }
  return `$${volume.toFixed(2)}`
}

// Helper function to get intensity color class
export function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case 'very_high': return "bg-red-500"
    case 'high': return "bg-orange-500"
    case 'medium': return "bg-yellow-500"
    case 'low': return "bg-green-500"
    case 'very_low': return "bg-blue-500"
    default: return "bg-gray-500"
  }
}

// Helper function to get intensity label
export function getIntensityLabel(intensity: string): string {
  switch (intensity) {
    case 'very_high': return "Very High"
    case 'high': return "High"
    case 'medium': return "Medium"
    case 'low': return "Low"
    case 'very_low': return "Very Low"
    default: return "Unknown"
  }
}

// Helper function to get day name from dow
export function getDayName(dow: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[dow] || "Unknown"
}

// Helper function to format hour
export function formatHour(hour: number): string {
  return hour.toString().padStart(2, "0") + ":00"
}
