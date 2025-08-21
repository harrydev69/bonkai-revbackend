"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, ExternalLink, Building2, BarChart3, RefreshCw, Search, Filter } from "lucide-react";

type MarketVenue = {
  exchange: string;
  pair: string;
  price: number;
  volume24h: number;
  spreadPct: number;
  trustScore: string;
  tradeUrl: string;
  lastUpdated: string;
  isStale: boolean;
  isAnomaly: boolean;
};

type ExchangeVolume = {
  exchange: string;
  totalVolume: number;
  pairCount: number;
  avgPrice: number;
  trustScore: string;
};

type MarketsPayload = {
  venues: MarketVenue[];
  byExchange: ExchangeVolume[];
  summary: {
    totalVenues: number;
    totalVolume: number;
    avgPrice: number;
    topExchange: string;
    topVolume: number;
    activeExchanges: number;
  };
  metadata: {
    lastUpdated: string;
    totalPairs: number;
    stalePairs: number;
    anomalyPairs: number;
  };
};

export function EnhancedMarketsTable() {
  const [marketsData, setMarketsData] = useState<MarketsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "price" | "exchange" | "spread">("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterExchange, setFilterExchange] = useState<string>("all");

  useEffect(() => {
    fetchMarketsData();
  }, []);

  const fetchMarketsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bonk/markets');
      if (!response.ok) {
        throw new Error(`Failed to fetch markets data: ${response.status}`);
      }
      
      const data = await response.json();
      setMarketsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  // Helper function to format pair display
  const formatPairDisplay = (pair: string) => {
    if (pair.length > 20) {
      return `${pair.substring(0, 10)}...${pair.substring(pair.length - 10)}`;
    }
    return pair;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  };

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrustScoreLabel = (score: string) => {
    switch (score) {
      case 'green': return 'High';
      case 'yellow': return 'Medium';
      case 'red': return 'Low';
      default: return 'Unknown';
    }
  };

  const getExchangeOptions = () => {
    if (!marketsData) return [];
    return [...new Set(marketsData.venues.map(venue => venue.exchange))].sort();
  };

  const filteredAndSortedVenues = () => {
    if (!marketsData) return [];
    
    let filtered = marketsData.venues;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(venue => 
        venue.exchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.pair.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply exchange filter
    if (filterExchange !== 'all') {
      filtered = filtered.filter(venue => venue.exchange === filterExchange);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'exchange':
          aValue = a.exchange.localeCompare(b.exchange);
          bValue = 0;
          break;
        case 'spread':
          aValue = a.spreadPct;
          bValue = b.spreadPct;
          break;
        default:
          aValue = a.volume24h;
          bValue = b.volume24h;
      }
      
      if (sortBy === 'exchange') {
        return sortOrder === 'asc' ? aValue : -aValue;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  };

  if (loading) {
    return <MarketsTableSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <TrendingDown className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button onClick={fetchMarketsData} variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-950">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketsData) {
    return (
      <Card className="w-full border-orange-200 dark:border-orange-700">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">No markets data available</p>
        </CardContent>
      </Card>
    );
  }

  const venues = filteredAndSortedVenues();
  const { summary, metadata } = marketsData;

  return (
    <Card className="w-full border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Building2 className="w-5 h-5" />
              Trading Venues & Markets
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {summary.activeExchanges} active exchanges • {summary.totalVenues} trading pairs • 
              Total volume: {formatVolume(summary.totalVolume)} • Last updated: {new Date(metadata.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
          
          <Button onClick={fetchMarketsData} variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-orange-200 dark:border-orange-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Exchange</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{summary.topExchange}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatVolume(summary.topVolume)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Exchanges</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{summary.activeExchanges}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {summary.totalVenues} pairs
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatVolume(summary.totalVolume)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg: {formatVolume(summary.avgPrice)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data Quality</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{metadata.totalPairs - metadata.stalePairs - metadata.anomalyPairs}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metadata.stalePairs + metadata.anomalyPairs} filtered
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exchanges or pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400"
            />
          </div>
          
          <Select value={filterExchange} onValueChange={setFilterExchange}>
            <SelectTrigger className="w-48 border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
              <SelectValue placeholder="Filter by exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exchanges</SelectItem>
              {getExchangeOptions().map(exchange => (
                <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: "volume" | "price" | "exchange" | "spread") => setSortBy(value)}>
            <SelectTrigger className="w-32 border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="spread">Spread</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950"
          >
            {sortOrder === "asc" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Markets Table */}
        <div className="rounded-md border border-orange-200 dark:border-orange-700 max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-orange-50 dark:bg-orange-950 z-10">
              <TableRow className="border-orange-200 dark:border-orange-700">
                <TableHead className="w-32">Exchange</TableHead>
                <TableHead className="w-40">Pair</TableHead>
                <TableHead className="text-right w-24">Price</TableHead>
                <TableHead className="text-right w-28">24h Volume</TableHead>
                <TableHead className="text-right w-20">Spread</TableHead>
                <TableHead className="w-24">Trust Score</TableHead>
                <TableHead className="w-28">Last Updated</TableHead>
                <TableHead className="text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No venues match your filters
                  </TableCell>
                </TableRow>
              ) : (
                venues.map((venue, index) => (
                  <TableRow key={index} className="hover:bg-orange-50 dark:hover:bg-orange-950 border-orange-100 dark:border-orange-800">
                    <TableCell className="font-medium text-gray-900 dark:text-white truncate">{venue.exchange}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="max-w-36 truncate cursor-help">
                            {formatPairDisplay(venue.pair)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs font-mono break-all">{venue.pair}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-900 dark:text-white">{formatPrice(venue.price)}</TableCell>
                    <TableCell className="text-right font-mono text-gray-900 dark:text-white">{formatVolume(venue.volume24h)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={venue.spreadPct > 5 ? "destructive" : "secondary"}>
                        {formatPercentage(venue.spreadPct)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTrustScoreColor(venue.trustScore)} text-white`}>
                        {getTrustScoreLabel(venue.trustScore)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(venue.lastUpdated)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(venue.tradeUrl, '_blank')}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-950"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {venues.length} venues • Scroll to see more • Hover over pairs to see full details
        </div>

        {/* Exchange Volume Distribution */}
        <div className="mt-6">
          <Card className="border-orange-200 dark:border-orange-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <BarChart3 className="w-5 h-5" />
                Volume Distribution by Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {marketsData.byExchange.slice(0, 10).map((exchange, index) => (
                  <div key={exchange.exchange} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-900 dark:text-white truncate">{exchange.exchange}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(exchange.totalVolume / marketsData.byExchange[0].totalVolume) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="w-24 text-right text-sm font-mono text-gray-900 dark:text-white">
                      {formatVolume(exchange.totalVolume)}
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500 dark:text-gray-400">
                      {exchange.pairCount} pairs
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketsTableSkeleton() {
  return (
    <Card className="w-full border-orange-200 dark:border-orange-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-orange-200 dark:border-orange-700">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border border-orange-200 dark:border-orange-700">
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
