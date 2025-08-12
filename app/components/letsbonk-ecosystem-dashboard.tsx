"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Search,
  ExternalLink,
  Star,
  Activity,
  DollarSign,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

interface Token {
  id: string
  name: string
  symbol: string
  rank: number
  price: number
  change1h: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  logo: string
  description?: string
  website?: string
  twitter?: string
  telegram?: string
}

export function LetsBonkEcosystemDashboard() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Token>("rank")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data for LetsBonk.fun ecosystem tokens
  const mockTokens: Token[] = [
    {
      id: "bonk",
      name: "Bonk",
      symbol: "BONK",
      rank: 1,
      price: 0.00003435,
      change1h: 2.1,
      change24h: 18.6,
      change7d: 45.2,
      volume24h: 45600000,
      marketCap: 2340000000,
      logo: "/placeholder.svg?height=32&width=32&text=BONK",
      description: "The community coin of Solana",
      website: "https://bonkcoin.com",
      twitter: "https://twitter.com/bonk_inu",
    },
    {
      id: "useless-coin",
      name: "Useless",
      symbol: "USELESS",
      rank: 2,
      price: 0.000234,
      change1h: -1.2,
      change24h: 12.4,
      change7d: 23.1,
      volume24h: 1200000,
      marketCap: 45000000,
      logo: "/useless-coin-logo.png",
      description: "A token with utility in DeFi",
      website: "https://uselesscrypto.com",
    },
    {
      id: "ani-grok-companion",
      name: "Ani Grok Companion",
      symbol: "AGC",
      rank: 3,
      price: 0.00156,
      change1h: 0.8,
      change24h: -3.2,
      change7d: 15.7,
      volume24h: 890000,
      marketCap: 23000000,
      logo: "/ani-grok-companion-logo.png",
      description: "AI companion token",
    },
    {
      id: "bucky-token",
      name: "Bucky",
      symbol: "BUCKY",
      rank: 4,
      price: 0.00089,
      change1h: 1.5,
      change24h: 8.9,
      change7d: -2.1,
      volume24h: 567000,
      marketCap: 18500000,
      logo: "/bucky-token-logo.png",
      description: "Community-driven meme token",
    },
    {
      id: "hosico-cat",
      name: "Hosico Cat",
      symbol: "HOSICO",
      rank: 5,
      price: 0.00234,
      change1h: -0.5,
      change24h: 15.3,
      change7d: 28.9,
      volume24h: 1100000,
      marketCap: 16200000,
      logo: "/hosico-cat-logo.png",
      description: "Cat-themed meme token",
    },
    {
      id: "kori-token",
      name: "Kori",
      symbol: "KORI",
      rank: 6,
      price: 0.00067,
      change1h: 2.3,
      change24h: -5.7,
      change7d: 11.4,
      volume24h: 445000,
      marketCap: 12800000,
      logo: "/kori-token-logo.png",
      description: "Gaming ecosystem token",
    },
    {
      id: "rhetor-token",
      name: "Rhetor",
      symbol: "RHETOR",
      rank: 7,
      price: 0.00123,
      change1h: -1.8,
      change24h: 7.2,
      change7d: -8.3,
      volume24h: 320000,
      marketCap: 9500000,
      logo: "/rhetor-token-logo.png",
      description: "Communication platform token",
    },
    {
      id: "momo-token",
      name: "Momo",
      symbol: "MOMO",
      rank: 8,
      price: 0.00045,
      change1h: 0.9,
      change24h: -2.1,
      change7d: 19.6,
      volume24h: 280000,
      marketCap: 7800000,
      logo: "/momo-token-logo.png",
      description: "Social trading token",
    },
    {
      id: "nyla-ai",
      name: "Nyla AI",
      symbol: "NYLA",
      rank: 9,
      price: 0.00198,
      change1h: 1.2,
      change24h: 9.8,
      change7d: -4.5,
      volume24h: 195000,
      marketCap: 6200000,
      logo: "/nyla-ai-logo.png",
      description: "AI-powered analytics token",
    },
    {
      id: "generic-memecoin",
      name: "Generic Memecoin",
      symbol: "GMC",
      rank: 10,
      price: 0.00034,
      change1h: -0.3,
      change24h: 4.7,
      change7d: 12.1,
      volume24h: 150000,
      marketCap: 4500000,
      logo: "/generic-memecoin-logo.png",
      description: "Community meme token",
    },
  ]

  useEffect(() => {
    // Simulate API call
    const fetchTokens = async () => {
      setLoading(true)
      setError(null)

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate occasional API errors
        if (Math.random() < 0.1) {
          throw new Error("Failed to fetch token data")
        }

        setTokens(mockTokens)
        setLastUpdated(new Date())
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()

    // Set up auto-refresh every 15 minutes
    const interval = setInterval(fetchTokens, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  const handleSort = (column: keyof Token) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

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

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCap, 0)
  const totalVolume = tokens.reduce((sum, token) => sum + token.volume24h, 0)
  const avgChange24h = tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading LetsBonk.fun Ecosystem
          </CardTitle>
          <CardDescription>Fetching the latest token data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Error Loading Data
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ecosystem Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">LetsBonk.fun Ecosystem</CardTitle>
              <CardDescription>Top 10 tokens in the LetsBonk.fun ecosystem</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                Live Data
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Ecosystem Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatMarketCap(totalMarketCap)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Market Cap</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatVolume(totalVolume)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Volume</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {avgChange24h >= 0 ? "+" : ""}
                {avgChange24h.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg 24h Change</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tokens.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Tokens</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("rank")}
                  >
                    Rank {sortBy === "rank" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleSort("name")}
                  >
                    Token {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("price")}
                  >
                    Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("change1h")}
                  >
                    1h {sortBy === "change1h" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("change24h")}
                  >
                    24h {sortBy === "change24h" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("change7d")}
                  >
                    7d {sortBy === "change7d" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("volume24h")}
                  >
                    Volume {sortBy === "volume24h" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                    onClick={() => handleSort("marketCap")}
                  >
                    Market Cap {sortBy === "marketCap" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTokens.map((token) => (
                  <Dialog key={token.id}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {token.rank <= 3 && <Star className="w-4 h-4 text-yellow-500" />}
                            <span className="font-medium">#{token.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={token.logo || "/placeholder.svg"}
                              alt={token.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=32&width=32&text=" + token.symbol
                              }}
                            />
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-sm text-gray-500">{token.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatPrice(token.price)}</TableCell>
                        <TableCell className={`text-right ${getChangeColor(token.change1h)}`}>
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(token.change1h)}
                            {token.change1h >= 0 ? "+" : ""}
                            {token.change1h.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${getChangeColor(token.change24h)}`}>
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(token.change24h)}
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${getChangeColor(token.change7d)}`}>
                          <div className="flex items-center justify-end gap-1">
                            {getChangeIcon(token.change7d)}
                            {token.change7d >= 0 ? "+" : ""}
                            {token.change7d.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatVolume(token.volume24h)}</TableCell>
                        <TableCell className="text-right font-mono">{formatMarketCap(token.marketCap)}</TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <img
                            src={token.logo || "/placeholder.svg"}
                            alt={token.name}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=40&width=40&text=" + token.symbol
                            }}
                          />
                          <div>
                            <div className="text-xl">{token.name}</div>
                            <div className="text-sm text-gray-500 font-normal">{token.symbol}</div>
                          </div>
                        </DialogTitle>
                        <DialogDescription>{token.description || "No description available"}</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm text-gray-500">Current Price</div>
                              <div className="text-2xl font-bold">{formatPrice(token.price)}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-500">Market Cap</div>
                              <div className="text-2xl font-bold">{formatMarketCap(token.marketCap)}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-500">24h Volume</div>
                              <div className="text-lg font-semibold">{formatVolume(token.volume24h)}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-500">Ecosystem Rank</div>
                              <div className="text-lg font-semibold">#{token.rank}</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">1h Change</span>
                              <span className={`font-medium ${getChangeColor(token.change1h)}`}>
                                {token.change1h >= 0 ? "+" : ""}
                                {token.change1h.toFixed(2)}%
                              </span>
                            </div>
                            <Progress value={Math.min(100, Math.abs(token.change1h) * 10)} className="h-2" />

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">24h Change</span>
                              <span className={`font-medium ${getChangeColor(token.change24h)}`}>
                                {token.change24h >= 0 ? "+" : ""}
                                {token.change24h.toFixed(2)}%
                              </span>
                            </div>
                            <Progress value={Math.min(100, Math.abs(token.change24h) * 5)} className="h-2" />

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">7d Change</span>
                              <span className={`font-medium ${getChangeColor(token.change7d)}`}>
                                {token.change7d >= 0 ? "+" : ""}
                                {token.change7d.toFixed(2)}%
                              </span>
                            </div>
                            <Progress value={Math.min(100, Math.abs(token.change7d) * 2)} className="h-2" />
                          </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-2">External Links</div>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={`https://www.coingecko.com/en/coins/${token.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    CoinGecko
                                  </a>
                                </Button>
                                {token.website && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={token.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Website
                                    </a>
                                  </Button>
                                )}
                                {token.twitter && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={token.twitter} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Twitter
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500 mb-2">Token Information</div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Symbol:</span>
                                  <span className="font-mono">{token.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Ecosystem Rank:</span>
                                  <span>#{token.rank}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Market Cap Rank:</span>
                                  <span>~#{token.rank + 100}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {sortedTokens.map((token) => (
              <Dialog key={token.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={token.logo || "/placeholder.svg"}
                            alt={token.name}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=40&width=40&text=" + token.symbol
                            }}
                          />
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {token.rank <= 3 && <Star className="w-4 h-4 text-yellow-500" />}#{token.rank}{" "}
                              {token.name}
                            </div>
                            <div className="text-sm text-gray-500">{token.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatPrice(token.price)}</div>
                          <div className={`text-sm ${getChangeColor(token.change24h)}`}>
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Market Cap</div>
                          <div className="font-medium">{formatMarketCap(token.marketCap)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Volume</div>
                          <div className="font-medium">{formatVolume(token.volume24h)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <img
                        src={token.logo || "/placeholder.svg"}
                        alt={token.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=40&width=40&text=" + token.symbol
                        }}
                      />
                      <div>
                        <div className="text-xl">{token.name}</div>
                        <div className="text-sm text-gray-500 font-normal">{token.symbol}</div>
                      </div>
                    </DialogTitle>
                    <DialogDescription>{token.description || "No description available"}</DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">Current Price</div>
                          <div className="text-2xl font-bold">{formatPrice(token.price)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">Market Cap</div>
                          <div className="text-2xl font-bold">{formatMarketCap(token.marketCap)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">24h Volume</div>
                          <div className="text-lg font-semibold">{formatVolume(token.volume24h)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">Ecosystem Rank</div>
                          <div className="text-lg font-semibold">#{token.rank}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">1h Change</span>
                          <span className={`font-medium ${getChangeColor(token.change1h)}`}>
                            {token.change1h >= 0 ? "+" : ""}
                            {token.change1h.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={Math.min(100, Math.abs(token.change1h) * 10)} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">24h Change</span>
                          <span className={`font-medium ${getChangeColor(token.change24h)}`}>
                            {token.change24h >= 0 ? "+" : ""}
                            {token.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={Math.min(100, Math.abs(token.change24h) * 5)} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">7d Change</span>
                          <span className={`font-medium ${getChangeColor(token.change7d)}`}>
                            {token.change7d >= 0 ? "+" : ""}
                            {token.change7d.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={Math.min(100, Math.abs(token.change7d) * 2)} className="h-2" />
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-2">External Links</div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://www.coingecko.com/en/coins/${token.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                CoinGecko
                              </a>
                            </Button>
                            {token.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={token.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Website
                                </a>
                              </Button>
                            )}
                            {token.twitter && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={token.twitter} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Twitter
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-2">Token Information</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Symbol:</span>
                              <span className="font-mono">{token.symbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ecosystem Rank:</span>
                              <span>#{token.rank}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Market Cap Rank:</span>
                              <span>~#{token.rank + 100}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

