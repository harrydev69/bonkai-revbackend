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
        </CardContent>
      </Card>

      {/* About BONK - Brief Description */}
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
