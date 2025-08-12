"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { TopNavigation } from "./top-navigation"
import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileNavigation } from "./mobile-navigation"
import type { ViewType, BonkData } from "../dashboard/page"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  bonkData: BonkData
  onStartTour?: () => void
}

export function ResponsiveLayout({
  children,
  currentView,
  setCurrentView,
  isDarkMode,
  setIsDarkMode,
  bonkData,
  onStartTour,
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopNavigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          bonkData={bonkData}
          onStartTour={onStartTour}
        />
        <main className="pb-16">{children}</main>
        <MobileNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          bonkData={bonkData}
          onStartTour={onStartTour}
        />
        <SidebarInset className="flex-1">
          <TopNavigation
            currentView={currentView}
            setCurrentView={setCurrentView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            bonkData={bonkData}
            onStartTour={onStartTour}
          />
          <main className="flex-1 p-6" id="dashboard-content">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default ResponsiveLayout

