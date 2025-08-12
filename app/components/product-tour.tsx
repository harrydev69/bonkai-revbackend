"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import type { ViewType } from "../dashboard/page"

interface ProductTourProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  onEndTour: () => void
}

interface TourStep {
  id: string
  title: string
  description: string
  view: ViewType
  position: "top" | "bottom" | "left" | "right" | "center"
  target?: string
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to BONKai!",
    description:
      "Your comprehensive Web3 analytics platform for the LetsBonk.fun ecosystem. Let's take a quick tour of the key features.",
    view: "dashboard",
    position: "center",
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description:
      "Get real-time insights into BONK price, market cap, sentiment analysis, and ecosystem tokens. All data updates every 15 minutes.",
    view: "dashboard",
    position: "center",
  },
  {
    id: "profile",
    title: "Profile & Wallet",
    description:
      "Connect your Solana wallet to view your portfolio, track holdings, and analyze your trading performance.",
    view: "profile",
    position: "center",
  },
  {
    id: "chat",
    title: "AI Chat Assistant",
    description:
      "Ask questions about BONK, get market insights, and receive personalized trading advice from our AI copilot.",
    view: "chat",
    position: "center",
  },
  {
    id: "search",
    title: "Meta Search",
    description:
      "Search across multiple data sources to find comprehensive information about tokens, trends, and market movements.",
    view: "search",
    position: "center",
  },
  {
    id: "sentiment",
    title: "Sentiment Analysis",
    description: "Monitor social sentiment, community mood, and market psychology to make informed trading decisions.",
    view: "sentiment",
    position: "center",
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    description: "Access professional-grade charts, technical indicators, and comprehensive market analysis tools.",
    view: "analytics",
    position: "center",
  },
  {
    id: "complete",
    title: "Tour Complete!",
    description:
      "You're all set! Explore BONKai and discover powerful insights for your Web3 journey. Connect your wallet to unlock the full experience.",
    view: "dashboard",
    position: "center",
  },
]

export function ProductTour({ currentView, setCurrentView, onEndTour }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const step = tourSteps[currentStep]

  useEffect(() => {
    // Auto-navigate to the step's view
    if (step.view !== currentView) {
      setCurrentView(step.view)
    }
  }, [currentStep, step.view, currentView, setCurrentView])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem("bonkai-tour-completed", "true")
    localStorage.removeItem("bonkai-tour-progress")
    setIsVisible(false)
    setTimeout(onEndTour, 300)
  }

  const skipTour = () => {
    localStorage.setItem("bonkai-tour-completed", "true")
    localStorage.removeItem("bonkai-tour-progress")
    setIsVisible(false)
    setTimeout(onEndTour, 300)
  }

  // Save progress
  useEffect(() => {
    localStorage.setItem("bonkai-tour-progress", currentStep.toString())
  }, [currentStep])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <Badge variant="outline">
                  {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === tourSteps.length - 1 ? (
                <Button onClick={completeTour} className="flex-1">
                  Get Started
                </Button>
              ) : (
                <Button onClick={nextStep} className="flex-1">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={skipTour} className="text-muted-foreground">
                Skip Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

