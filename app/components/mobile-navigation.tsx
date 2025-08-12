"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Bell, Home, User } from "lucide-react"
import type { ViewType } from "../dashboard/page"

interface MobileNavigationProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

export function MobileNavigation({ currentView, setCurrentView }: MobileNavigationProps) {
  const navigationItems = [
    {
      title: "Home",
      icon: Home,
      view: "dashboard" as ViewType,
      badge: null,
    },
    {
      title: "Profile",
      icon: User,
      view: "profile" as ViewType,
      badge: null,
    },
    {
      title: "Chat",
      icon: MessageSquare,
      view: "chat" as ViewType,
      badge: "AI",
    },
    {
      title: "Search",
      icon: Search,
      view: "search" as ViewType,
      badge: "1.2K",
    },
    {
      title: "Alerts",
      icon: Bell,
      view: "alerts" as ViewType,
      badge: "3",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => (
          <Button
            key={item.view}
            variant={currentView === item.view ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView(item.view)}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs px-1 py-0 h-4 min-w-4">
                  {item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs">{item.title}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

