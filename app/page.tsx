"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, TrendingUp, Zap, HelpCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-pulse"
          style={{
            top: `${20 + mousePosition.y * 0.1}%`,
            left: `${10 + mousePosition.x * 0.05}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-15 animate-pulse"
          style={{
            top: `${60 + mousePosition.y * 0.08}%`,
            right: `${15 + mousePosition.x * 0.03}%`,
            transform: "translate(50%, -50%)",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-48 h-48 bg-green-200 dark:bg-green-800 rounded-full opacity-10 animate-bounce"
          style={{
            bottom: `${20 + mousePosition.y * 0.05}%`,
            left: `${70 + mousePosition.x * 0.02}%`,
            transform: "translate(-50%, 50%)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className={`relative z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  BONKai
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">powered by Bonk Network</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/faq"
                className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300 relative group"
              >
                FAQ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300"
                asChild
              >
                <Link href="/dashboard?tour=true">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Take a Tour
                </Link>
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/premium">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Height */}
      <section className="relative flex-1 px-6 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 delay-300 ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}>
              <div className="space-y-6">
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 px-4 py-2 animate-bounce">
                  🚀 Now with AI-Powered Insights
                </Badge>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                  The Ultimate{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse">
                    BONK
                  </span>{" "}
                  Intelligence Platform
                </h1>

                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  Advanced analytics, real-time insights, and AI-powered predictions for the BONK ecosystem. Make
                  smarter trading decisions with comprehensive market intelligence trusted by{" "}
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{"thousand of Bonkers"}</span>.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group text-center"
                  asChild
                >
                  <Link href="/dashboard">
                    Launch Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowDemo(true)}
                  className="text-lg px-8 py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Content - Mascot */}
            <div className={`relative transition-all duration-1000 delay-500 ${isLoaded ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}>
              <div className="relative group">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-orange-200 dark:bg-orange-800 rounded-full opacity-60 animate-pulse" />
                <div
                  className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-60 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute top-1/2 -left-12 w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full opacity-40 animate-bounce"
                  style={{ animationDelay: "2s" }}
                />
                <div
                  className="absolute top-1/4 -right-6 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-50 animate-pulse"
                  style={{ animationDelay: "1.5s" }}
                />

                <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse" />
                  <Image
                    src="/images/bonkai-mascot.png"
                    alt="BONKai Mascot - 3D Orange Fox Character"
                    width={500}
                    height={600}
                    className="relative z-10 drop-shadow-2xl animate-float"
                    priority
                  />
                </div>

                <div
                  className="absolute top-20 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-3 animate-float"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">BONK +15.7%</span>
                  </div>
                </div>

                <div
                  className="absolute bottom-32 -left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-3 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Bullish Signal</span>
                  </div>
                </div>

                <div
                  className="absolute top-1/2 right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-3 animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Alert Triggered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo video modal */}
      <VideoModal open={showDemo} onClose={() => setShowDemo(false)} src="/videos/bonk-demo.mp4" />
    </div>
  )
}

function VideoModal({ open, onClose, src }: { open: boolean; onClose: () => void; src: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-xl bg-black shadow-xl overflow-hidden relative">
          <div className="relative aspect-video">
            <video
              src={src}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/90 hover:text-white text-xl"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
