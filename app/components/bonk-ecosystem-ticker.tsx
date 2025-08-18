"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface EcosystemToken {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  icon: string
  cmcId: string
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
    icon: "",
    cmcId: "bonk",
  },
  {
    id: "useless",
    name: "Useless",
    symbol: "USELESS",
    price: 0.000000234,
    change24h: 23.4,
    marketCap: 45000000,
    volume24h: 2300000,
    icon: "🗑️",
    cmcId: "useless",
  },
  {
    id: "hosico",
    name: "Hosico",
    symbol: "HOSICO",
    price: 0.00000567,
    change24h: -8.2,
    marketCap: 12000000,
    volume24h: 890000,
    icon: "🐱",
    cmcId: "hosico",
  },
  {
    id: "samo",
    name: "Samoyedcoin",
    symbol: "SAMO",
    price: 0.0234,
    change24h: 12.1,
    marketCap: 78000000,
    volume24h: 4500000,
    icon: "",
    cmcId: "samoyedcoin",
  },
  {
    id: "cope",
    name: "Cope",
    symbol: "COPE",
    price: 0.0456,
    change24h: -5.7,
    marketCap: 34000000,
    volume24h: 1200000,
    icon: "",
    cmcId: "cope",
  },
  {
    id: "rope",
    name: "Rope",
    symbol: "ROPE",
    price: 0.000123,
    change24h: 18.9,
    marketCap: 23000000,
    volume24h: 890000,
    icon: "",
    cmcId: "rope",
  },
  {
    id: "cheems",
    name: "Cheems",
    symbol: "CHEEMS",
    price: 0.00789,
    change24h: 7.3,
    marketCap: 56000000,
    volume24h: 2100000,
    icon: "",
    cmcId: "cheems",
  },
  {
    id: "doge-killer",
    name: "Doge Killer",
    symbol: "LEASH",
    price: 234.56,
    change24h: -3.4,
    marketCap: 89000000,
    volume24h: 3400000,
    icon: "",
    cmcId: "doge-killer",
  },
  {
    id: "floki",
    name: "FLOKI",
    symbol: "FLOKI",
    price: 0.000234,
    change24h: 9.8,
    marketCap: 67000000,
    volume24h: 2800000,
    icon: "",
    cmcId: "floki",
  },
  {
    id: "shiba-predator",
    name: "Shiba Predator",
    symbol: "QOM",
    price: 0.00000089,
    change24h: 14.2,
    marketCap: 15000000,
    volume24h: 670000,
    icon: "",
    cmcId: "shiba-predator",
  },
]

export function BonkEcosystemTicker() {
  const [tokens, setTokens] = useState(bonkFunEcosystemTokens)
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update data every 15 minutes (900,000 milliseconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setTokens((prev) =>
          prev.map((token) => ({
            ...token,
            price: token.price * (1 + (Math.random() - 0.5) * 0.02),
            change24h: token.change24h + (Math.random() - 0.5) * 2,
          })),
        )
        setLastUpdate(new Date())
      }
    }, 900000) // 15 minutes

    return () => clearInterval(interval)
  }, [isPaused])

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toFixed(9)}`
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toFixed(4)}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 py-2 overflow-hidden">
      <div className="flex items-center gap-1 text-sm font-medium text-black">
        <div className="flex items-center gap-2 px-4 whitespace-nowrap">
          
          
          
        </div>

        <div
          className={`flex gap-6 ${!isPaused ? "animate-scroll" : ""}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {[...tokens, ...tokens].map((token, index) => (
            <a
              key={`${token.id}-${index}`}
              href={`https://coinmarketcap.com/currencies/${token.cmcId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full hover:bg-black/20 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span className="text-lg">{token.icon}</span>
              <span className="font-bold">{token.symbol}</span>
              <span className={`flex items-center gap-1 ${token.change24h >= 0 ? "text-green-700" : "text-red-700"}`}>
                {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatChange(token.change24h)}
              </span>
              <ExternalLink className="w-3 h-3 opacity-60" />
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

