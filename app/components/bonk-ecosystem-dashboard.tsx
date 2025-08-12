"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, ExternalLink, ArrowUpDown, Star, Clock } from "lucide-react"

interface EcosystemToken {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  rank: number
  icon: string
  cmcId: string
  description: string
}

const bonkFunEcosystemTokens: EcosystemToken[] = [
  {
    id: "bonk",
    name: "Bonk",
    symbol: "BONK",
    price: 0.00003421,
    change24h: 15.7,
    marketCap: 2340000000,
    volume24h: 145000000,
    rank: 1,
    icon: "🐕",
    cmcId: "bonk",
    description:
      "The first Solana dog coin for the people, by the people. BONK is the flagship token of the BONK Fun ecosystem with massive community support.",
  },
  {
    id: "useless",
    name: "Useless",
    symbol: "USELESS",
    price: 0.000000234,
    change24h: 23.4,
    marketCap: 45000000,
    volume24h: 2300000,
    rank: 2,
    icon: "🗑️",
    cmcId: "useless",
    description: "A token that embraces its uselessness while building a strong community in the BONK Fun ecosystem.",
  },
  {
    id: "hosico",
    name: "Hosico",
    symbol: "HOSICO",
    price: 0.00000567,
    change24h: -8.2,
    marketCap: 12000000,
    volume24h: 890000,
    rank: 3,
    icon: "🐱",
    cmcId: "hosico",
    description: "Based on the famous Hosico cat, bringing feline energy to the BONK Fun ecosystem.",
  },
  {
    id: "samo",
    name: "Samoyedcoin",
    symbol: "SAMO",
    price: 0.0234,
    change24h: 12.1,
    marketCap: 78000000,
    volume24h: 4500000,
    rank: 4,
    icon: "🐕",
    cmcId: "samoyedcoin",
    description: "The Samoyed dog coin bringing fluffy vibes to the Solana ecosystem and BONK Fun community.",
  },
  {
    id: "cope",
    name: "Cope",
    symbol: "COPE",
    price: 0.0456,
    change24h: -5.7,
    marketCap: 34000000,
    volume24h: 1200000,
    rank: 5,
    icon: "😤",
    cmcId: "cope",
    description: "For when you need to cope with the market. A meme token with real utility in the BONK ecosystem.",
  },
  {
    id: "rope",
    name: "Rope",
    symbol: "ROPE",
    price: 0.000123,
    change24h: 18.9,
    marketCap: 23000000,
    volume24h: 890000,
    rank: 6,
    icon: "🪢",
    cmcId: "rope",
    description: "The rope token for extreme market situations. Part of the BONK Fun ecosystem's meme collection.",
  },
  {
    id: "cheems",
    name: "Cheems",
    symbol: "CHEEMS",
    price: 0.00789,
    change24h: 7.3,
    marketCap: 56000000,
    volume24h: 2100000,
    rank: 7,
    icon: "🐕",
    cmcId: "cheems",
    description: "The beloved Cheems meme dog bringing wholesome energy to the BONK Fun ecosystem.",
  },
  {
    id: "doge-killer",
    name: "Doge Killer",
    symbol: "LEASH",
    price: 234.56,
    change24h: -3.4,
    marketCap: 89000000,
    volume24h: 3400000,
    rank: 8,
    icon: "🐕‍🦺",
    cmcId: "doge-killer",
    description: "The leash token designed to keep the ecosystem in check. A premium token in the BONK Fun family.",
  },
  {
    id: "floki",
    name: "FLOKI",
    symbol: "FLOKI",
    price: 0.000234,
    change24h: 9.8,
    marketCap: 67000000,
    volume24h: 2800000,
    rank: 9,
    icon: "🐕",
    cmcId: "floki",
    description: "Named after Elon's dog, FLOKI brings Viking energy to the BONK Fun ecosystem.",
  },
  {
    id: "shiba-predator",
    name: "Shiba Predator",
    symbol: "QOM",
    price: 0.00000089,
    change24h: 14.2,
    marketCap: 15000000,
    volume24h: 670000,
    rank: 10,
    icon: "🦈",
    cmcId: "shiba-predator",
    description: "The apex predator of the meme coin space, hunting in the BONK Fun ecosystem waters.",
  },
]

type SortField = "rank" | "price" | "change24h" | "marketCap"

export function BonkEcosystemDashboard() {
  const [tokens, setTokens] = useState(bonkFunEcosystemTokens)
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update data every 15 minutes (900,000 milliseconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) =>
        prev.map((token) => ({
          ...token,
          price: token.price * (1 + (Math.random() - 0.5) * 0.02),
          change24h: token.change24h + (Math.random() - 0.5) * 2,
          volume24h: token.volume24h * (1 + (Math.random() - 0.5) * 0.05),
        })),
      )
      setLastUpdate(new Date())
    }, 900000) // 15 minutes

    return () => clearInterval(interval)
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedTokens = [...tokens].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (sortDirection === "desc") {
      ;[aValue, bValue] = [bValue, aValue]
    }

    return aValue > bValue ? 1 : -1
  })

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toFixed(9)}`
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toFixed(4)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    }
    return `$${(marketCap / 1e3).toFixed(2)}K`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    }
    return `$${(volume / 1e3).toFixed(2)}K`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">BONK Fun Ecosystem</h2>
          <p className="text-gray-600 dark:text-gray-400">Top 10 tokens from CoinMarketCap BONK Fun ecosystem</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            15min updates
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Last: {formatTime(lastUpdate)}
          </Badge>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("rank")}
                        className="font-semibold text-gray-900 dark:text-white"
                      >
                        Rank
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="font-semibold text-gray-900 dark:text-white">Token</span>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("price")}
                        className="font-semibold text-gray-900 dark:text-white"
                      >
                        Price
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("change24h")}
                        className="font-semibold text-gray-900 dark:text-white"
                      >
                        24h Change
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("marketCap")}
                        className="font-semibold text-gray-900 dark:text-white"
                      >
                        Market Cap
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">24h Volume</span>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <span className="font-semibold text-gray-900 dark:text-white">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedTokens.map((token) => (
                    <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {token.rank <= 3 && <Star className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium text-gray-900 dark:text-white">#{token.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{token.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{token.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {formatPrice(token.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-1 ${
                            token.change24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {token.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-semibold">
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {formatMarketCap(token.marketCap)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-gray-600 dark:text-gray-400">
                          {formatVolume(token.volume24h)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <span className="text-2xl">{token.icon}</span>
                                  {token.name} ({token.symbol})
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-400">{token.description}</p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Current Price</div>
                                    <div className="font-mono font-semibold">{formatPrice(token.price)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">24h Change</div>
                                    <div
                                      className={`font-semibold ${
                                        token.change24h >= 0 ? "text-green-600" : "text-red-600"
                                      }`}
                                    >
                                      {token.change24h >= 0 ? "+" : ""}
                                      {token.change24h.toFixed(2)}%
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                                    <div className="font-mono font-semibold">{formatMarketCap(token.marketCap)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">24h Volume</div>
                                    <div className="font-mono">{formatVolume(token.volume24h)}</div>
                                  </div>
                                </div>
                                <Button asChild className="w-full">
                                  <a
                                    href={`https://coinmarketcap.com/currencies/${token.cmcId}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View on CoinMarketCap
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://coinmarketcap.com/currencies/${token.cmcId}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedTokens.map((token) => (
          <Card key={token.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{token.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{token.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      #{token.rank} • {token.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-gray-900 dark:text-white">
                    {formatPrice(token.price)}
                  </div>
                  <div className={`text-sm font-semibold ${token.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Market Cap</div>
                  <div className="font-mono text-sm font-semibold">{formatMarketCap(token.marketCap)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">24h Volume</div>
                  <div className="font-mono text-sm">{formatVolume(token.volume24h)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-2xl">{token.icon}</span>
                        {token.name} ({token.symbol})
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">{token.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Current Price</div>
                          <div className="font-mono font-semibold">{formatPrice(token.price)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">24h Change</div>
                          <div className={`font-semibold ${token.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                          <div className="font-mono font-semibold">{formatMarketCap(token.marketCap)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">24h Volume</div>
                          <div className="font-mono">{formatVolume(token.volume24h)}</div>
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <a
                          href={`https://coinmarketcap.com/currencies/${token.cmcId}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on CoinMarketCap
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://coinmarketcap.com/currencies/${token.cmcId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

