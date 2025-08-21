"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!overview || !profile) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">No BONK data available</div>
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
      <span className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BONK Comprehensive Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time data from CoinGecko • Last updated: {formatDate(overview.lastUpdated)}
        </p>
      </div>

      {/* Price & Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <span>Price & Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(overview.price)}
              </div>
              <div className="text-sm text-gray-600">Current Price</div>
              <div className="mt-2">
                {formatPercentage(overview.changePct.h24)}
              </div>
            </div>

            {/* Market Cap */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${formatNumber(overview.marketCap)}
              </div>
              <div className="text-sm text-gray-600">Market Cap</div>
              <div className="text-xs text-gray-500">Rank #{overview.rank}</div>
            </div>

            {/* 24h Volume */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${formatNumber(overview.volume24h)}
              </div>
              <div className="text-sm text-gray-600">24h Volume</div>
            </div>

            {/* FDV */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {overview.fdv ? `$${formatNumber(overview.fdv)}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Fully Diluted Value</div>
            </div>
          </div>

          {/* Price Changes */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">1h</div>
              <div className="font-semibold">{formatPercentage(overview.changePct.h1)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">24h</div>
              <div className="font-semibold">{formatPercentage(overview.changePct.h24)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">7d</div>
              <div className="font-semibold">{formatPercentage(overview.changePct.d7)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">30d</div>
              <div className="font-semibold">{formatPercentage(overview.changePct.d30)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">1y</div>
              <div className="font-semibold">{formatPercentage(overview.changePct.y1)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATH/ATL & Supply Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>ATH/ATL & Supply Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ATH */}
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {formatPrice(overview.ath.price)}
              </div>
              <div className="text-sm text-gray-600">All Time High</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(overview.ath.date)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {overview.ath.changePct.toFixed(2)}% from ATH
              </div>
            </div>

            {/* ATL */}
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-red-600">
                {formatPrice(overview.atl.price)}
              </div>
              <div className="text-sm text-gray-600">All Time Low</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(overview.atl.date)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {overview.atl.changePct.toFixed(2)}% from ATL
              </div>
            </div>

            {/* Circulating Supply */}
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {formatNumber(profile.supply.circulating)}
              </div>
              <div className="text-sm text-gray-600">Circulating Supply</div>
            </div>

            {/* Max Supply */}
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {profile.supply.max ? formatNumber(profile.supply.max) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Max Supply</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories & Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-purple-600" />
            <span>Categories & Official Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Official Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Official Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.links.website && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={profile.links.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
              
              {profile.links.twitter && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={`https://twitter.com/${profile.links.twitter}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}

              {profile.links.github && profile.links.github.length > 0 && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={profile.links.github[0]} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}

              {profile.links.subreddit && (
                <Button variant="outline" asChild className="justify-start">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-pink-600" />
            <span>Social & Community Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sentiment */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Community Sentiment</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-600">Bullish</span>
                  <span className="font-semibold">{profile.sentiment.upPct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600">Bearish</span>
                  <span className="font-semibold">{profile.sentiment.downPct}%</span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Community Stats</h3>
              <div className="space-y-2">
                {profile.community.twitterFollowers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Twitter</span>
                    <span className="font-semibold">{formatNumber(profile.community.twitterFollowers)}</span>
                  </div>
                )}
                {profile.community.redditSubs && (
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600">Reddit</span>
                    <span className="font-semibold">{formatNumber(profile.community.redditSubs)}</span>
                  </div>
                )}
                {profile.community.telegramUsers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-500">Telegram</span>
                    <span className="font-semibold">{formatNumber(profile.community.telegramUsers)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Developer Stats */}
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Developer Activity</h3>
              <div className="space-y-2">
                {profile.developer.stars && (
                  <div className="flex justify-between items-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{formatNumber(profile.developer.stars)}</span>
                  </div>
                )}
                {profile.developer.forks && (
                  <div className="flex justify-between items-center">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{formatNumber(profile.developer.forks)}</span>
                  </div>
                )}
                {profile.developer.commits4w && (
                  <div className="flex justify-between items-center">
                    <GitCommit className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{formatNumber(profile.developer.commits4w)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Venues & Market Distribution */}
      {tickers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-indigo-600" />
              <span>Trading Venues & Market Distribution</span>
            </CardTitle>
            <CardDescription>
              {tickers.summary.totalVenues} venues • Total 24h Volume: ${formatNumber(tickers.summary.totalVolume24h)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="venues" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="venues">Trading Venues</TabsTrigger>
                <TabsTrigger value="exchanges">By Exchange</TabsTrigger>
              </TabsList>
              
              <TabsContent value="venues" className="mt-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tickers.venues.slice(0, 10).map((venue, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{venue.exchange}</span>
                        <span className="text-gray-500 ml-2">{venue.pair}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(venue.price)}</div>
                        <div className="text-sm text-gray-500">${formatNumber(venue.volume24h)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="exchanges" className="mt-4">
                <div className="space-y-2">
                  {tickers.byExchange.slice(0, 10).map((exchange, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{exchange.exchange}</span>
                      <div className="text-right">
                        <div className="font-medium">${formatNumber(exchange.volume24h)}</div>
                        <div className="text-sm text-gray-500">{exchange.pairCount} pairs</div>
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
      <Card>
        <CardHeader>
          <CardTitle>About BONK</CardTitle>
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
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 border rounded-lg">
                <Skeleton className="h-8 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
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
