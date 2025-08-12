"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { dataService } from "../services/data-service"
import { useCallback } from "react"
import { toast } from "@/hooks/use-toast"

interface WalletContextType {
  isConnected: boolean
  walletAddress: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isLoading: boolean
  balance: number
  portfolioValue: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [portfolioValue, setPortfolioValue] = useState(0)

  // Check for existing connection on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    const savedConnection = localStorage.getItem("walletConnected")
    if (savedAddress && savedConnection === 'true') {
      setWalletAddress(savedAddress)
      setIsConnected(true)
      // Retrieve latest balances from backend. Fallback to local storage values
      ;(async () => {
        try {
          const res = await fetch(`/api/solana/balance?wallet=${savedAddress}`)
          if (res.ok) {
            const data = await res.json()
            setBalance(data.sol)
            setPortfolioValue(data.sol)
          } else {
            // Use persisted numbers if available
            const savedBalance = localStorage.getItem('walletBalance')
            const savedPortfolio = localStorage.getItem('portfolioValue')
            setBalance(savedBalance ? Number.parseFloat(savedBalance) : 0)
            setPortfolioValue(savedPortfolio ? Number.parseFloat(savedPortfolio) : 0)
          }
        } catch {
          const savedBalance = localStorage.getItem('walletBalance')
          const savedPortfolio = localStorage.getItem('portfolioValue')
          setBalance(savedBalance ? Number.parseFloat(savedBalance) : 0)
          setPortfolioValue(savedPortfolio ? Number.parseFloat(savedPortfolio) : 0)
        }
      })()
    }
  }, [])

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      let address: string | undefined = undefined
      // Prefer using a Solana wallet if available (e.g. Phantom). The
      // `window.solana` API is injected by most wallet extensions. The
      // connect() method returns a publicKey when the user approves the
      // connection.
      const anyWindow = window as any
      if (anyWindow?.solana?.isPhantom) {
        const response = await anyWindow.solana.connect()
        address = response.publicKey?.toString()
      }
      // If no wallet extension is found fall back to the mock service
      if (!address) {
        const walletData = await dataService.connectWallet()
        address = walletData.address
        setBalance(walletData.balance)
        setPortfolioValue(walletData.portfolioValue)
      }
      if (!address) throw new Error('No wallet address obtained')
      // Persist connection in localStorage for reload persistence
      localStorage.setItem('walletAddress', address)
      localStorage.setItem('walletConnected', 'true')
      // Send the address to the backend to create a session token
      const res = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      })
      if (!res.ok) {
          throw new Error('Server responded with ' + res.status)
      }
      const json = await res.json()
      // Optionally update premium flag or user info here
      setWalletAddress(address)
      setIsConnected(true)
      // Fetch latest balance from Solana RPC for display
      try {
        const balRes = await fetch(`/api/solana/balance?wallet=${address}`)
        if (balRes.ok) {
          const balJson = await balRes.json()
          setBalance(balJson.sol)
          setPortfolioValue(balJson.sol) // For now portfolioValue == SOL; extend to tokens later
        }
      } catch {}
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: 'Connection Failed',
        description: error?.message || 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const anyWindow = window as any
      // Disconnect from injected wallet if present
      if (anyWindow?.solana?.isConnected) {
        try {
          await anyWindow.solana.disconnect()
        } catch {}
      }
      // Tell backend to clear session token
      await fetch('/api/auth/disconnect', { method: 'DELETE' })
      setWalletAddress(null)
      setIsConnected(false)
      setBalance(0)
      setPortfolioValue(0)
      // Clear persisted connection
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('walletBalance')
      localStorage.removeItem('portfolioValue')
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected successfully.',
      })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    isLoading,
    balance,
    portfolioValue,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

