"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

// Dash sections
import { MainContent } from "../components/main-content"
import { ChatInterface } from "../components/chat-interface"
// NOTE: if MetaSearchDashboard was converted to a default export, switch this import accordingly.
import { MetaSearchDashboard } from "../components/meta-search-dashboard"

// Updated: SentimentDashboard is now a **default** export with no props
import SentimentDashboard from "../components/sentiment-dashboard"

// MindshareTracker still a named export; accepts { refreshMs? }
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Palette, Shield, Database } from "lucide-react"
import { Toaster } from "../components/toaster"
import { dataService } from "../services/data-service"
import { ErrorBoundary } from "../components/error-boundary"

// Added sections you wired
import SocialFeed from "../components/social-feed"
import InfluencerList from "../components/influencer-list"

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

export interface BonkData {
  price: number
  marketCap: number
  change24h: number
  volume24h: number
  sentiment: "bullish" | "bearish" | "neutral"
  socialVolume: number
  mindshareRank: number
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showTour, setShowTour] = useState(false)

  const setView = (v: ViewType) => setCurrentView(v)

  // Settings
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

  // BONK summary that other widgets use (kept for backwards compat)
  const [bonkData, setBonkData] = useState<BonkData>({
    price: 0.00003435,
    marketCap: 2340000000,
    change24h: 18.6,
    volume24h: 45600000,
    sentiment: "bullish",
    socialVolume: 2847,
    mindshareRank: 3,
  })

  useEffect(() => {
    // Product tour flag
    const tourParam = searchParams.get("tour")
    if (tourParam === "true") setShowTour(true)

    // Load settings
    const saved = localStorage.getItem("bonkai-settings")
    if (saved) setSettings(JSON.parse(saved))
  }, [searchParams])

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDarkMode])

  // Demo tickers (can be removed once everything is API-driven)
  useEffect(() => {
    const id = setInterval(() => {
      setBonkData((prev) => ({
        ...prev,
        price: prev.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: prev.change24h + (Math.random() - 0.5) * 2,
        volume24h: prev.volume24h * (1 + (Math.random() - 0.5) * 0.05),
        socialVolume: Math.floor(prev.socialVolume + (Math.random() - 0.5) * 100),
      }))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Real-time updates wiring
  useEffect(() => {
    const unsubscribe = dataService.subscribeToRealTimeData((newData: BonkData) => {
      setBonkData(newData)
    })
    return unsubscribe
  }, [])

  // Initial data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await dataService.getBonkData()
        setBonkData(data)
      } catch (e) {
        console.error("Failed to load initial data:", e)
      }
    }
    void load()
  }, [])

  const handleStartTour = () => setShowTour(true)
  const handleTourComplete = () => {
    setShowTour(false)
    const url = new URL(window.location.href)
    url.searchParams.delete("tour")
    window.history.replaceState({}, "", url.toString())
  }

  const handleSettingsChange = (category: string, key: string, value: unknown) => {
    const next = {
      ...settings,
      [category]: {
        ...(settings as any)[category],
        [key]: value,
      },
    }
    setSettings(next)
    localStorage.setItem("bonkai-settings", JSON.stringify(next))
  }

  // Helper: derive refresh interval for components that poll
  const derivedRefreshMs = settings.api.autoRefresh ? settings.api.refreshInterval * 1000 : 1_000_000_000 // ~11.5 days

  const renderSettingsPage = () => (
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

      {/* Notifications */}
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
              onCheckedChange={(v) => handleSettingsChange("notifications", "priceAlerts", v)}
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
              onCheckedChange={(v) => handleSettingsChange("notifications", "volumeAlerts", v)}
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
              onCheckedChange={(v) => handleSettingsChange("notifications", "socialAlerts", v)}
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
              onCheckedChange={(v) => handleSettingsChange("notifications", "newsAlerts", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display */}
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
              onValueChange={(v) => handleSettingsChange("display", "theme", v)}
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
              onValueChange={(v) => handleSettingsChange("display", "currency", v)}
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
              onValueChange={(v) => handleSettingsChange("display", "language", v)}
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

      {/* Privacy */}
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
              onCheckedChange={(v) => handleSettingsChange("privacy", "analytics", v)}
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
              onCheckedChange={(v) => handleSettingsChange("privacy", "cookies", v)}
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
              onCheckedChange={(v) => handleSettingsChange("privacy", "dataSharing", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* API */}
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
              onCheckedChange={(v) => handleSettingsChange("api", "autoRefresh", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Refresh Interval</p>
              <p className="text-sm text-muted-foreground">How often to refresh data (seconds)</p>
            </div>
            <Select
              value={String(settings.api.refreshInterval)}
              onValueChange={(v) => handleSettingsChange("api", "refreshInterval", parseInt(v))}
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
              onCheckedChange={(v) => handleSettingsChange("api", "enableWebSocket", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={() => setView("dashboard")}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
        >
          Save & Return to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSettings({
              notifications: { priceAlerts: true, volumeAlerts: true, socialAlerts: false, newsAlerts: true },
              display: { theme: "system", currency: "USD", language: "en" },
              privacy: { analytics: true, cookies: true, dataSharing: false },
              api: { autoRefresh: true, refreshInterval: 30, enableWebSocket: true },
            })
            localStorage.removeItem("bonkai-settings")
          }}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <MainContent setCurrentView={setView} bonkData={bonkData} />
            {/* Compact feed on main dashboard */}
            <SocialFeed limit={20} />
          </div>
        )
      case "profile":
        return <ProfileDashboard />
      case "chat":
        return <ChatInterface bonkData={bonkData} />
      case "search":
        return <MetaSearchDashboard bonkData={bonkData} />
      case "sentiment":
        return (
          <div className="space-y-6">
            {/* Updated: no bonkData prop */}
            <SentimentDashboard />
            <InfluencerList limit={25} />
            <SocialFeed limit={50} />
          </div>
        )
      case "mindshare":
        // Updated: pass only refreshMs (derived from Settings)
        return <MindshareTracker refreshMs={derivedRefreshMs} />
      case "alerts":
        return <AlertsDashboard bonkData={bonkData} />
      case "narrative":
        return (
          <div className="space-y-6">
            <NarrativeTracker bonkData={bonkData} />
            <InfluencerList limit={25} />
            <SocialFeed limit={50} />
          </div>
        )
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
        return <MainContent setCurrentView={setView} bonkData={bonkData} />
    }
  }

  return (
    <ErrorBoundary>
      <WalletProvider>
        <div className={isDarkMode ? "dark" : ""}>
          <ResponsiveLayout
            currentView={currentView}
            setCurrentView={setView}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            bonkData={bonkData}
            onStartTour={handleStartTour}
          >
            {renderContent()}
          </ResponsiveLayout>

          {showTour && (
            <ProductTour currentView={currentView} setCurrentView={setView} onEndTour={handleTourComplete} />
          )}

          <Toaster />
        </div>
      </WalletProvider>
    </ErrorBoundary>
  )
}
