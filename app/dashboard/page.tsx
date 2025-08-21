// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { MainContent } from "../components/main-content"
import { ChatInterface } from "../components/chat-interface"
import { MetaSearchDashboard } from "../components/meta-search-dashboard"
import { SentimentDashboard } from "../components/sentiment-dashboard"
import { MindshareTracker } from "../components/mindshare-dashboard"
import { AlertsDashboard } from "../components/alerts-dashboard"
import { NarrativeTracker } from "../components/narrative-dashboard"
import { AnalyticsDashboard } from "../components/analytics-dashboard"
import { CalendarDashboard } from "../components/calendar-dashboard"
import { AudioLibrary } from "../components/audio-library"
import { ProfileDashboard } from "../components/profile-dashboard"
import { ResponsiveLayout } from "../components/responsive-layout"
import { ProductTour } from "../components/product-tour"
import { WalletProvider } from "../components/wallet-provider"
import { PerformanceMonitor } from "../components/performance-monitor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Palette, Shield, Database } from "lucide-react"
import { Toaster } from "../components/toaster"
import { ErrorBoundary } from "../components/error-boundary"

// Bonk data provider/hook
import { BonkProvider, useBonk } from "../context/bonk-context"
import type { BonkData } from "../context/bonk-context"

export type ViewType =
  | "dashboard"
  | "profile"
  | "chat"
  | "search"
  | "sentiment"
  | "mindshare"
  | "alerts"
  | "narrative"
  | "analytics"
  | "calendar"
  | "audio"
  | "settings"
  | "faq"

// Child component that CONSUMES the Bonk context (must be inside <BonkProvider>)
function DashboardBody({
  currentView,
  setCurrentView,
  isDarkMode,
  setIsDarkMode,
  onStartTour,
  showTour,
  onEndTour,
  renderSettingsPage,
}: {
  currentView: ViewType
  setCurrentView: (v: ViewType) => void
  isDarkMode: boolean
  setIsDarkMode: (b: boolean) => void
  onStartTour: () => void
  showTour: boolean
  onEndTour: () => void
  renderSettingsPage: () => JSX.Element
}) {
  const { bonkData } = useBonk()

  const defaultBonk: BonkData = {
    price: 0,
    marketCap: 0,
    change24h: 0,
    volume24h: 0,
    sentiment: "neutral",
    socialVolume: 0,
    mindshareRank: 0,
  }
  const safeBonk: BonkData = bonkData ?? defaultBonk

  // Adapter to match MainContent prop type (expects (view: string) => void)
  const setView = (view: string) => setCurrentView(view as ViewType)

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <MainContent setCurrentView={setView} bonkData={safeBonk} />
      case "profile":
        return <ProfileDashboard />
      case "chat":
        return <ChatInterface bonkData={safeBonk} />
      case "search":
        return <MetaSearchDashboard bonkData={safeBonk} />
      case "sentiment":
        return <SentimentDashboard />
      case "mindshare":
        return <MindshareTracker />
      case "alerts":
        return <AlertsDashboard bonkData={safeBonk} />
      case "narrative":
        return <NarrativeTracker bonkData={safeBonk} />
      case "analytics":
        return <AnalyticsDashboard />
      case "calendar":
        return <CalendarDashboard />
      case "audio":
        return <AudioLibrary />
      case "settings":
        return renderSettingsPage()
      case "faq":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p>FAQ content will be implemented here.</p>
          </div>
        )
      default:
        return <MainContent setCurrentView={setView} bonkData={safeBonk} />
    }
  }

  return (
    <>
      <ResponsiveLayout
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        bonkData={safeBonk}
        onStartTour={onStartTour}
      >
        {renderContent()}
      </ResponsiveLayout>

      {showTour && (
        <ProductTour currentView={currentView} setCurrentView={setCurrentView} onEndTour={onEndTour} />
      )}
    </>
  )
}

function DashboardInner() {
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showTour, setShowTour] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      priceAlerts: true,
      volumeAlerts: true,
      socialAlerts: false,
      newsAlerts: true,
    },
    display: {
      theme: "system" as "light" | "dark" | "system",
      currency: "USD" as "USD" | "EUR" | "BTC" | "ETH",
      language: "en" as "en" | "es" | "fr" | "de" | "ja",
    },
    privacy: {
      analytics: true,
      cookies: true,
      dataSharing: false,
    },
    api: {
      autoRefresh: true,
      refreshInterval: 30,
      enableWebSocket: true,
    },
  })

  useEffect(() => {
    const tourParam = searchParams.get("tour")
    if (tourParam === "true") setShowTour(true)

    const savedSettings = localStorage.getItem("bonkai-settings")
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [searchParams])

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDarkMode])

  const handleStartTour = () => setShowTour(true)

  const handleTourComplete = () => {
    setShowTour(false)
    const url = new URL(window.location.href)
    url.searchParams.delete("tour")
    window.history.replaceState({}, "", url.toString())
  }

  const handleSettingsChange = (category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value,
      },
    }
    setSettings(newSettings)
    localStorage.setItem("bonkai-settings", JSON.stringify(newSettings))
  }

  // Adapter to match MainContent prop type (expects (view: string) => void)
  const setView = (view: string) => setCurrentView(view as ViewType)

  const renderSettingsPage = () => {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Customize your BONKai experience</p>
          </div>
        </div>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-500" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure your alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when price targets are hit</p>
              </div>
              <Switch
                checked={settings.notifications.priceAlerts}
                onCheckedChange={(value) => handleSettingsChange("notifications", "priceAlerts", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Volume Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about unusual volume activity</p>
              </div>
              <Switch
                checked={settings.notifications.volumeAlerts}
                onCheckedChange={(value) => handleSettingsChange("notifications", "volumeAlerts", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Social Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about social media trends</p>
              </div>
              <Switch
                checked={settings.notifications.socialAlerts}
                onCheckedChange={(value) => handleSettingsChange("notifications", "socialAlerts", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">News Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about important news</p>
              </div>
              <Switch
                checked={settings.notifications.newsAlerts}
                onCheckedChange={(value) => handleSettingsChange("notifications", "newsAlerts", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-purple-500" />
              <div>
                <CardTitle>Display</CardTitle>
                <CardDescription>Customize the appearance and language</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Select
                value={settings.display.theme}
                onValueChange={(value) => handleSettingsChange("display", "theme", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">Default currency for prices</p>
              </div>
              <Select
                value={settings.display.currency}
                onValueChange={(value) => handleSettingsChange("display", "currency", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">Interface language</p>
              </div>
              <Select
                value={settings.display.language}
                onValueChange={(value) => handleSettingsChange("display", "language", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control your data and privacy preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Help improve BONKai with usage analytics</p>
              </div>
              <Switch
                checked={settings.privacy.analytics}
                onCheckedChange={(value) => handleSettingsChange("privacy", "analytics", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cookies</p>
                <p className="text-sm text-muted-foreground">Allow cookies for better experience</p>
              </div>
              <Switch
                checked={settings.privacy.cookies}
                onCheckedChange={(value) => handleSettingsChange("privacy", "cookies", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Sharing</p>
                <p className="text-sm text-muted-foreground">Share anonymized data with partners</p>
              </div>
              <Switch
                checked={settings.privacy.dataSharing}
                onCheckedChange={(value) => handleSettingsChange("privacy", "dataSharing", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <CardTitle>API & Data</CardTitle>
                <CardDescription>Configure data refresh and API settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Refresh</p>
                <p className="text-sm text-muted-foreground">Automatically refresh data</p>
              </div>
              <Switch
                checked={settings.api.autoRefresh}
                onCheckedChange={(value) => handleSettingsChange("api", "autoRefresh", value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Refresh Interval</p>
                <p className="text-sm text-muted-foreground">How often to refresh data (seconds)</p>
              </div>
              <Select
                value={settings.api.refreshInterval.toString()}
                onValueChange={(value) => handleSettingsChange("api", "refreshInterval", Number.parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WebSocket</p>
                <p className="text-sm text-muted-foreground">Enable real-time data updates</p>
              </div>
              <Switch
                checked={settings.api.enableWebSocket}
                onCheckedChange={(value) => handleSettingsChange("api", "enableWebSocket", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => setCurrentView("dashboard")}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            Save & Return to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSettings({
                notifications: {
                  priceAlerts: true,
                  volumeAlerts: true,
                  socialAlerts: false,
                  newsAlerts: true,
                },
                display: {
                  theme: "system",
                  currency: "USD",
                  language: "en",
                },
                privacy: {
                  analytics: true,
                  cookies: true,
                  dataSharing: false,
                },
                api: {
                  autoRefresh: true,
                  refreshInterval: 30,
                  enableWebSocket: true,
                },
              })
              localStorage.removeItem("bonkai-settings")
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <WalletProvider>
        <div className={isDarkMode ? "dark" : ""}>
          <BonkProvider
            refreshMs={settings.api.autoRefresh ? settings.api.refreshInterval * 1000 : 0}
            useWebSocket={process.env.NODE_ENV === "production" ? true : settings.api.enableWebSocket}
          >
            <DashboardBody
              currentView={currentView}
              setCurrentView={setCurrentView}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onStartTour={handleStartTour}
              showTour={showTour}
              onEndTour={handleTourComplete}
              renderSettingsPage={renderSettingsPage}
            />
          </BonkProvider>

          <Toaster />
          <PerformanceMonitor />
        </div>
      </WalletProvider>
    </ErrorBoundary>
  )
}

export default function Dashboard() {
  return <DashboardInner />
}
