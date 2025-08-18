"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Activity,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useWallet } from "./wallet-provider"

interface TokenHolding {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  allocation: number
}

interface Transaction {
  id: string
  type: "buy" | "sell" | "transfer"
  token: string
  amount: number
  value: number
  timestamp: Date
  txHash: string
}

export function ProfileDashboard() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet, isLoading, portfolioValue } = useWallet()
  const [copied, setCopied] = useState(false)
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    holdingsCount: 0,
  })

  // Mock portfolio data
  const mockHoldings: TokenHolding[] = [
    {
      symbol: "BONK",
      name: "Bonk",
      balance: 1250000,
      value: 42.88,
      change24h: 18.6,
      allocation: 35.2,
    },
    {
      symbol: "SOL",
      name: "Solana",
      balance: 0.85,
      value: 76.5,
      change24h: 5.3,
      allocation: 62.8,
    },
    {
      symbol: "RAY",
      name: "Raydium",
      balance: 12.5,
      value: 30.63,
      change24h: 7.2,
      allocation: 25.1,
    },
    {
      symbol: "SAMO",
      name: "Samoyedcoin",
      balance: 450,
      value: 3.92,
      change24h: -2.3,
      allocation: 3.2,
    },
  ]

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "buy",
      token: "BONK",
      amount: 500000,
      value: 17.15,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      txHash: "5KJp7z2X9vQ8mR3nF4wL6tY8uE2pA7sD9cV1bN4xM8qW",
    },
    {
      id: "2",
      type: "sell",
      token: "RAY",
      amount: 5.2,
      value: 12.74,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      txHash: "3Hp9w5Y7vR2mK8nE6tL4uQ9pB3sF7dC1xV5nM2qA8zW",
    },
    {
      id: "3",
      type: "buy",
      token: "SOL",
      amount: 0.25,
      value: 22.5,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      txHash: "7Lm3x9Z5vT8nR2wE4qY6uI1pC7sG9dF3xV8nK5qB2zX",
    },
  ]

  useEffect(() => {
    if (isConnected) {
      // Calculate portfolio metrics
      const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0)
      const totalPnL = totalValue * 0.156 // Mock 15.6% gain
      const totalPnLPercent = 15.6
      const holdingsCount = mockHoldings.length

      setPortfolioData({
        totalValue,
        totalPnL,
        totalPnLPercent,
        holdingsCount,
      })
    }
  }, [isConnected])

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatTokenAmount = (amount: number, decimals = 2) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(decimals)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(decimals)}K`
    }
    return amount.toFixed(decimals)
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Solana wallet to view your portfolio and track your BONK ecosystem holdings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={connectWallet} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We support Phantom, Solflare, and other Solana wallets
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/images/bonk-dog-avatar.png" />
                <AvatarFallback>
                  <Wallet className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Connected Wallet
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {formatAddress(walletAddress!)}
                  <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 px-2">
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                    <a href={`https://solscan.io/account/${walletAddress}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+{portfolioData.totalPnLPercent.toFixed(2)}%</span>
              <span className="text-muted-foreground">({formatCurrency(portfolioData.totalPnL)})</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioData.holdingsCount}</div>
            <p className="text-sm text-muted-foreground">Different tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+{formatCurrency(8.42)}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+7.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">BONK</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+18.6%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
              <CardDescription>Your current token balances and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHoldings.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{holding.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatTokenAmount(holding.balance)}</div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(holding.value)}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 ${holding.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {holding.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                          {holding.change24h >= 0 ? "+" : ""}
                          {holding.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of your portfolio by token</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockHoldings.map((holding) => (
                  <div key={holding.symbol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{holding.symbol}</span>
                      <span className="text-sm text-muted-foreground">{holding.allocation.toFixed(1)}%</span>
                    </div>
                    <Progress value={holding.allocation} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Return</span>
                  <span className="font-semibold text-green-500">+15.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Performing Asset</span>
                  <span className="font-semibold">BONK (+18.6%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Worst Performing Asset</span>
                  <span className="font-semibold text-red-500">SAMO (-2.3%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Portfolio Diversity</span>
                  <span className="font-semibold">4 tokens</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge variant="secondary">Moderate</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "buy"
                            ? "bg-green-100 text-green-600"
                            : tx.type === "sell"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {tx.type === "buy" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : tx.type === "sell" ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">
                          {tx.type} {tx.token}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tx.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatTokenAmount(tx.amount)} {tx.token}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(tx.value)}</div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`https://solscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

