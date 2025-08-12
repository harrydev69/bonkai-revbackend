"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, AlertCircle, Inbox, TrendingUp, MessageSquare, Calendar } from "lucide-react"

interface EmptyStateProps {
  type: "search" | "alerts" | "transactions" | "analytics" | "chat" | "calendar" | "general"
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ type, title, description, actionLabel, onAction }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "search":
        return <Search className="w-12 h-12 text-gray-400" />
      case "alerts":
        return <AlertCircle className="w-12 h-12 text-gray-400" />
      case "transactions":
        return <Inbox className="w-12 h-12 text-gray-400" />
      case "analytics":
        return <TrendingUp className="w-12 h-12 text-gray-400" />
      case "chat":
        return <MessageSquare className="w-12 h-12 text-gray-400" />
      case "calendar":
        return <Calendar className="w-12 h-12 text-gray-400" />
      default:
        return <Inbox className="w-12 h-12 text-gray-400" />
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case "search":
        return {
          title: "No search results",
          description: "Try adjusting your search terms or filters to find what you're looking for.",
          actionLabel: "Clear filters",
        }
      case "alerts":
        return {
          title: "No alerts configured",
          description: "Set up price, volume, or social alerts to stay informed about BONK movements.",
          actionLabel: "Create alert",
        }
      case "transactions":
        return {
          title: "No transactions found",
          description: "Connect your wallet to view your transaction history and portfolio.",
          actionLabel: "Connect wallet",
        }
      case "analytics":
        return {
          title: "No data available",
          description: "Analytics data will appear here once we have sufficient market information.",
          actionLabel: "Refresh data",
        }
      case "chat":
        return {
          title: "Start a conversation",
          description: "Ask me anything about BONK, market trends, or trading strategies.",
          actionLabel: "Ask a question",
        }
      case "calendar":
        return {
          title: "No events scheduled",
          description: "Important BONK ecosystem events and announcements will appear here.",
          actionLabel: "Add event",
        }
      default:
        return {
          title: "No data available",
          description: "There's nothing to show here right now.",
          actionLabel: "Refresh",
        }
    }
  }

  const defaultContent = getDefaultContent()
  const finalTitle = title || defaultContent.title
  const finalDescription = description || defaultContent.description
  const finalActionLabel = actionLabel || defaultContent.actionLabel

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {getIcon()}
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{finalTitle}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm">{finalDescription}</p>
        {onAction && (
          <Button
            onClick={onAction}
            className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {finalActionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

