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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">BONK Analytics Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights for the BONK ecosystem
          </p>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Sidebar - Market Data & Stats */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Current Price Card */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(getCurrentPrice())}
                </div>
              <div className={`flex items-center text-sm ${get24hChange() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {get24hChange() >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatPercentage(Math.abs(get24hChange()))}%
              </div>
            </CardContent>
          </Card>

          {/* Market Cap Card */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${formatNumber(getMarketCap(), 1e9, 'B')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Rank #{getMarketRank() || 'N/A'}
              </div>
            </CardContent>
          </Card>

          {/* 24h Volume Card */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">24h Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ${formatNumber(getVolume24h(), 1e6, 'M')}
              </div>
            </CardContent>
          </Card>

          {/* Supply Info Card */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Supply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Circulating:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {formatNumber(getCirculatingSupply(), 1e9, 'B')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Max:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {formatNumber(getMaxSupply(), 1e9, 'B')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* High/Low Card */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">24h Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400">H:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  ${formatPrice(getHigh24h())}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-red-600 dark:text-red-400">L:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  ${formatPrice(getLow24h())}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Main Content */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-orange-50 dark:bg-orange-950">
              <TabsTrigger value="letsbonk" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                <Globe className="h-4 w-4 mr-2" />
                Ecosystem
              </TabsTrigger>
              <TabsTrigger value="markets" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                <Building2 className="h-4 w-4 mr-2" />
                Markets
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                <Newspaper className="h-4 w-4 mr-2" />
                News
              </TabsTrigger>
            </TabsList>

            <TabsContent value="letsbonk" className="space-y-4">
              <ComprehensiveBONKDashboard />
            </TabsContent>
          
            <TabsContent value="markets" className="space-y-4">
          <EnhancedMarketsDashboard />
              <EnhancedMarketsTable />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <SupplyChart />
              <VolumeHeatmap />
              <SentimentTrendChart bonkData={bonkData} />
              <MindshareRadarChart bonkData={bonkData} />
              <SocialWordCloud bonkData={bonkData} />
              <WhaleMovementTracker bonkData={bonkData} />
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <NewsUpdates />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Quick Actions & Info */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* Quick Actions */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on CoinGecko
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                <Activity className="h-4 w-4 mr-2" />
                Trading View
              </Button>
            </CardContent>
          </Card>

          {/* Market Status */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Market Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Active Trading</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-600 dark:text-orange-400">Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Coins className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">CoinGecko</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">Market Data</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
