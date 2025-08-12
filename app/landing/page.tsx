"use client"

import Link from "next/link"
import {
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Globe,
  MessageCircle,
  HelpCircle,
  Star,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      title: "Real-time Analytics",
      description: "Track BONK ecosystem metrics, sentiment, and market movements in real-time",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "AI-Powered Insights",
      description: "Get intelligent analysis and predictions powered by advanced AI algorithms",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure & Reliable",
      description: "Built with security-first approach and reliable data sources",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Community Driven",
      description: "Connect with the BONK community and share insights",
    },
  ]

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Trader",
      content: "BONKai has revolutionized how I track and analyze the BONK ecosystem. The insights are incredible!",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Crypto Analyst",
      content: "The AI-powered sentiment analysis helps me make better trading decisions. Highly recommended!",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Community Manager",
      content: "Perfect tool for understanding community sentiment and tracking ecosystem growth.",
      rating: 5,
    },
  ]

  const pricingFeatures = [
    "Real-time BONK ecosystem tracking",
    "Basic sentiment analysis",
    "Community insights",
    "Price alerts",
    "Mobile responsive design",
  ]

  const premiumFeatures = [
    "Advanced AI-powered analytics",
    "Whale movement tracking",
    "Custom alert system",
    "API access",
    "Priority support",
    "Advanced portfolio tools",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200">
              🚀 Now Live - BONK Ecosystem Analytics
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              The Ultimate{" "}
              <span className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                BONK Analytics
              </span>{" "}
              Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover, analyze, and track the entire BONK ecosystem with AI-powered insights, real-time data, and
              comprehensive analytics tools designed for the modern crypto trader.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/faq">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 text-lg bg-transparent border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  FAQ
                </Button>
              </Link>
              <Link href="/dashboard?tour=true">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg bg-transparent">
                  Take a Tour
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/premium">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 text-lg bg-transparent border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Powerful Features for BONK Enthusiasts
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Everything you need to stay ahead in the BONK ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Trusted by BONK Community</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">See what our users are saying about BONKai</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Choose Your Plan</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Get started for free or unlock premium features
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free Access</CardTitle>
                <div className="text-3xl font-bold">
                  $0<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Perfect for getting started</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signin">
                  <Button className="w-full bg-transparent" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-orange-200 dark:border-orange-800">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium Access</CardTitle>
                <div className="text-3xl font-bold">
                  Token Gated
                  <span className="text-lg font-normal text-gray-500 block">800K nBONK or 2M BONK</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">For serious BONK enthusiasts</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[...pricingFeatures, ...premiumFeatures].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/premium">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              Ready to Explore the BONK Ecosystem?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust BONKai for their BONK ecosystem analytics and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/faq">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg bg-transparent"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  FAQ
                </Button>
              </Link>
              <Link href="/dashboard?tour=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg bg-transparent"
                >
                  Take a Tour
                  <Globe className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/premium">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

