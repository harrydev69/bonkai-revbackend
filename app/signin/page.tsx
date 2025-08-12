"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Wallet, CheckCircle, XCircle, Shield, Crown, ArrowLeft, HelpCircle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInPage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [bonkBalance, setBonkBalance] = useState(0)
  const [nBonkBalance, setNBonkBalance] = useState(0)
  const [hasAccess, setHasAccess] = useState(false)
  const [showRejection, setShowRejection] = useState(false)

  const requiredBonk = 2000000
  const requiredNBonk = 800000

  const connectWallet = async () => {
    setIsConnecting(true)
    setShowRejection(false)

    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = "8xKv...nB3M"
      const mockBonkBalance = Math.floor(Math.random() * 5000000) + 500000
      const mockNBonkBalance = Math.floor(Math.random() * 1500000) + 100000

      setIsConnected(true)
      setWalletAddress(mockAddress)
      setBonkBalance(mockBonkBalance)
      setNBonkBalance(mockNBonkBalance)

      const qualified = mockBonkBalance >= requiredBonk || mockNBonkBalance >= requiredNBonk
      setHasAccess(qualified)

      if (qualified) {
        // Auto-redirect to dashboard after successful verification
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setShowRejection(true)
      }

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
        <div className="max-w-2xl mx-auto">
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
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                Sign In to BONKai
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect your wallet to verify your BONK or nBONK holdings and access the platform
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {isConnected
                  ? "Verifying your token holdings..."
                  : "We'll check your BONK/nBONK balance to grant access"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Requirements */}
              {!isConnected && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-4">Required Holdings</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">nBONK (Option 1):</span>
                        <span className="font-bold text-orange-600">{formatNumber(requiredNBonk)}</span>
                      </div>
                      <div className="text-center text-orange-600 dark:text-orange-400 font-medium py-2">OR</div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">BONK (Option 2):</span>
                        <span className="font-bold text-orange-600">{formatNumber(requiredBonk)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Status */}
              {isConnected && status && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Wallet: {walletAddress}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">nBONK Balance:</span>
                          <div className="font-bold text-lg">{formatNumber(nBonkBalance)}</div>
                        </div>
                        <div className="flex items-center">
                          {status.nBonk ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                          <span className="ml-2 font-medium">{status.nBonk ? "✓ Qualified" : "✗ Insufficient"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">BONK Balance:</span>
                          <div className="font-bold text-lg">{formatNumber(bonkBalance)}</div>
                        </div>
                        <div className="flex items-center">
                          {status.bonk ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                          <span className="ml-2 font-medium">{status.bonk ? "✓ Qualified" : "✗ Insufficient"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Access Status */}
                  {status.qualified ? (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        🎉 Access Granted! Redirecting to dashboard...
                      </AlertDescription>
                    </Alert>
                  ) : (
                    showRejection && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          ❌ Access Denied: Insufficient token holdings. You need at least {formatNumber(requiredNBonk)}{" "}
                          nBONK or {formatNumber(requiredBonk)} BONK.
                        </AlertDescription>
                      </Alert>
                    )
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!isConnected ? (
                <div className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Connecting & Verifying...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect Wallet to Sign In
                      </>
                    )}
                  </Button>

                  {/* Help Links */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <Link href="/faq">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        FAQ
                      </Button>
                    </Link>
                    <Link href="/dashboard?tour=true">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Take a Tour
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {hasAccess ? (
                    <div className="text-center">
                      <div className="animate-pulse">
                        <Crown className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          Welcome to BONKai Premium!
                        </p>
                      </div>
                    </div>
                  ) : (
                    showRejection && (
                      <div className="space-y-3">
                        <Link href="/premium">
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg py-6">
                            <Crown className="mr-2 h-5 w-5" />
                            Learn About Premium
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full text-lg py-6 bg-transparent">
                            Continue with Limited Access
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Security Notice */}
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center space-y-2 pt-4 border-t">
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
  )
}

