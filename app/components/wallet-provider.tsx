"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { dataService } from "../services/data-service"
import { toast } from "@/hooks/use-toast"
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"

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

  // wallet-adapter modal (Phantom/Solflare)
  const wallet = useSolanaWallet()

  // On mount: restore session + fetch balances
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    const savedConnection = localStorage.getItem("walletConnected")
    if (savedAddress && savedConnection === "true") {
      setWalletAddress(savedAddress)
      setIsConnected(true)
      ;(async () => {
        try {
          const res = await fetch(`/api/solana/balance?wallet=${savedAddress}`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            setBalance(data.sol || 0)
            setPortfolioValue(data.sol || 0)
          } else {
            const b = localStorage.getItem("walletBalance")
            const p = localStorage.getItem("portfolioValue")
            setBalance(b ? Number.parseFloat(b) : 0)
            setPortfolioValue(p ? Number.parseFloat(p) : 0)
          }
        } catch {
          const b = localStorage.getItem("walletBalance")
          const p = localStorage.getItem("portfolioValue")
          setBalance(b ? Number.parseFloat(b) : 0)
          setPortfolioValue(p ? Number.parseFloat(p) : 0)
        }
      })()
    }
  }, [])

  // Base58 encoder (Bitcoin alphabet) to match server decoder
  function base58Encode(bytes: Uint8Array): string {
    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let bi = 0n
    for (const b of bytes) bi = (bi << 8n) + BigInt(b)
    const out: string[] = []
    while (bi > 0n) {
      const mod = bi % 58n
      out.unshift(ALPHABET[Number(mod)])
      bi = bi / 58n
    }
    // leading zeros -> '1'
    for (const b of bytes) {
      if (b === 0) out.unshift("1")
      else break
    }
    return out.join("") || "1"
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      let address: string | undefined

      // 1) Preferred: open the wallet-adapter modal (Phantom/Solflare)
      if (!wallet.connected) {
        await wallet.connect()
      }
      if (wallet.connected && wallet.publicKey) {
        address = wallet.publicKey.toBase58()

        // Signed message verification (if supported)
        const SIGN_MESSAGE =
          "Sign in to BonkAI Analytics to verify wallet ownership. This will NOT send a transaction."

        if (typeof wallet.signMessage === "function") {
          const messageBytes = new TextEncoder().encode(SIGN_MESSAGE)
          const signatureBytes = await wallet.signMessage(messageBytes) // Uint8Array
          const signatureBase58 = base58Encode(signatureBytes)

          const verifyRes = await fetch("/api/auth/verify-signature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: address, message: SIGN_MESSAGE, signature: signatureBase58 }),
          })
          if (!verifyRes.ok) {
            const j = await verifyRes.json().catch(() => ({}))
            throw new Error(j?.error || "Signature verification failed")
          }

          localStorage.setItem("walletAddress", address)
          localStorage.setItem("walletConnected", "true")
        } else {
          // Wallet doesn’t support signMessage -> fall back to mock flow
          address = undefined
        }
      }

      // 2) Fallback: mock connect (dev/demo)
      if (!address) {
        const walletData = await dataService.connectWallet()
        address = walletData.address
        setBalance(walletData.balance)
        setPortfolioValue(walletData.portfolioValue)

        const res = await fetch("/api/auth/connect-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        })
        if (!res.ok) throw new Error("Server responded with " + res.status)

        localStorage.setItem("walletAddress", address)
        localStorage.setItem("walletConnected", "true")
      }

      if (!address) throw new Error("No wallet address obtained")

      // Update UI state + fetch balances
      setWalletAddress(address)
      setIsConnected(true)
      try {
        const balRes = await fetch(`/api/solana/balance?wallet=${address}`, { cache: "no-store" })
        if (balRes.ok) {
          const balJson = await balRes.json()
          const sol = balJson?.sol ?? 0
          setBalance(sol)
          setPortfolioValue(sol)
          localStorage.setItem("walletBalance", String(sol))
          localStorage.setItem("portfolioValue", String(sol))
        }
      } catch {}

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
        variant: "default", // your Toast type allows 'default' | 'destructive'
      })
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (wallet.disconnect) {
        try { await wallet.disconnect() } catch {}
      }
      await fetch("/api/auth/disconnect", { method: "DELETE" })

      setWalletAddress(null)
      setIsConnected(false)
      setBalance(0)
      setPortfolioValue(0)

      localStorage.removeItem("walletAddress")
      localStorage.removeItem("walletConnected")
      localStorage.removeItem("walletBalance")
      localStorage.removeItem("portfolioValue")

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
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
