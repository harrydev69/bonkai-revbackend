"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, RefreshCw, Zap, Clock, Database } from 'lucide-react';

// Types for our data
interface PriceData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: number;
  source: string;
}

interface SentimentData {
  score: number;
  change24h: number;
  mentions24h: number;
  lastUpdated: number;
}

interface MarketData {
  totalHolders: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: number;
}

// Custom hooks with advanced caching
function useOptimizedPriceData() {
  return useQuery({
    queryKey: ['bonk', 'price'],
    queryFn: async () => {
      const response = await fetch('/api/bonk/price', {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Price fetch failed: ${response.status}`);
      }
      
      return response.json() as Promise<PriceData>;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Every 30 seconds
    refetchIntervalInBackground: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

function useOptimizedSentimentData() {
  return useQuery({
    queryKey: ['bonk', 'sentiment'],
    queryFn: async () => {
      const response = await fetch('/api/bonk/sentiment', {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Sentiment fetch failed: ${response.status}`);
      }
      
      return response.json() as Promise<SentimentData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Every 5 minutes
    refetchIntervalInBackground: false,
  });
}

function useOptimizedMarketData() {
  return useQuery({
    queryKey: ['bonk', 'market'],
    queryFn: async () => {
      const response = await fetch('/api/bonk/holders?endpoint=overview', {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Market data fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        totalHolders: data.total_holders || 0,
        circulatingSupply: data.circulating_supply || 0,
        totalSupply: data.total_supply || 0,
        lastUpdated: Date.now()
      } as MarketData;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Every 2 minutes
    refetchIntervalInBackground: false,
  });
}

// Performance monitoring hook
function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1)
      }));
    };
  });

  return metrics;
}

// Main dashboard component
export default function OptimizedBonkDashboard() {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const performanceMetrics = usePerformanceMonitor();

  // Data queries with optimized caching
  const priceQuery = useOptimizedPriceData();
  const sentimentQuery = useOptimizedSentimentData();
  const marketQuery = useOptimizedMarketData();

  // Memoized calculations to prevent unnecessary re-renders
  const priceChangeColor = useMemo(() => {
    if (!priceQuery.data?.change24h) return 'text-gray-500';
    return priceQuery.data.change24h >= 0 ? 'text-green-500' : 'text-red-500';
  }, [priceQuery.data?.change24h]);

  const sentimentColor = useMemo(() => {
    if (!sentimentQuery.data?.score) return 'text-gray-500';
    const score = sentimentQuery.data.score;
    if (score >= 60) return 'text-green-500';
    if (score <= 40) return 'text-red-500';
    return 'text-yellow-500';
  }, [sentimentQuery.data?.score]);

  const sentimentText = useMemo(() => {
    if (!sentimentQuery.data?.score) return 'Neutral';
    const score = sentimentQuery.data.score;
    if (score >= 60) return 'Bullish';
    if (score <= 40) return 'Bearish';
    return 'Neutral';
  }, [sentimentQuery.data?.score]);

  // Optimized refresh function
  const handleRefresh = useCallback(async () => {
    setLastRefresh(Date.now());
    
    // Invalidate and refetch all queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bonk', 'price'] }),
      queryClient.invalidateQueries({ queryKey: ['bonk', 'sentiment'] }),
      queryClient.invalidateQueries({ queryKey: ['bonk', 'market'] })
    ]);
  }, [queryClient]);

  // Prefetch data for better UX
  useEffect(() => {
    const prefetchData = async () => {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ['bonk', 'price'],
          queryFn: () => fetch('/api/bonk/price').then(r => r.json())
        }),
        queryClient.prefetchQuery({
          queryKey: ['bonk', 'sentiment'],
          queryFn: () => fetch('/api/bonk/sentiment').then(r => r.json())
        })
      ]);
    };

    prefetchData();
  }, [queryClient]);

  // Loading states
  const isLoading = priceQuery.isLoading || sentimentQuery.isLoading || marketQuery.isLoading;
  const hasErrors = priceQuery.error || sentimentQuery.error || marketQuery.error;

  if (hasErrors) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priceQuery.error && <p>Price: {priceQuery.error.message}</p>}
            {sentimentQuery.error && <p>Sentiment: {sentimentQuery.error.message}</p>}
            {marketQuery.error && <p>Market: {marketQuery.error.message}</p>}
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Renders</p>
              <p className="font-mono">{performanceMetrics.renderCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Render</p>
              <p className="font-mono">{performanceMetrics.lastRenderTime.toFixed(2)}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Render</p>
              <p className="font-mono">{performanceMetrics.averageRenderTime.toFixed(2)}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BONK Price</CardTitle>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {priceQuery.data?.lastUpdated ? 
              new Date(priceQuery.data.lastUpdated).toLocaleTimeString() : 
              '--:--:--'
            }
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${priceQuery.data?.price?.toFixed(6) || '0.000000'}
              </div>
              <div className={`flex items-center text-sm ${priceChangeColor}`}>
                {priceQuery.data?.change24h ? (
                  <>
                    {priceQuery.data.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {priceQuery.data.change24h.toFixed(2)}%
                  </>
                ) : (
                  '0.00%'
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Social Sentiment</CardTitle>
          <Badge variant="outline" className="text-xs">
            <Database className="w-3 h-3 mr-1" />
            {sentimentQuery.data?.lastUpdated ? 
              new Date(sentimentQuery.data.lastUpdated).toLocaleTimeString() : 
              '--:--:--'
            }
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {sentimentQuery.data?.score || 0}
              </div>
              <div className={`text-sm ${sentimentColor}`}>
                {sentimentText}
              </div>
              <div className="text-xs text-muted-foreground">
                {sentimentQuery.data?.mentions24h || 0} mentions (24h)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Overview</CardTitle>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {marketQuery.data?.lastUpdated ? 
              new Date(marketQuery.data.lastUpdated).toLocaleTimeString() : 
              '--:--:--'
            }
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Holders:</span>
                <span className="font-mono">{marketQuery.data?.totalHolders?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Circulating Supply:</span>
                <span className="font-mono">{(marketQuery.data?.circulatingSupply || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-mono">{(marketQuery.data?.totalSupply || 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="w-full max-w-xs"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Last Refresh Info */}
      <div className="text-center text-xs text-muted-foreground">
        Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
      </div>
    </div>
  );
}
