"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ExternalLink,
  TrendingUp,
  Clock,
  Users,
  Star,
  Filter,
  Flame,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
} from "lucide-react"
import type { BonkData } from "../dashboard/page"
import { toast } from "@/hooks/use-toast"
import { LoadingSkeleton } from "./loading-skeleton"
import { EmptyState } from "./empty-state"

interface MetaSearchDashboardProps {
  bonkData: BonkData
  initialQuery?: string
}

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  source: string
  timestamp: string
  relevance: number
  category: "news" | "analysis" | "social" | "defi" | "nft"
  sentiment: "positive" | "negative" | "neutral"
  engagement: number
  trending?: boolean
  verified?: boolean
  author?: {
    name: string
    verified: boolean
  }
}

// Latest BONK content across all categories
const latestBonkContent: SearchResult[] = [
  // NEWS CATEGORY
  {
    id: "news-1",
    title: "BONK Reaches New All-Time High of $0.000055 as Solana Ecosystem Thrives",
    description:
      "BONK token surges 340% in the past month, driven by increased adoption, new partnerships, and growing utility within the Solana ecosystem. Daily trading volume exceeds $2.1B.",
    url: "https://coindesk.com/bonk-ath-solana-ecosystem-2024",
    source: "CoinDesk",
    timestamp: "2 hours ago",
    relevance: 98,
    category: "news",
    sentiment: "positive",
    engagement: 15420,
    trending: true,
    verified: true,
    author: { name: "Sarah Chen", verified: true },
  },
  {
    id: "news-2",
    title: "Solana Mobile Announces Exclusive BONK Integration for Saga Phone Users",
    description:
      "Solana Mobile reveals comprehensive BONK integration including native wallet support, exclusive airdrops, and mobile-first DeFi features for Saga phone owners.",
    url: "https://solanamobile.com/bonk-saga-integration-2024",
    source: "Solana Mobile",
    timestamp: "4 hours ago",
    relevance: 95,
    category: "news",
    sentiment: "positive",
    engagement: 12890,
    trending: true,
    verified: true,
    author: { name: "Solana Labs", verified: true },
  },
  {
    id: "news-3",
    title: "BONK Community Celebrates Historic 1.5 Million Holder Milestone",
    description:
      "The BONK ecosystem reaches unprecedented growth with 1.5 million unique holders, making it the most distributed memecoin on Solana and demonstrating strong community adoption.",
    url: "https://theblock.co/bonk-1-5-million-holders-milestone",
    source: "The Block",
    timestamp: "8 hours ago",
    relevance: 92,
    category: "news",
    sentiment: "positive",
    engagement: 18750,
    trending: true,
    verified: true,
    author: { name: "BONK Official", verified: true },
  },
  {
    id: "news-4",
    title: "Major CEX Listings: Coinbase and Kraken Add BONK Trading Pairs",
    description:
      "Two major centralized exchanges announce BONK listing with multiple trading pairs including BONK/USD, BONK/BTC, and BONK/ETH, increasing accessibility for retail investors.",
    url: "https://decrypt.co/coinbase-kraken-bonk-listings",
    source: "Decrypt",
    timestamp: "12 hours ago",
    relevance: 89,
    category: "news",
    sentiment: "positive",
    engagement: 14230,
    verified: true,
    author: { name: "Exchange News", verified: true },
  },

  // ANALYSIS CATEGORY
  {
    id: "analysis-1",
    title: "Deep Dive: BONK's Role in Solana's Memecoin Renaissance and Market Dynamics",
    description:
      "Comprehensive analysis of BONK's impact on Solana ecosystem growth, examining tokenomics, community governance, and its position as the flagship Solana memecoin driving retail adoption.",
    url: "https://messari.io/bonk-solana-memecoin-analysis-2024",
    source: "Messari",
    timestamp: "6 hours ago",
    relevance: 96,
    category: "analysis",
    sentiment: "positive",
    engagement: 8930,
    verified: true,
    author: { name: "Messari Research", verified: true },
  },
  {
    id: "analysis-2",
    title: "Technical Analysis: BONK Shows Strong Support at $0.000045 with Bullish Indicators",
    description:
      "Chart analysis reveals BONK maintaining strong support levels with RSI at 65, MACD showing bullish crossover, and volume profile suggesting continued upward momentum through Q1 2024.",
    url: "https://tradingview.com/bonk-technical-analysis-jan-2024",
    source: "TradingView",
    timestamp: "10 hours ago",
    relevance: 87,
    category: "analysis",
    sentiment: "positive",
    engagement: 6750,
    verified: true,
    author: { name: "CryptoAnalyst Pro", verified: true },
  },
  {
    id: "analysis-3",
    title: "On-Chain Metrics: BONK Whale Accumulation Reaches 6-Month High",
    description:
      "Blockchain data shows significant BONK accumulation by whale wallets, with addresses holding 1B+ tokens increasing by 23% in the past week, indicating institutional interest.",
    url: "https://santiment.net/bonk-whale-accumulation-analysis",
    source: "Santiment",
    timestamp: "1 day ago",
    relevance: 84,
    category: "analysis",
    sentiment: "positive",
    engagement: 5420,
    verified: true,
    author: { name: "Santiment Analytics", verified: true },
  },
  {
    id: "analysis-4",
    title: "Market Cap Analysis: BONK's Path to Top 50 Cryptocurrency Rankings",
    description:
      "Financial analysis examining BONK's market capitalization growth trajectory, comparing it to other successful memecoins and projecting potential market cap scenarios for 2024.",
    url: "https://coinmarketcap.com/bonk-market-cap-analysis",
    source: "CoinMarketCap",
    timestamp: "1 day ago",
    relevance: 81,
    category: "analysis",
    sentiment: "positive",
    engagement: 4890,
    verified: true,
    author: { name: "CMC Research", verified: true },
  },

  // SOCIAL CATEGORY
  {
    id: "social-1",
    title: "🚀 BONK Army Trends Worldwide as Community Celebrates ATH Achievement",
    description:
      "The BONK community takes over social media with #BONKtoTheMoon trending globally. Over 50,000 tweets in 24 hours celebrating the new all-time high and ecosystem growth.",
    url: "https://twitter.com/bonk_inu/status/bonk-ath-celebration",
    source: "Twitter",
    timestamp: "3 hours ago",
    relevance: 94,
    category: "social",
    sentiment: "positive",
    engagement: 25670,
    trending: true,
    verified: true,
    author: { name: "BONK Official", verified: true },
  },
  {
    id: "social-2",
    title: "Elon Musk Tweets About BONK: 'Solana's Good Boy Deserves Recognition'",
    description:
      "Tesla CEO Elon Musk acknowledges BONK in a tweet, calling it 'Solana's good boy' and praising the community-driven approach. Tweet receives 2.3M views in first hour.",
    url: "https://twitter.com/elonmusk/status/bonk-good-boy-tweet",
    source: "Twitter",
    timestamp: "5 hours ago",
    relevance: 99,
    category: "social",
    sentiment: "positive",
    engagement: 89420,
    trending: true,
    verified: true,
    author: { name: "Elon Musk", verified: true },
  },
  {
    id: "social-3",
    title: "BONK Community Organizes Global Meetups in 25+ Cities Worldwide",
    description:
      "The BONK community announces simultaneous meetups across major cities including NYC, London, Tokyo, and Sydney to celebrate recent milestones and discuss ecosystem development.",
    url: "https://reddit.com/r/bonk/bonk-global-meetups-announcement",
    source: "Reddit",
    timestamp: "7 hours ago",
    relevance: 86,
    category: "social",
    sentiment: "positive",
    engagement: 12340,
    trending: true,
    author: { name: "BONK Community", verified: false },
  },
  {
    id: "social-4",
    title: "TikTok BONK Challenge Goes Viral with 10M+ Views and Celebrity Participation",
    description:
      "The #BONKChallenge on TikTok reaches 10 million views as celebrities and influencers join the trend, creating content about Solana and BONK ecosystem features.",
    url: "https://tiktok.com/@bonkofficial/bonk-challenge-viral",
    source: "TikTok",
    timestamp: "9 hours ago",
    relevance: 88,
    category: "social",
    sentiment: "positive",
    engagement: 34560,
    trending: true,
    author: { name: "BONK TikTok", verified: true },
  },

  // DEFI CATEGORY
  {
    id: "defi-1",
    title: "Jupiter DEX Integrates BONK as Primary Trading Pair with Zero Fees",
    description:
      "Jupiter, Solana's leading DEX aggregator, announces BONK integration as a primary trading pair with zero fees for BONK holders, improving liquidity and reducing trading costs.",
    url: "https://jup.ag/bonk-integration-zero-fees",
    source: "Jupiter",
    timestamp: "4 hours ago",
    relevance: 93,
    category: "defi",
    sentiment: "positive",
    engagement: 11230,
    verified: true,
    author: { name: "Jupiter Team", verified: true },
  },
  {
    id: "defi-2",
    title: "Orca Launches BONK-SOL Liquidity Pool with 150% APY Rewards",
    description:
      "Orca DEX introduces high-yield BONK-SOL liquidity pool offering 150% APY in BONK rewards, attracting over $50M in total value locked within first 24 hours.",
    url: "https://orca.so/bonk-sol-liquidity-pool-launch",
    source: "Orca",
    timestamp: "6 hours ago",
    relevance: 90,
    category: "defi",
    sentiment: "positive",
    engagement: 9870,
    verified: true,
    author: { name: "Orca Protocol", verified: true },
  },
  {
    id: "defi-3",
    title: "Marinade Finance Adds BONK Staking with Liquid Staking Derivatives",
    description:
      "Marinade Finance expands to include BONK staking services, offering liquid staking derivatives (mBONK) that allow users to earn staking rewards while maintaining liquidity.",
    url: "https://marinade.finance/bonk-liquid-staking-launch",
    source: "Marinade Finance",
    timestamp: "8 hours ago",
    relevance: 85,
    category: "defi",
    sentiment: "positive",
    engagement: 7650,
    verified: true,
    author: { name: "Marinade Team", verified: true },
  },
  {
    id: "defi-4",
    title: "Raydium Introduces BONK Yield Farming with Multi-Token Rewards",
    description:
      "Raydium launches innovative BONK yield farming pools offering rewards in multiple tokens including RAY, USDC, and additional BONK, with farms achieving 200%+ APY.",
    url: "https://raydium.io/bonk-yield-farming-multi-rewards",
    source: "Raydium",
    timestamp: "10 hours ago",
    relevance: 82,
    category: "defi",
    sentiment: "positive",
    engagement: 6890,
    verified: true,
    author: { name: "Raydium Protocol", verified: true },
  },

  // NFT CATEGORY
  {
    id: "nft-1",
    title: "Official BONK NFT Collection 'Bonk Buddies' Launches on Magic Eden",
    description:
      "The highly anticipated Bonk Buddies NFT collection launches with 10,000 unique pieces, offering holders exclusive BONK staking rewards, governance rights, and ecosystem access.",
    url: "https://magiceden.io/bonk-buddies-official-collection",
    source: "Magic Eden",
    timestamp: "5 hours ago",
    relevance: 91,
    category: "nft",
    sentiment: "positive",
    engagement: 13450,
    trending: true,
    verified: true,
    author: { name: "BONK NFT Team", verified: true },
  },
  {
    id: "nft-2",
    title: "BONK x Solana Monkey Business Collaboration Creates Limited Edition NFTs",
    description:
      "Exclusive collaboration between BONK and Solana Monkey Business produces 500 limited edition NFTs, combining iconic SMB traits with BONK branding and utility features.",
    url: "https://solanart.io/bonk-smb-collaboration-nfts",
    source: "Solanart",
    timestamp: "7 hours ago",
    relevance: 87,
    category: "nft",
    sentiment: "positive",
    engagement: 8920,
    verified: true,
    author: { name: "SMB x BONK", verified: true },
  },
  {
    id: "nft-3",
    title: "BONK Gaming NFTs Launch with Play-to-Earn Mechanics on Solana",
    description:
      "New BONK-themed gaming NFTs introduce play-to-earn mechanics, allowing players to earn BONK tokens through gameplay while building a sustainable gaming ecosystem.",
    url: "https://tensor.trade/bonk-gaming-nfts-p2e",
    source: "Tensor",
    timestamp: "11 hours ago",
    relevance: 83,
    category: "nft",
    sentiment: "positive",
    engagement: 6750,
    verified: true,
    author: { name: "BONK Gaming", verified: false },
  },
  {
    id: "nft-4",
    title: "Celebrity Artist Creates BONK-Inspired Digital Art Series for Charity",
    description:
      "Renowned digital artist Beeple creates exclusive BONK-inspired artwork series, with proceeds benefiting animal shelters worldwide, combining art, crypto, and social impact.",
    url: "https://foundation.app/beeple-bonk-charity-collection",
    source: "Foundation",
    timestamp: "1 day ago",
    relevance: 89,
    category: "nft",
    sentiment: "positive",
    engagement: 15670,
    trending: true,
    verified: true,
    author: { name: "Beeple", verified: true },
  },
]

export function MetaSearchDashboard({ bonkData, initialQuery = "" }: MetaSearchDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchResults, setSearchResults] = useState<SearchResult[]>(latestBonkContent)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"relevance" | "timestamp" | "engagement">("relevance")

  // Update search query when initialQuery changes (from top navigation)
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const filteredResults =
    activeFilter === "all" ? searchResults : searchResults.filter((result) => result.category === activeFilter)

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "timestamp":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case "engagement":
        return b.engagement - a.engagement
      case "relevance":
      default:
        return b.relevance - a.relevance
    }
  })

  const getCategoryColor = (category: SearchResult["category"]) => {
    switch (category) {
      case "news":
        return "bg-blue-500"
      case "analysis":
        return "bg-purple-500"
      case "social":
        return "bg-green-500"
      case "defi":
        return "bg-orange-500"
      case "nft":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentBadge = (sentiment: SearchResult["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      case "neutral":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) {
      setSearchResults(latestBonkContent)
      return
    }

    setLoading(true)
    try {
      // Simulate API call with filtered results
      await new Promise((resolve) => setTimeout(resolve, 800))

      const filtered = latestBonkContent.filter(
        (result) =>
          result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      setSearchResults(filtered)

      toast({
        title: "Search Complete",
        description: `Found ${filtered.length} results for "${searchTerm}"`,
      })
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search Failed",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const formatTimestamp = (timestamp: string) => {
    // Convert relative timestamps to more specific format
    const timeMap: { [key: string]: string } = {
      "2 hours ago": "2h",
      "3 hours ago": "3h",
      "4 hours ago": "4h",
      "5 hours ago": "5h",
      "6 hours ago": "6h",
      "7 hours ago": "7h",
      "8 hours ago": "8h",
      "9 hours ago": "9h",
      "10 hours ago": "10h",
      "11 hours ago": "11h",
      "12 hours ago": "12h",
      "1 day ago": "1d",
      "2 days ago": "2d",
    }
    return timeMap[timestamp] || timestamp
  }

  const formatEngagement = (engagement: number) => {
    if (engagement >= 1000000) return `${(engagement / 1000000).toFixed(1)}M`
    if (engagement >= 1000) return `${(engagement / 1000).toFixed(1)}K`
    return engagement.toString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meta Search</h1>
        <p className="text-muted-foreground">Search across multiple platforms for BONK and Solana ecosystem content</p>
      </div>

      {/* Enhanced Search Interface */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for BONK news, analysis, discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "relevance", label: "Relevance" },
                  { value: "timestamp", label: "Latest" },
                  { value: "engagement", label: "Popular" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                    className={sortBy === option.value ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced Search Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedResults.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Relevance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedResults.length > 0
                ? Math.round(sortedResults.reduce((sum, result) => sum + result.relevance, 0) / sortedResults.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Content quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEngagement(sortedResults.reduce((sum, result) => sum + result.engagement, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Likes, shares, comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {sortedResults.length > 0
                ? Math.round(
                    (sortedResults.filter((r) => r.sentiment === "positive").length / sortedResults.length) * 100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Of all results</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search Results */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="nft">NFT</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <TabsContent value={activeFilter} className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : sortedResults.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {sortedResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-all duration-200 hover:border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(result.category)} mt-2 flex-shrink-0`} />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg hover:text-orange-600 cursor-pointer line-clamp-2">
                                {result.title}
                              </h3>
                              {result.trending && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                                  <Flame className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              {result.verified && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="font-medium">{result.source}</span>
                              {result.author && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <span>{result.author.name}</span>
                                    {result.author.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                                  </div>
                                </>
                              )}
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(result.timestamp)}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {result.relevance}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="capitalize">
                              {result.category}
                            </Badge>
                            <Badge variant={getSentimentBadge(result.sentiment)}>{result.sentiment}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {formatEngagement(Math.floor(result.engagement * 0.6))}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {formatEngagement(Math.floor(result.engagement * 0.2))}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              {formatEngagement(Math.floor(result.engagement * 0.2))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild className="flex-shrink-0 bg-transparent">
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Source
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Load More Button */}
      {sortedResults.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" className="w-full sm:w-auto bg-transparent">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  )
}

