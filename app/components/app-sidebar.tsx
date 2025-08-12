"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Globe,
} from "lucide-react"
import { useWallet } from "./wallet-provider"
import type { ViewType, BonkData } from "../dashboard/page"

interface AppSidebarProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  bonkData: BonkData
  onStartTour?: () => void
}

export function AppSidebar({ currentView, setCurrentView, bonkData, onStartTour }: AppSidebarProps) {
  const { isConnected, connectWallet, disconnectWallet, walletAddress } = useWallet()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      view: "dashboard" as ViewType,
      badge: "Live",
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2">
            
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                BONKai
              </span>
              <span className="text-xs text-muted-foreground">Analytics Platform </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0" data-sidebar="trigger">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => setCurrentView(item.view)}
                    isActive={currentView === item.view}
                    className="w-full justify-start"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={
                          item.view === "sentiment" && bonkData.sentiment === "bullish" ? "default" : "secondary"
                        }
                        className="ml-auto text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://gmgn.ai/sol/token/AKytoLENhxBLssBFPwGnpYnsY5kpKz328GU6pbGudaos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Buy nBONK</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://gmgn.ai/sol/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Buy BONK</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="http://bonkcoin.com/" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    <span>BONK Website</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://www.coingecko.com/en/categories/letsbonk-fun-ecosystem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LetsBonk.fun Ecosystem</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://www.coingecko.com/en/coins/bonk" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    <span>BONK on CoinGecko</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t pt-4">
        <SidebarMenu>
          {onStartTour && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onStartTour} tooltip={isCollapsed ? "Take Tour" : undefined}>
                <HelpCircle className="w-4 h-4" />
                <span>Take Tour</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setCurrentView("settings")}
              isActive={currentView === "settings"}
              tooltip={isCollapsed ? "Settings" : undefined}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

