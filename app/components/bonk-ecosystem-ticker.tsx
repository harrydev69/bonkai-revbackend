"use client"

import { useEffect, useState } from "react"

export function BonkEcosystemTicker() {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="gecko-coin-price-marquee-widget.js"]')) {
      setScriptLoaded(true)
      return
    }

    // Load CoinGecko widget script
    const script = document.createElement('script')
    script.src = 'https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js'
    script.async = true
    
    script.onload = () => {
      setScriptLoaded(true)
      setScriptError(false)
    }
    
    script.onerror = () => {
      setScriptError(true)
      setScriptLoaded(false)
    }

    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Remove script when component unmounts
      const existingScript = document.querySelector('script[src*="gecko-coin-price-marquee-widget.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  // Fallback content while loading or on error
  if (!scriptLoaded || scriptError) {
    return (
      <div className="w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 py-2 overflow-hidden">
        <div className="flex items-center justify-center text-black font-medium">
          {scriptError ? (
            <span>🚫 Failed to load price ticker</span>
          ) : (
            <span>⏳ Loading price ticker...</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 py-2 overflow-hidden">
      <div className="flex items-center justify-center">
        <gecko-coin-price-marquee-widget 
          locale="en" 
          transparent-background="true" 
          coin-ids="bonk,useless-3,bucky-2,ani-grok-companion,kori,hodl-coin,hosico-cat,rhetor,nyla-ai,just-memecoin,solana-stock-index,momo-3,monkey-the-picasso,solana" 
          initial-currency="usd"
        />
      </div>
    </div>
  )
}

