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
import { TokenomicsDashboard } from "./tokenomics-dashboard";
import { HoldersDashboard } from "./holders-dashboard";
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
      const response = await fetch('/api/bonk/overview');
      if (response.ok) {
        const data = await response.json();
        setBonkData(data);
      }
    } catch (error) {
      console.error('Failed to fetch BONK data:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BONK Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for the BONK ecosystem
          </p>
        </div>
        <Button onClick={fetchBonkData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="letsbonk" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            LetsBonk.fun
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="letsbonk" className="space-y-6">
          {/* LetsBonk.fun Content */}
          <Card>
            <CardHeader>
              <CardTitle>LetsBonk.fun Ecosystem</CardTitle>
              <CardDescription>
                Discover and track the latest projects in the BONK ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BonkEcosystemTicker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Comprehensive BONK Dashboard - Main Overview */}
          <ComprehensiveBONKDashboard />
          
          {/* Interactive Price Chart */}
          <InteractivePriceChart />
          
          {/* Enhanced Markets Dashboard */}
          <EnhancedMarketsDashboard />
          
          {/* Tokenomics Dashboard */}
          <TokenomicsDashboard />
          
          {/* Holders Dashboard */}
          <HoldersDashboard />
          
          {/* Supply Analysis */}
          <SupplyChart />
          
          {/* News & Updates */}
          <NewsUpdates />
          
          {/* Existing Analytics Components - Preserved as requested */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VolumeHeatmap bonkData={bonkData} />
            <SentimentTrendChart bonkData={bonkData} />
            <MindshareRadarChart bonkData={bonkData} />
            <SocialWordCloud bonkData={bonkData} />
          </div>
          
          {/* Whale Movement Tracker */}
          <WhaleMovementTracker bonkData={bonkData} />
          
          {/* Advanced Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Advanced Analytics Tools
              </CardTitle>
              <CardDescription>
                Professional-grade tools for deep market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Technical Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Trend Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Globe className="w-6 h-6" />
                  <span className="text-sm">Market Research</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
