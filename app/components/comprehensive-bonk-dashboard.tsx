"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractivePriceChart } from "./interactive-price-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Target,
  Globe,
  Twitter,
  Github,
  ExternalLink,
  Calendar,
  Users,
  Star,
  GitBranch,
  GitCommit,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
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

type ProfileData = {
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
  supply: {
    circulating: number;
    total: number | null;
    max: number | null;
  };
  links: {
    website?: string;
    twitter?: string;
    github?: string[];
    subreddit?: string;
    telegram?: string;
  };
  categories: string[];
  sentiment: {
    upPct: number;
    downPct: number;
  };
  community: {
    twitterFollowers?: number;
    redditSubs?: number;
    telegramUsers?: number;
  };
  developer: {
    stars?: number;
    forks?: number;
    commits4w?: number;
    totalIssues?: number;
    closedIssues?: number;
    pullRequests?: number;
  };
  description: string;
  lastUpdated: string;
};

type TickersData = {
  venues: Array<{
    exchange: string;
    pair: string;
    price: number;
    volume24h: number;
    spreadPct?: number;
    trustScore?: string;
    tradeUrl?: string;
    lastTraded: string;
  }>;
  byExchange: Array<{
    exchange: string;
    volume24h: number;
    pairCount: number;
  }>;
  summary: {
    totalVenues: number;
    totalVolume24h: number;
    avgPrice: number;
    avgSpread: number;
    topExchanges: string[];
  };
  lastUpdated: string;
};

export function ComprehensiveBONKDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tickers, setTickers] = useState<TickersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, profileRes, tickersRes] = await Promise.all([
          fetch('/api/bonk/overview'),
          fetch('/api/bonk/profile'),
          fetch('/api/bonk/tickers')
        ]);

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (tickersRes.ok) {
          const tickersData = await tickersRes.json();
          setTickers(tickersData);
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

  if (!overview || !profile) {
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">BONK Comprehensive Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time data from CoinGecko • Last updated: {formatDate(overview.lastUpdated)}
        </p>
      </div>

      {/* Price & Market Overview */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <DollarSign className="h-6 w-6" />
            <span>Price & Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price */}
            <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(overview.price)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
              <div className="mt-2">
                {formatPercentage(overview.changePct.h24)}
              </div>
            </div>

            {/* Market Cap */}
            <div className="text-center p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${formatNumber(overview.marketCap)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rank #{overview.rank}</div>
            </div>

            {/* 24h Volume */}
            <div className="text-center p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${formatNumber(overview.volume24h)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Volume</div>
            </div>

            {/* FDV */}
            <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overview.fdv ? `$${formatNumber(overview.fdv)}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fully Diluted Value</div>
            </div>
          </div>

          {/* Price Changes */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Price Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">1h</div>
                <div className="flex items-center justify-center">{formatPercentage(overview.changePct.h1)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">24h</div>
                <div className="flex items-center justify-center">{formatPercentage(overview.changePct.h24)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">7d</div>
                <div className="flex items-center justify-center">{formatPercentage(overview.changePct.d7)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">30d</div>
                <div className="flex items-center justify-center">{formatPercentage(overview.changePct.d30)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">1y</div>
                <div className="flex items-center justify-center">{formatPercentage(overview.changePct.y1)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BONK Price Chart */}
      <InteractivePriceChart />

      {/* ATH/ATL & Supply Information */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <Target className="h-6 w-6" />
            <span>ATH/ATL & Supply Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ATH */}
            <div className="p-4 border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatPrice(overview.ath.price)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">All Time High</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(overview.ath.date)}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                {overview.ath.changePct.toFixed(2)}% from ATH
              </div>
            </div>

            {/* ATL */}
            <div className="p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatPrice(overview.atl.price)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">All Time Low</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(overview.atl.date)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {overview.atl.changePct.toFixed(2)}% from ATL
              </div>
            </div>

            {/* Circulating Supply */}
            <div className="p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(profile.supply.circulating)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Circulating Supply</div>
            </div>

            {/* Max Supply */}
            <div className="p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {profile.supply.max ? formatNumber(profile.supply.max) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Supply</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories & Links */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <Globe className="h-6 w-6" />
            <span>Categories & Official Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Official Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Official Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.links.website && (
                <Button variant="outline" asChild className="justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                  <a href={profile.links.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
              
              {profile.links.twitter && (
                <Button variant="outline" asChild className="justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                  <a href={`https://twitter.com/${profile.links.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}

              {profile.links.github && profile.links.github.length > 0 && (
                <Button variant="outline" asChild className="justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                  <a href={profile.links.github[0]} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}

              {profile.links.subreddit && (
                <Button variant="outline" asChild className="justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                  <a href={profile.links.subreddit} target="_blank" rel="noopener noreferrer">
                    <Users className="h-4 w-4 mr-2" />
                    Reddit
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social & Community Metrics */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <Users className="h-6 w-6" />
            <span>Social & Community Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sentiment */}
            <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Community Sentiment</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Bullish</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.sentiment.upPct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 dark:text-red-400">Bearish</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.sentiment.downPct}%</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Community Stats</h3>
              <div className="space-y-2">
                {profile.community.twitterFollowers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 dark:text-blue-400">Twitter</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.community.twitterFollowers)}</span>
                  </div>
                )}
                {profile.community.redditSubs && (
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 dark:text-orange-400">Reddit</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.community.redditSubs)}</span>
                  </div>
                )}
                {profile.community.telegramUsers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-500 dark:text-blue-300">Telegram</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.community.telegramUsers)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Developer Stats */}
            <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Developer Activity</h3>
              <div className="space-y-2">
                {profile.developer.stars && (
                  <div className="flex justify-between items-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.developer.stars)}</span>
                  </div>
                )}
                {profile.developer.forks && (
                  <div className="flex justify-between items-center">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.developer.forks)}</span>
                  </div>
                )}
                {profile.developer.commits4w && (
                  <div className="flex justify-between items-center">
                    <GitCommit className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatNumber(profile.developer.commits4w)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Venues & Market Distribution */}
      {tickers && (
        <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
              <Activity className="h-6 w-6" />
              <span>Trading Venues & Market Distribution</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {tickers.summary.totalVenues} venues • Total 24h Volume: ${formatNumber(tickers.summary.totalVolume24h)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="venues" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-orange-50 dark:bg-orange-950">
                <TabsTrigger value="venues" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">Trading Venues</TabsTrigger>
                <TabsTrigger value="exchanges" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">By Exchange</TabsTrigger>
              </TabsList>
              
              <TabsContent value="venues" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tickers.venues.slice(0, 10).map((venue, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border border-orange-200 dark:border-orange-700 rounded bg-orange-50 dark:bg-orange-950">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{venue.exchange}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">{venue.pair}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(venue.price)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">${formatNumber(venue.volume24h)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="exchanges" className="mt-4">
                <div className="space-y-2">
                  {tickers.byExchange.slice(0, 10).map((exchange, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border border-orange-200 dark:border-orange-700 rounded bg-orange-50 dark:bg-orange-950">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{exchange.exchange}</span>
                      <div className="text-right">
                        <div className="font-medium text-gray-800 dark:text-gray-200">${formatNumber(exchange.volume24h)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{exchange.pairCount} pairs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-400">About BONK</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {profile.description}
          </p>
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
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
                <Skeleton className="h-8 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-orange-200 dark:border-orange-700">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
