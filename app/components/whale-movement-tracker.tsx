"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Activity,
  AlertTriangle,
} from "lucide-react"
import type { BonkData } from "../page"

interface WhaleTransaction {
  id: string
  type: "buy" | "sell" | "transfer"
  amount: number
  usdValue: number
  wallet: string
  timestamp: string
  exchange?: string
  impact: "high" | "medium" | "low"
  priceChange: number
}

interface WhaleMovementTrackerProps {
  bonkData: BonkData
}

export function WhaleMovementTracker({ bonkData }: WhaleMovementTrackerProps) {
  const [timeframe, setTimeframe] = useState("24h")
  const [transactionType, setTransactionType] = useState("all")
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([])

  useEffect(() => {
    generateWhaleData()
  }, [timeframe, transactionType])

  const generateWhaleData = () => {
    // Generate mock whale transaction data
    const transactions: WhaleTransaction[] = []
    const transactionCount = timeframe === "24h" ? 15 : timeframe === "7d" ? 50 : 150

    const exchanges = ["Raydium", "Jupiter", "Orca", "Unknown DEX", "Binance", "OKX"]
    const walletPrefixes = ["7xKX", "9mNQ", "4vBz", "2hGt", "8kLp", "6nRx", "3dFw", "5cMy"]

    for (let i = 0; i < transactionCount; i++) {
      const type = Math.random() > 0.5 ? "buy" : Math.random() > 0.3 ? "sell" : "transfer"
      const amount = Math.floor(Math.random() * 50000000000) + 1000000000 // 1B to 50B BONK
      const usdValue = amount * bonkData.price
      const impact = usdValue > 100000 ? "high" : usdValue > 50000 ? "medium" : "low"
      const priceChange = (Math.random() - 0.5) * 10 // -5% to +5%

      const hoursAgo = Math.floor(Math.random() * (timeframe === "24h" ? 24 : timeframe === "7d" ? 168 : 720))
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toLocaleString()

      transactions.push({
        id: `tx_${i}`,
        type: type as "buy" | "sell" | "transfer",
        amount,
        usdValue,
        wallet: `${walletPrefixes[Math.floor(Math.random() * walletPrefixes.length)]}...${Math.random().toString(36).substr(2, 4)}`,
        timestamp,
        exchange: type !== "transfer" ? exchanges[Math.floor(Math.random() * exchanges.length)] : undefined,
        impact: impact as "high" | "medium" | "low",
        priceChange,
      })
    }

    // Filter by transaction type
    const filteredTransactions =
      transactionType === "all" ? transactions : transactions.filter((tx) => tx.type === transactionType)

    // Sort by USD value (largest first)
    setWhaleTransactions(filteredTransactions.sort((a, b) => b.usdValue - a.usdValue))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return ArrowUpRight
      case "sell":
        return ArrowDownLeft
      default:
        return Activity
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "buy":
        return "text-green-500"
      case "sell":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  const getTransactionBg = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-100 dark:bg-green-900/20"
      case "sell":
        return "bg-red-100 dark:bg-red-900/20"
      default:
        return "bg-blue-100 dark:bg-blue-900/20"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const totalVolume = whaleTransactions.reduce((sum, tx) => sum + tx.usdValue, 0)
  const buyVolume = whaleTransactions.filter((tx) => tx.type === "buy").reduce((sum, tx) => sum + tx.usdValue, 0)
  const sellVolume = whaleTransactions.filter((tx) => tx.type === "sell").reduce((sum, tx) => sum + tx.usdValue, 0)
  const netFlow = buyVolume - sellVolume

  const topTransactions = whaleTransactions.slice(0, 10)
  const highImpactTxs = whaleTransactions.filter((tx) => tx.impact === "high").length

  return (
    <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Whale Movement Tracker</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor large BONK transactions and their market impact
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buys Only</SelectItem>
                <SelectItem value="sell">Sells Only</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
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
              Live Tracking
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Whale Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Wallet className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ${(totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">${(buyVolume / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Buy Volume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-500">${(sellVolume / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sell Volume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">{highImpactTxs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">High Impact</div>
          </div>
        </div>

        {/* Net Flow Indicator */}
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Net Whale Flow</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {netFlow >= 0 ? "Net inflow indicates accumulation" : "Net outflow indicates distribution"}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${netFlow >= 0 ? "text-green-500" : "text-red-500"}`}>
                {netFlow >= 0 ? "+" : ""}${(netFlow / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-500">{netFlow >= 0 ? "Bullish Signal" : "Bearish Signal"}</div>
            </div>
          </div>
        </div>

        {/* Recent Whale Transactions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent Large Transactions</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topTransactions.map((tx) => {
              const TransactionIcon = getTransactionIcon(tx.type)
              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getTransactionBg(tx.type)} hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full ${getTransactionBg(tx.type)} flex items-center justify-center`}
                    >
                      <TransactionIcon className={`w-5 h-5 ${getTransactionColor(tx.type)}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{tx.type}</span>
                        <Badge className={`${getImpactColor(tx.impact)} text-white text-xs`}>{tx.impact} impact</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tx.wallet} • {tx.exchange || "Direct Transfer"}
                      </div>
                      <div className="text-xs text-gray-500">{tx.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${(tx.usdValue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {(tx.amount / 1000000000).toFixed(1)}B BONK
                    </div>
                    <div className={`text-xs font-medium ${tx.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.priceChange >= 0 ? "+" : ""}
                      {tx.priceChange.toFixed(2)}% impact
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Whale Analysis */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-4 text-purple-700 dark:text-purple-400">Whale Activity Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Market Impact</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {highImpactTxs} high-impact transactions detected</li>
                <li>• Average transaction size: ${(totalVolume / whaleTransactions.length / 1000).toFixed(0)}K</li>
                <li>• {netFlow >= 0 ? "Accumulation" : "Distribution"} phase indicated</li>
                <li>• Price correlation: {Math.abs((netFlow / totalVolume) * 100).toFixed(1)}%</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Trading Patterns</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Most active exchange: Raydium (DEX)</li>
                <li>
                  • Peak activity: {Math.floor(Math.random() * 12) + 1}:00 - {Math.floor(Math.random() * 12) + 13}:00
                  UTC
                </li>
                <li>• Whale count: ~{Math.floor(whaleTransactions.length * 0.3)} unique wallets</li>
                <li>• Average hold time: {Math.floor(Math.random() * 30) + 5} days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" className="text-sm bg-transparent">
            Export Whale Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

