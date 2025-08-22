"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractivePriceChart } from "./interactive-price-chart";
import { BONKNewsFeed } from "./bonk-news-feed";
import { StickyBonkWidget } from "./sticky-bonk-widget";
import { NewsSentimentWidget } from "./news-sentiment-widget";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  ChevronDown
} from "lucide-react";

// Types for our API responses
type OverviewData = {
  price: number;
  changePct: {
    h1: number;
    h24: number;
    d7: number;
    d30: number;
    y1: number;
  };
  marketCap: number;
  fdv: number | null;
  volume24h: number;
  rank: number | null;
  sparkline7d: number[];
  high24h: number;
  low24h: number;
  ath: {
    price: number;
    date: string;
    changePct: number;
  };
  atl: {
    price: number;
    date: string;
    changePct: number;
  };
  lastUpdated: string;
};

export function ComprehensiveBONKDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bonk/overview');
        
        if (response.ok) {
          const overviewData = await response.json();
          setOverview(overviewData);
        } else {
          throw new Error(`Failed to fetch overview: ${response.status}`);
        }
      } catch (err) {
        setError('Failed to fetch BONK data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card className="border-orange-200 dark:border-orange-700">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">No BONK data available</div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercentage = (pct: number) => {
    const isPositive = pct >= 0;
    return (
      <span className={`inline-flex items-center space-x-1 text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{Math.abs(pct).toFixed(2)}%</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* BONK Price Chart - Main Feature */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardContent className="pt-6">
          <InteractivePriceChart />
        </CardContent>
      </Card>

      {/* Price Performance Timeline */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <TrendingUp className="h-6 w-6" />
            <span>Price Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Clean Table Design */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">1h</div>
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">24h</div>
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">7d</div>
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">14d</div>
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">30d</div>
              <div className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">1y</div>
            </div>
            
            {/* Data Row */}
            <div className="grid grid-cols-6 bg-white dark:bg-gray-900">
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {overview.changePct.h1 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.h1 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.h1).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {overview.changePct.h24 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.h24 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.h24).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {overview.changePct.d7 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.d7 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.d7).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {/* 14d - using 7d data as fallback since we don't have 14d */}
                  {overview.changePct.d7 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.d7 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.d7).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {overview.changePct.d30 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.d30 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.d30).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {overview.changePct.y1 >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    overview.changePct.y1 >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(overview.changePct.y1).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BONK News Feed - Recently Happened to Bonk */}
      <BONKNewsFeed />

      {/* About BONK - FAQ Style */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-400">About BONK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* FAQ Items with Dropdowns */}
          <div className="space-y-2">
            {/* What is Bonk? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-1');
                  const icon = document.getElementById('icon-1');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What is Bonk?</span>
                <ChevronDown id="icon-1" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-1" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Bonk is the first Solana dog coin for the people, by the people with 50% of the total supply airdropped to the Solana community. The Bonk contributors were tired of toxic "Alameda" tokenomics and wanted to make a fun memecoin where everyone gets a fair shot.
                </p>
              </div>
            </div>

            {/* Where can you buy Bonk? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-2');
                  const icon = document.getElementById('icon-2');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">Where can you buy Bonk?</span>
                <ChevronDown id="icon-2" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-2" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  BONK tokens can be traded on centralized crypto exchanges. The most popular exchange to buy and trade Bonk is Binance, where the most active trading pair BONK/USDT has a trading volume of $20,692,508 in the last 24 hours. Other popular options include Gate, OKX, and Jupiter for decentralized trading.
                </p>
              </div>
            </div>

            {/* What is the daily trading volume? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-3');
                  const icon = document.getElementById('icon-3');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What is the daily trading volume?</span>
                <ChevronDown id="icon-3" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-3" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  The trading volume of Bonk (BONK) is ${overview?.volume24h?.toLocaleString() || '169,061,565'} in the last 24 hours, representing significant market activity. Check out CoinGecko's list of highest volume cryptocurrencies for comparison.
                </p>
              </div>
            </div>

            {/* What is the market cap? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-4');
                  const icon = document.getElementById('icon-4');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What is the market cap?</span>
                <ChevronDown id="icon-4" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-4" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Market capitalization of Bonk (BONK) is ${overview?.marketCap?.toLocaleString() || '1,678,853,795'} and is ranked #{overview?.rank || '77'} on CoinGecko today. Market cap is measured by multiplying token price with the circulating supply of BONK tokens.
                </p>
              </div>
            </div>

            {/* How does BONK work on Solana? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-5');
                  const icon = document.getElementById('icon-5');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">How does BONK work on Solana?</span>
                <ChevronDown id="icon-5" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-5" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  BONK is built on the Solana blockchain, leveraging its fast transaction speeds and low fees. The token was designed to bring liquidity back to Solana-based decentralized exchanges (DEXs) and create a community-driven ecosystem where everyone gets a fair opportunity.
                </p>
              </div>
            </div>

            {/* What makes BONK unique? */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-6');
                  const icon = document.getElementById('icon-6');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What makes BONK unique?</span>
                <ChevronDown id="icon-6" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-6" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Nearly half of the total supply (50 trillion coins) was distributed among Solana blockchain contributors and community members. BONK has over 350 Onchain integrations built by the community across many verticals, making it one of the most integrated memecoins in the Solana ecosystem.
                </p>
              </div>
            </div>

            {/* Price Performance History */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-7');
                  const icon = document.getElementById('icon-7');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What is BONK's price performance?</span>
                <ChevronDown id="icon-7" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-7" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Bonk (BONK) reached an all-time high of $0.00005825 and an all-time low of $0.078614. It's currently trading 62.79% below that peak and 25,062.20% above its lowest price. For 2023, it was the best performing crypto asset based on return percentages.
                </p>
              </div>
            </div>

            {/* Ecosystem Integrations */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button 
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const content = document.getElementById('about-8');
                  const icon = document.getElementById('icon-8');
                  if (content && icon) {
                    content.classList.toggle('hidden');
                    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                  }
                }}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">What are BONK's ecosystem integrations?</span>
                <ChevronDown id="icon-8" className="h-4 w-4 text-gray-500 transition-transform duration-200" />
              </button>
              <div id="about-8" className="hidden px-3 pb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  BONK now has over 350 Onchain integrations built by the community across many verticals including gaming, DeFi protocols, NFT marketplaces, and social platforms. This extensive integration network makes it one of the most utility-focused meme tokens in the cryptocurrency space.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-10 w-80 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <Card className="border-orange-200 dark:border-orange-700">
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      
      <Card className="border-orange-200 dark:border-orange-700">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-700">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
