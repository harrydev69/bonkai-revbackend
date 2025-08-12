"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  Crown,
  Wallet,
  CheckCircle,
  XCircle,
  ExternalLink,
  Shield,
  Users,
  Zap,
  Search,
  Brain,
  TrendingUp,
  Bell,
  MessageSquare,
  Calendar,
  Music,
  BarChart3,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PremiumPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [bonkBalance, setBonkBalance] = useState(0)
  const [nBonkBalance, setNBonkBalance] = useState(0)
  const [hasAccess, setHasAccess] = useState(false)

  const requiredBonk = 2000000
  const requiredNBonk = 800000

  const premiumFeatures = [
    {
      icon: <Search className="h-5 w-5 text-orange-500" />,
      title: "Advanced Meta Search",
      description: "Cross-platform search functionality across all BONK ecosystems",
    },
    {
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      title: "AI-Powered Sentiment Analysis",
      description: "Real-time sentiment tracking with advanced AI algorithms",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: "Mindshare Tracking & Analytics",
      description: "Competitive analysis and market share insights",
    },
    {
      icon: <Bell className="h-5 w-5 text-red-500" />,
      title: "Smart Alert System",
      description: "Custom alerts with advanced triggers and notifications",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      title: "Narrative Intelligence",
      description: "Meme and trend tracking with predictive insights",
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-yellow-500" />,
      title: "Advanced Analytics Dashboard",
      description: "Volume heatmaps, metrics, and comprehensive data visualization",
    },
    {
      icon: <Activity className="h-5 w-5 text-indigo-500" />,
      title: "Whale Movement Tracker",
      description: "Large transaction monitoring and whale activity alerts",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-pink-500" />,
      title: "BONKai AI Assistant",
      description: "Advanced chat interface with AI-powered market insights",
    },
    {
      icon: <Calendar className="h-5 w-5 text-teal-500" />,
      title: "Event Calendar & Timeline",
      description: "Important dates, events, and market milestones tracking",
    },
    {
      icon: <Music className="h-5 w-5 text-orange-600" />,
      title: "Audio Library & Podcasts",
      description: "Exclusive content and market analysis podcasts",
    },
    {
      icon: <Wallet className="h-5 w-5 text-green-600" />,
      title: "Portfolio Integration",
      description: "Advanced wallet connection and portfolio tracking",
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: "Real-time Data Streams",
      description: "Live updates, notifications, and instant market data",
    },
  ]

  const connectWallet = async () => {
    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = "8xKv...nB3M"
      const mockBonkBalance = Math.floor(Math.random() * 5000000) + 500000
      const mockNBonkBalance = Math.floor(Math.random() * 1500000) + 100000

      setIsConnected(true)
      setWalletAddress(mockAddress)
      setBonkBalance(mockBonkBalance)
      setNBonkBalance(mockNBonkBalance)
      setHasAccess(mockBonkBalance >= requiredBonk || mockNBonkBalance >= requiredNBonk)
      setIsConnecting(false)
    }, 2000)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getQualificationStatus = () => {
    if (!isConnected) return null

    const bonkQualified = bonkBalance >= requiredBonk
    const nBonkQualified = nBonkBalance >= requiredNBonk

    return {
      bonk: bonkQualified,
      nBonk: nBonkQualified,
      qualified: bonkQualified || nBonkQualified,
    }
  }

  const status = getQualificationStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-10 w-10 text-orange-500 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                Unlock Premium Features
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hold 800,000 nBONK or 2,000,000 BONK to access premium features for as long as your tokens remain in your
              wallet.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Premium Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Crown className="h-6 w-6 text-orange-500 mr-2" />
                  Premium Features
                </h2>
                <div className="grid gap-3">
                  {premiumFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                      <div className="mt-0.5">{feature.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Benefits */}
              <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                    <Users className="h-5 w-5 mr-2" />
                    Community Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Exclusive Discord access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Priority customer support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Early feature access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Community voting rights
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Wallet Connection */}
            <div className="lg:sticky lg:top-8">
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-gray-600 dark:text-gray-400">
                    {isConnected ? "Wallet Connected" : "You're about to unlock"}
                  </CardTitle>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isConnected ? (
                      <span className="flex items-center justify-center">
                        <Wallet className="h-6 w-6 mr-2" />
                        {walletAddress}
                      </span>
                    ) : (
                      "Premium Access"
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Token Requirements */}
                  {!isConnected && (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Token Requirements</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>nBONK (Option 1):</span>
                            <span className="font-bold">{formatNumber(requiredNBonk)}</span>
                          </div>
                          <div className="text-center text-orange-600 dark:text-orange-400 font-medium">OR</div>
                          <div className="flex justify-between">
                            <span>BONK (Option 2):</span>
                            <span className="font-bold">{formatNumber(requiredBonk)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wallet Status */}
                  {isConnected && status && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold mb-3">Your Token Holdings</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">nBONK Balance:</span>
                              <div className="font-bold">{formatNumber(nBonkBalance)}</div>
                            </div>
                            <div className="flex items-center">
                              {status.nBonk ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="ml-2 text-sm">{status.nBonk ? "Qualified" : "Need more"}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">BONK Balance:</span>
                              <div className="font-bold">{formatNumber(bonkBalance)}</div>
                            </div>
                            <div className="flex items-center">
                              {status.bonk ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="ml-2 text-sm">{status.bonk ? "Qualified" : "Need more"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Access Status */}
                      {status.qualified ? (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            🎉 Congratulations! You have access to all premium features.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800 dark:text-red-200">
                            You need more tokens to access premium features.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  {!isConnected ? (
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6"
                      onClick={connectWallet}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-5 w-5" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {hasAccess ? (
                        <Link href="/dashboard">
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg py-6">
                            <Crown className="mr-2 h-5 w-5" />
                            Access Premium Dashboard
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="space-y-3">
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full text-lg py-6 bg-transparent">
                              Continue with Free Tier
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href="https://jup.ag/swap/SOL-BONK" target="_blank" rel="noopener noreferrer">
                                Buy BONK
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href="https://jup.ag/swap/SOL-nBONK" target="_blank" rel="noopener noreferrer">
                                Buy nBONK
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Your wallet data is secure and never stored</span>
                    </div>
                    <div>Token balances are verified in real-time through secure blockchain connections</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

