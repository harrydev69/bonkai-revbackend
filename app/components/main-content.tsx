// app/components/main-content.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, RefreshCw, ExternalLink, Globe, Building2, Coins, Newspaper } from "lucide-react";

// Import existing components
import { VolumeHeatmap } from "./volume-heatmap";
import { SentimentTrendChart } from "./sentiment-trend-chart";
import { MindshareRadarChart } from "./mindshare-radar-chart";
import { SocialWordCloud } from "./social-word-cloud";
import { WhaleMovementTracker } from "./whale-movement-tracker";

// Import new comprehensive dashboard components
import { ComprehensiveBONKDashboard } from "./comprehensive-bonk-dashboard";
import { InteractivePriceChart } from "./interactive-price-chart";
import { EnhancedMarketsTable } from "./enhanced-markets-table";
import { SupplyChart } from "./supply-chart";
import { NewsUpdates } from "./news-updates";

import { EnhancedMarketsDashboard } from "./enhanced-markets-dashboard";

// Import Bonk ecosystem ticker
import { BonkEcosystemTicker } from "./bonk-ecosystem-ticker";

export function MainContent() {
  const [activeTab, setActiveTab] = useState("letsbonk");
  const [bonkData, setBonkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial BONK data
    fetchBonkData();
  }, []);

  const fetchBonkData = async () => {
    try {
      setLoading(true);
      // Try overview first, then fallback to price API
      const response = await fetch('/api/bonk/overview');
      if (response.ok) {
        const data = await response.json();
        console.log('BONK Overview Data:', data);
        setBonkData(data);
      } else {
        console.error('Failed to fetch BONK overview:', response.status);
        // Fallback: try to get price data
        const priceResponse = await fetch('/api/bonk/price');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('BONK Price Data:', priceData);
          setBonkData(priceData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch BONK data:', error);
      // Fallback: try to get price data
      try {
        const priceResponse = await fetch('/api/bonk/price');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('BONK Price Data (fallback):', priceData);
          setBonkData(priceData);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined, divisor: number, suffix: string) => {
    if (!value || isNaN(value)) return '0.00' + suffix;
    return (value / divisor).toFixed(2) + suffix;
  };

  // Helper function to safely format price
  const formatPrice = (price: number | undefined) => {
    if (!price || isNaN(price)) return '0.00000000';
    return price.toFixed(8);
  };

  // Helper function to safely format percentage
  const formatPercentage = (percent: number | undefined) => {
    if (!percent || isNaN(percent)) return '0.00';
    return percent.toFixed(2);
  };

  // Get the correct price data based on API response structure
  const getCurrentPrice = () => {
    if (bonkData?.price) return bonkData.price; // Price API
    if (bonkData?.current_price) return bonkData.current_price; // Overview API
    return 0;
  };

  // Get the correct 24h change data
  const get24hChange = () => {
    if (bonkData?.change24h !== undefined) return bonkData.change24h; // Price API
    if (bonkData?.changePct?.h24 !== undefined) return bonkData.changePct.h24; // Overview API
    return 0;
  };

  // Get the correct market cap data
  const getMarketCap = () => {
    if (bonkData?.marketCap) return bonkData.marketCap; // Price API
    if (bonkData?.market_cap) return bonkData.market_cap; // Overview API
    return 0;
  };

  // Get the correct volume data
  const getVolume24h = () => {
    if (bonkData?.volume24h) return bonkData.volume24h; // Price API
    if (bonkData?.total_volume) return bonkData.total_volume; // Overview API
    return 0;
  };

  // Get the correct supply data
  const getCirculatingSupply = () => {
    if (bonkData?.circulatingSupply) return bonkData.circulatingSupply; // Price API
    if (bonkData?.circulating_supply) return bonkData.circulating_supply; // Overview API
    return 0;
  };

  // Get the correct high/low price data
  const getHigh24h = () => {
    if (bonkData?.high24h) return bonkData.high24h; // Price API
    if (bonkData?.high_24h) return bonkData.high_24h; // Overview API
    return 0;
  };

  const getLow24h = () => {
    if (bonkData?.low24h) return bonkData.low24h; // Price API
    if (bonkData?.low_24h) return bonkData.low_24h; // Overview API
    return 0;
  };

  // Get the correct total/max supply data
  const getTotalSupply = () => {
    if (bonkData?.totalSupply) return bonkData.totalSupply; // Price API
    if (bonkData?.total_supply) return bonkData.total_supply; // Overview API
    return 0;
  };

  const getMaxSupply = () => {
    if (bonkData?.maxSupply) return bonkData.maxSupply; // Price API
    if (bonkData?.max_supply) return bonkData.max_supply; // Overview API
    return 0;
  };

  // Get the correct fully diluted valuation
  const getFullyDilutedValuation = () => {
    if (bonkData?.fullyDilutedValuation) return bonkData.fullyDilutedValuation; // Price API
    if (bonkData?.fdv) return bonkData.fdv; // Overview API
    return 0;
  };

  // Get the correct market rank
  const getMarketRank = () => {
    if (bonkData?.marketCapRank) return bonkData.marketCapRank; // Price API
    if (bonkData?.rank) return bonkData.rank; // Overview API
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">BONK Analytics Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Comprehensive analytics and insights for the BONK ecosystem
          </p>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Sidebar - Market Data & Stats */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* BONK Price Card */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Coins className="w-3 h-3 text-purple-500" />
                BONK Price
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4 px-3">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">
                  ${formatPrice(getCurrentPrice())}
                </div>
                <div className={`text-xs ${get24hChange() > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {get24hChange() > 0 ? '+' : ''}
                  {formatPercentage(get24hChange())}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-blue-500" />
                Market Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 px-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Market Cap</span>
                <span className="text-xs font-medium">
                  ${formatNumber(getMarketCap(), 1e9, 'B')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">24h Volume</span>
                <span className="text-xs font-medium">
                  ${formatNumber(getVolume24h(), 1e6, 'M')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Circulating Supply</span>
                <span className="text-xs font-medium">
                  {formatNumber(getCirculatingSupply(), 1e12, 'T')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Total Supply</span>
                <span className="text-xs font-medium">
                  {formatNumber(getTotalSupply(), 1e12, 'T')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Max Supply</span>
                <span className="text-xs font-medium">
                  {formatNumber(getMaxSupply(), 1e12, 'T')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Price Range (24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 px-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">High</span>
                <span className="text-xs font-medium text-green-500">
                  ${formatPrice(getHigh24h())}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Low</span>
                <span className="text-xs font-medium text-red-500">
                  ${formatPrice(getLow24h())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Token Info */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-3 h-3 text-orange-500" />
                Token Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 px-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Market Rank</span>
                <span className="text-xs font-medium">
                  #{getMarketRank() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">FDV</span>
                <span className="text-xs font-medium">
                  ${formatNumber(getFullyDilutedValuation(), 1e9, 'B')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-muted-foreground">Vol/Mkt Cap</span>
                <span className="text-xs font-medium">
                  {(() => {
                    const volume = getVolume24h();
                    const marketCap = getMarketCap();
                    if (volume && marketCap && marketCap > 0) {
                      return ((volume / marketCap) * 100).toFixed(2) + '%';
                    }
                    return 'N/A';
                  })()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-green-500/5 to-teal-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-green-500" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4 px-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-green-500/10 hover:border-green-500/30"
                onClick={() => window.open('https://bonkcoin.com', '_blank')}
              >
                <Globe className="w-3 h-3 mr-1" />
                BONK Website
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-blue-500/10 hover:border-blue-500/30"
                onClick={() => window.open('https://raydium.io/swap/?inputCurrency=sol&outputCurrency=DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', '_blank')}
              >
                <Building2 className="w-3 h-3 mr-1" />
                Buy BONK
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-purple-500/10 hover:border-purple-500/30"
                onClick={() => window.open('https://letsbonk.fun', '_blank')}
              >
                <Coins className="w-3 h-3 mr-1" />
                Let'sBonk
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-orange-500/10 hover:border-orange-500/30"
                onClick={() => window.open('https://solscan.io/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', '_blank')}
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Solscan
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-blue-500/10 hover:border-blue-500/30"
                onClick={() => window.open('https://twitter.com/bonk_inu', '_blank')}
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-green-500/10 hover:border-green-500/30"
                onClick={() => window.open('https://bonkcoin.com', '_blank')}
              >
                <Globe className="w-3 h-3 mr-1" />
                Website
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start h-8 text-xs hover:bg-purple-500/10 hover:border-purple-500/30"
                onClick={() => window.open('https://bonkcoin.com/blog', '_blank')}
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H8"/>
                </svg>
                Blog
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center - Main Chart Area */}
        <div className="lg:col-span-7 space-y-3 md:space-y-4">
          {/* Main BONK Chart */}
          <InteractivePriceChart />
          
          {/* Enhanced Markets Dashboard */}
          <EnhancedMarketsDashboard />

          {/* Community Sentiment */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-3 h-3 text-purple-500" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <SentimentTrendChart bonkData={bonkData} />
            </CardContent>
          </Card>

          {/* Social Trends */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                Social Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <SocialWordCloud bonkData={bonkData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - News Only */}
        <div className="lg:col-span-3 space-y-3 md:space-y-4 pr-4">
          {/* BONK News & Updates */}
          <NewsUpdates />
        </div>
      </div>

      {/* Bottom Section - Additional Components */}
      <div className="space-y-3 md:space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="letsbonk" className="flex items-center gap-2 text-xs md:text-sm">
              <Globe className="w-3 h-3 md:w-4 md:h-4" />
              LetsBonk.fun
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs md:text-sm">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              Advanced Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="letsbonk" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            {/* LetsBonk.fun Content */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm md:text-base">LetsBonk.fun Ecosystem</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Discover and track the latest projects in the BONK ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <BonkEcosystemTicker />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            {/* Comprehensive BONK Dashboard - Main Overview */}
            <ComprehensiveBONKDashboard />
            
            {/* Supply Analysis */}
            <SupplyChart />
            
            {/* Whale Movement Tracker */}
            <WhaleMovementTracker bonkData={bonkData} />
            
            {/* Advanced Tools */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Activity className="w-3 h-3 md:w-4 md:h-4" />
                  Advanced Analytics Tools
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Professional-grade tools for deep market analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <Button variant="outline" className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 md:gap-2">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">Technical Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 md:gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">Trend Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-14 md:h-16 flex flex-col items-center justify-center gap-1 md:gap-2">
                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">Market Research</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
