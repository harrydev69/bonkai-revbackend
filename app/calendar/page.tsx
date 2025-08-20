"use client"

import { CalendarDashboard } from "../components/calendar-dashboard"
import { BonkProvider } from "../context/bonk-context"
import { WalletProvider } from "../components/wallet-provider"
import { ResponsiveLayout } from "../components/responsive-layout"
import { useState } from "react"
import type { ViewType } from "../dashboard/page"

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<ViewType>("calendar")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleStartTour = () => {
    // Tour functionality can be added here
  }

  return (
    <WalletProvider>
      <div className={isDarkMode ? "dark" : ""}>
        <BonkProvider refreshMs={30000} useWebSocket={true}>
          <ResponsiveLayout
            currentView={currentView}
            setCurrentView={setCurrentView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            bonkData={{
              price: 0,
              marketCap: 0,
              change24h: 0,
              volume24h: 0,
              sentiment: "neutral",
              socialVolume: 0,
              mindshareRank: 0,
            }}
            onStartTour={handleStartTour}
          >
            <CalendarDashboard />
          </ResponsiveLayout>
        </BonkProvider>
      </div>
    </WalletProvider>
  )
}
