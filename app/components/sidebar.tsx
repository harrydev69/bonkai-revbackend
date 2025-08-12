"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Search,
  TrendingUp,
  Brain,
  Bell,
  Zap,
  BarChart3,
  Calendar,
  Music,
  Home,
  HelpCircle,
  Settings,
  ExternalLink,
  User,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useWallet } from "./wallet-provider"
import type { ViewType, BonkData } from "../dashboard/page"

interface SidebarProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  bonkData: BonkData
  onStartTour?: () => void
}

export function Sidebar({ currentView, setCurrentView, bonkData, onStartTour }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const { isConnected, connectWallet, disconnectWallet, walletAddress } = useWallet()

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      view: "dashboard" as ViewType,
      badge: "Live",
    },
    {
      title: "Profile",
      icon: User,
      view: "profile" as ViewType,
      badge: isConnected ? "Connected" : "Connect",
    },
    {
      title: "AI Chat",
      icon: MessageSquare,
      view: "chat" as ViewType,
      badge: "AI",
    },
    {
      title: "Meta Search",
      icon: Search,
      view: "search" as ViewType,
      badge: "1.2K",
    },
    {
      title: "Sentiment",
      icon: TrendingUp,
      view: "sentiment" as ViewType,
      badge: bonkData.sentiment === "bullish" ? "Bullish" : "Bearish",
    },
    {
      title: "Mindshare",
      icon: Brain,
      view: "mindshare" as ViewType,
      badge: `#${bonkData.mindshareRank}`,
    },
    {
      title: "Alerts",
      icon: Bell,
      view: "alerts" as ViewType,
      badge: "3",
    },
    {
      title: "Narrative",
      icon: Zap,
      view: "narrative" as ViewType,
      badge: "Hot",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      view: "analytics" as ViewType,
      badge: "Pro",
    },
    {
      title: "Calendar",
      icon: Calendar,
      view: "calendar" as ViewType,
    },
    {
      title: "Audio Library",
      icon: Music,
      view: "audio" as ViewType,
    },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isMinimized ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isMinimized && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                BONKai
              </span>
              <span className="text-xs text-muted-foreground">LetsBonk.fun Analytics</span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 p-0">
          {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* BONK Stats */}
      {!isMinimized && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">BONK Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm font-medium">${bonkData.price.toFixed(8)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Cap</span>
              <span className="text-sm font-medium">${(bonkData.marketCap / 1000000000).toFixed(2)}B</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Change</span>
              <Badge variant={bonkData.change24h >= 0 ? "default" : "destructive"}>
                {bonkData.change24h >= 0 ? "+" : ""}
                {bonkData.change24h.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sentiment</span>
              <Badge variant={bonkData.sentiment === "bullish" ? "default" : "destructive"}>{bonkData.sentiment}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="p-4">
        <h3 className={`text-sm font-medium text-muted-foreground mb-2 ${isMinimized ? "hidden" : ""}`}>Navigation</h3>
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? "default" : "ghost"}
              onClick={() => setCurrentView(item.view)}
              className={`w-full justify-start ${isMinimized ? "px-2" : ""}`}
              title={isMinimized ? item.title : undefined}
            >
              <item.icon className="w-4 h-4" />
              {!isMinimized && (
                <>
                  <span className="ml-2">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant={
                        item.view === "profile" && isConnected
                          ? "default"
                          : item.view === "sentiment" && bonkData.sentiment === "bullish"
                            ? "default"
                            : "secondary"
                      }
                      className="ml-auto text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      {!isMinimized && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Links</h3>
          <div className="space-y-1">
            <Button variant="ghost" asChild className="w-full justify-start">
              <a
                href="https://www.coingecko.com/en/categories/letsbonk-fun-ecosystem"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                LetsBonk.fun Ecosystem
              </a>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <a href="https://www.coingecko.com/en/coins/bonk" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                BONK on CoinGecko
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              className="w-full justify-start"
              title={isMinimized ? "Connect Wallet" : undefined}
            >
              <Wallet className="w-4 h-4" />
              {!isMinimized && <span className="ml-2">Connect Wallet</span>}
            </Button>
          ) : (
            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="w-full justify-start bg-transparent"
              title={isMinimized ? `Disconnect ${formatAddress(walletAddress!)}` : undefined}
            >
              <Wallet className="w-4 h-4" />
              {!isMinimized && <span className="ml-2">{formatAddress(walletAddress!)}</span>}
            </Button>
          )}

          {onStartTour && (
            <Button
              onClick={onStartTour}
              variant="ghost"
              className="w-full justify-start"
              title={isMinimized ? "Take Tour" : undefined}
            >
              <HelpCircle className="w-4 h-4" />
              {!isMinimized && <span className="ml-2">Take Tour</span>}
            </Button>
          )}

          <Button variant="ghost" className="w-full justify-start" title={isMinimized ? "Settings" : undefined}>
            <Settings className="w-4 h-4" />
            {!isMinimized && <span className="ml-2">Settings</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

