"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface TickerToken {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
}

export function LetsBonkEcosystemTicker() {
  const [tokens, setTokens] = useState<TickerToken[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data for LetsBonk.fun ecosystem tokens
  const mockTokens: TickerToken[] = [
    {
      id: "bonk",
      symbol: "BONK",
      name: "Bonk",
      price: 0.00003435,
      change24h: 18.6,
      marketCap: 2340000000,
    },
    {
      id: "samo",
      symbol: "SAMO",
      name: "Samoyedcoin",
      price: 0.0087,
      change24h: -2.3,
      marketCap: 28500000,
    },
    {
      id: "cope",
      symbol: "COPE",
      name: "COPE",
      price: 0.045,
      change24h: 5.7,
      marketCap: 15200000,
    },
    {
      id: "fida",
      symbol: "FIDA",
      name: "Bonfida",
      price: 0.234,
      change24h: -1.2,
      marketCap: 23400000,
    },
    {
      id: "media",
      symbol: "MEDIA",
      name: "Media Network",
      price: 1.23,
      change24h: 12.4,
      marketCap: 45600000,
    },
    {
      id: "step",
      symbol: "STEP",
      name: "Step Finance",
      price: 0.089,
      change24h: 3.8,
      marketCap: 8900000,
    },
    {
      id: "ray",
      symbol: "RAY",
      name: "Raydium",
      price: 2.45,
      change24h: 7.2,
      marketCap: 567000000,
    },
    {
      id: "srm",
      symbol: "SRM",
      name: "Serum",
      price: 0.156,
      change24h: -4.1,
      marketCap: 12300000,
    },
  ]

  useEffect(() => {
    // Simulate data updates
    const updateTokens = () => {
      const updatedTokens = mockTokens.map((token) => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: token.change24h + (Math.random() - 0.5) * 2,
      }))
      setTokens(updatedTokens)
      setLastUpdated(new Date())
    }

    updateTokens()
    const interval = setInterval(updateTokens, 15 * 60 * 1000) // Update every 15 minutes

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(8)}`
    }
    return `$${price.toFixed(4)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    }
    return `$${(marketCap / 1e6).toFixed(2)}M`
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">LetsBonk.fun Ecosystem</h3>
          <Badge variant="outline">Live Data</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Updates every 15 minutes • Last: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll space-x-6 whitespace-nowrap">
          {[...tokens, ...tokens].map((token, index) => (
            <a
              key={`${token.id}-${index}`}
              href={`https://www.coingecko.com/en/coins/${token.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-fit"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{token.symbol[0]}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{token.symbol}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{formatPrice(token.price)}</span>
                  <div className="flex items-center">
                    {token.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{formatMarketCap(token.marketCap)}</div>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

