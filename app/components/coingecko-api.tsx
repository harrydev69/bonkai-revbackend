"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, TrendingUp, TrendingDown } from "lucide-react"

interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
  image: string
}

export function CoinGeckoApiExample() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCoinData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Example API call to CoinGecko
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=letsbonk-fun-ecosystem&order=market_cap_desc&per_page=10&page=1&sparkline=false",
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCoins(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      console.error("Error fetching CoinGecko data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoinData()
    // Set up auto-refresh every 15 minutes
    const interval = setInterval(fetchCoinData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(8)}`
    }
    return `$${price.toFixed(2)}`
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LetsBonk.fun Ecosystem</h1>
          <p className="text-muted-foreground">Real-time data from CoinGecko API</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</div>
          )}
          <Button onClick={fetchCoinData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <p className="text-sm text-red-500 mt-2">
              Note: This is a demo showing how to integrate with CoinGecko API. In production, you would need to handle
              CORS and rate limiting properly.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && coins.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading ecosystem data...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {coins.map((coin) => (
            <Card key={coin.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{coin.name}</h3>
                        <Badge variant="outline">{coin.symbol.toUpperCase()}</Badge>
                        <Badge variant="secondary">#{coin.market_cap_rank}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Market Cap Rank</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatPrice(coin.current_price)}</div>
                    <div className="flex items-center gap-1">
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`font-medium ${
                          coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-semibold">{formatMarketCap(coin.market_cap)}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Volume (24h)</div>
                    <div className="font-semibold">{formatVolume(coin.total_volume)}</div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://www.coingecko.com/en/coins/${coin.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on CoinGecko
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {coins.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ecosystem data available</p>
              <Button onClick={fetchCoinData} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

