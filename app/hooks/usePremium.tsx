"use client"

import { useEffect, useState } from "react"
import { useWallet } from "../components/wallet-provider" // relative import

export function usePremium() {
  const { walletAddress } = useWallet()
  const [premium, setPremium] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    async function check() {
      if (!walletAddress) { setPremium(false); return }
      const res = await fetch(`/api/user/premium-status`, { cache: "no-store" })
      const json = await res.json().catch(() => ({}))
      if (active) setPremium(Boolean(json?.premium))
    }
    check()
    return () => { active = false }
  }, [walletAddress])

  return premium
}

export function PremiumOnly({ children }: { children: React.ReactNode }) {
  const premium = usePremium()
  if (premium === null) return <div className="p-4 text-sm opacity-70">Checking premium…</div>
  if (!premium) return <div className="p-4 text-sm">Hold 800k nBONK or 2m BONK to unlock this feature.</div>
  return <>{children}</>
}
