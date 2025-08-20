"use client"

import { BonkProvider } from "../context/bonk-context"
import { WalletProvider } from "../components/wallet-provider"
import { ResponsiveLayout } from "../components/responsive-layout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Palette, Shield, Database } from "lucide-react"
import type { ViewType } from "../dashboard/page"

export default function SettingsPage() {
  const [currentView, setCurrentView] = useState<ViewType>("settings")
  const [isDarkMode, setIsDarkMode] = useState(false)

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
    const savedSettings = localStorage.getItem("bonkai-settings")
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDarkMode])

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
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Customize your BONKai experience</p>
              </div>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure your alert preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Price Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about BONK price changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.priceAlerts}
                      onCheckedChange={(checked) => handleSettingsChange("notifications", "priceAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Volume Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about unusual trading volume</p>
                    </div>
                    <Switch
                      checked={settings.notifications.volumeAlerts}
                      onCheckedChange={(checked) => handleSettingsChange("notifications", "volumeAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Social Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about social media trends</p>
                    </div>
                    <Switch
                      checked={settings.notifications.socialAlerts}
                      onCheckedChange={(checked) => handleSettingsChange("notifications", "socialAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">News Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about important news</p>
                    </div>
                    <Switch
                      checked={settings.notifications.newsAlerts}
                      onCheckedChange={(checked) => handleSettingsChange("notifications", "newsAlerts", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Display
                  </CardTitle>
                  <CardDescription>Customize your visual preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Currency</p>
                      <p className="text-sm text-muted-foreground">Display prices in your preferred currency</p>
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
                </CardContent>
              </Card>

              {/* API Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    API & Performance
                  </CardTitle>
                  <CardDescription>Configure data refresh and performance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Refresh</p>
                      <p className="text-sm text-muted-foreground">Automatically refresh data</p>
                    </div>
                    <Switch
                      checked={settings.api.autoRefresh}
                      onCheckedChange={(checked) => handleSettingsChange("api", "autoRefresh", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Refresh Interval</p>
                      <p className="text-sm text-muted-foreground">How often to refresh data (seconds)</p>
                    </div>
                    <Select
                      value={settings.api.refreshInterval.toString()}
                      onValueChange={(value) => handleSettingsChange("api", "refreshInterval", parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">WebSocket</p>
                      <p className="text-sm text-muted-foreground">Enable real-time updates</p>
                    </div>
                    <Switch
                      checked={settings.api.enableWebSocket}
                      onCheckedChange={(checked) => handleSettingsChange("api", "enableWebSocket", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Manage your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">Help improve BONKai with usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.privacy.analytics}
                      onCheckedChange={(checked) => handleSettingsChange("privacy", "analytics", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cookies</p>
                      <p className="text-sm text-muted-foreground">Allow cookies for better experience</p>
                    </div>
                    <Switch
                      checked={settings.privacy.cookies}
                      onCheckedChange={(checked) => handleSettingsChange("privacy", "cookies", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Sharing</p>
                      <p className="text-sm text-muted-foreground">Share anonymous data with partners</p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => handleSettingsChange("privacy", "dataSharing", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ResponsiveLayout>
        </BonkProvider>
      </div>
    </WalletProvider>
  )
}
