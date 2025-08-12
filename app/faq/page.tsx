"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ChevronDown, ChevronUp, ArrowLeft, HelpCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqData: FAQItem[] = [
  {
    id: "what-is-bonkai",
    question: "What is BONKai and how does it work?",
    answer:
      "BONKai is an advanced AI-powered analytics platform specifically designed for the BONK ecosystem. It combines real-time market data, social sentiment analysis, whale movement tracking, and predictive AI insights to help traders make informed decisions. Our platform aggregates data from over 25 sources including social media, trading platforms, and blockchain analytics to provide comprehensive market intelligence.",
    category: "General",
    tags: ["platform", "overview", "features"],
  },
  {
    id: "ai-copilot",
    question: "How does the BONK Copilot assistant work?",
    answer:
      "Our BONK Copilot is powered by advanced language models trained on Web3 and cryptocurrency data. It can analyze market trends, answer questions about BONK, provide trading insights, and help interpret complex market data. The AI assistant learns from real-time market conditions and can provide personalized recommendations based on your trading patterns and preferences.",
    category: "AI & Analytics",
    tags: ["ai", "copilot", "assistant", "analysis"],
  },
  {
    id: "meta-search",
    question: "What is MetaSearch and how many sources does it cover?",
    answer:
      "MetaSearch is our comprehensive search engine that scans over 1,247 premium Web3 sources including news sites, social media platforms, forums, and research publications. It uses AI-powered relevance ranking to deliver the most pertinent BONK-related content. Sources include CoinDesk, CoinTelegraph, Twitter, Reddit, Discord, Telegram channels, and specialized DeFi research platforms.",
    category: "Features",
    tags: ["search", "sources", "news", "data"],
  },
  {
    id: "sentiment-analysis",
    question: "How accurate is the sentiment analysis?",
    answer:
      "Our sentiment analysis achieves 94% accuracy by combining multiple AI models and natural language processing techniques. We analyze text from social media, news articles, and community discussions in real-time. The system considers context, sarcasm detection, and crypto-specific terminology to provide nuanced sentiment scores ranging from highly bearish to highly bullish.",
    category: "AI & Analytics",
    tags: ["sentiment", "accuracy", "analysis", "ai"],
  },
  {
    id: "whale-tracking",
    question: "What whale movements and transactions are tracked?",
    answer:
      "We monitor large BONK transactions (typically >1B BONK tokens) across major exchanges and wallets. Our system tracks wallet clustering, exchange flows, and identifies potential market-moving transactions. We provide alerts for significant whale activities including large purchases, sales, and transfers that could impact price movements.",
    category: "Features",
    tags: ["whale", "tracking", "transactions", "alerts"],
  },
  {
    id: "pricing-plans",
    question: "What are the pricing plans and features included?",
    answer:
      "BONKai offers a freemium model with basic analytics and limited AI queries. Premium plans start via holding 800,000 nBONK or 2,000,000 BONK with unlimited AI interactions, advanced analytics, real-time alerts, and priority support. No enterprise plans yet that will include API access, custom dashboards, and dedicated account management. All plans include core features like price tracking and basic sentiment analysis.",
    category: "Pricing & Plans",
    tags: ["pricing", "plans", "features", "subscription"],
  },
  {
    id: "data-accuracy",
    question: "How often is the data updated and how accurate is it?",
    answer:
      "Market data is updated every second for price information and every 30 seconds for social metrics. We maintain 99.9% uptime with sub-100ms response times. Data accuracy is ensured through multiple source verification, outlier detection algorithms, and real-time data validation. Historical data is backfilled and continuously verified for consistency.",
    category: "Technical",
    tags: ["data", "accuracy", "updates", "real-time"],
  },
  {
    id: "alerts-notifications",
    question: "How do smart alerts and notifications work?",
    answer:
      "Smart alerts use machine learning to identify significant market events, price movements, sentiment shifts, and whale activities. You can customize alerts for price thresholds, volume spikes, sentiment changes, and social media buzz. Notifications are delivered via email, SMS, Discord, or Telegram with customizable frequency and priority levels.",
    category: "Features",
    tags: ["alerts", "notifications", "smart", "customization"],
  },
  {
    id: "mobile-app",
    question: "Is there a mobile app available?",
    answer:
      "Currently, BONKai is optimized as a progressive web app (PWA) that works seamlessly on mobile devices. You can add it to your home screen for app-like experience. Native iOS and Android apps are in development and expected to launch in Q2 2024 with push notifications, offline data caching, and mobile-optimized charts.",
    category: "Technical",
    tags: ["mobile", "app", "pwa", "development"],
  },
  {
    id: "api-integration",
    question: "Does BONKai offer API access for developers?",
    answer:
      "Yes, we provide RESTful APIs and WebSocket connections for real-time data streaming. Our API includes endpoints for price data, sentiment scores, social metrics, and whale tracking. Rate limits vary by plan (1000 requests/hour for Premium, unlimited for Enterprise). Comprehensive documentation, SDKs for popular languages, and sandbox environment are available.",
    category: "Technical",
    tags: ["api", "developers", "integration", "websocket"],
  },
]

const categories = ["All", "General", "AI & Analytics", "Features", "Pricing & Plans", "Technical"]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = document.documentElement.classList.contains("dark")
    setIsDarkMode(darkMode)
  }, [])

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const getCategoryCount = (category: string) => {
    if (category === "All") return faqData.length
    return faqData.filter((faq) => faq.category === category).length
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 ${isDarkMode ? "dark" : ""}`}
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🧠</span>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                    BONKai
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">FAQ</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/dashboard?tour=true">
                
              </Link>
              <Link href="/">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about BONKai, our AI-powered BONK analytics platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                }`}
              >
                {category}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getCategoryCount(category)}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? "s" : ""} for "{searchTerm}"
            </p>
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or selecting a different category.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(faq.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        {faq.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg font-semibold text-left">{faq.question}</CardTitle>
                    </div>
                    <div className="ml-4">
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedItems.includes(faq.id) && (
                  <CardContent className="pt-0">
                    <CardDescription className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Still have questions?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Can't find what you're looking for? Take our interactive tour or reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard?tour=true">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Take Interactive Tour
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="bg-transparent">
                    Launch Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

