"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTrustScoreLabel = (score: string) => {
    switch (score) {
      case "green": return "High";
      case "yellow": return "Medium";
      case "red": return "Low";
      default: return "Unknown";
    }
  };

  const filteredAndSortedVenues = () => {
    if (!marketsData) return [];

    let filtered = marketsData.venues.filter(venue => {
      const matchesSearch = venue.exchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.pair.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExchange = filterExchange === "all" || venue.exchange === filterExchange;
      return matchesSearch && matchesExchange;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case "volume":
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "spread":
          aValue = a.spreadPct;
          bValue = b.spreadPct;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  };

  const getExchangeOptions = () => {
    if (!marketsData) return [];
    const exchanges = [...new Set(marketsData.venues.map(v => v.exchange))];
    return exchanges.sort();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">Markets Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchMarketsData} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!marketsData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No markets data available</p>
        </CardContent>
      </Card>
    );
  }

  const venues = filteredAndSortedVenues();
  const { summary, metadata } = marketsData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Trading Venues & Markets
            </CardTitle>
            <CardDescription>
              {summary.activeExchanges} active exchanges • {summary.totalVenues} trading pairs • 
              Total volume: {formatVolume(summary.totalVolume)} • Last updated: {new Date(metadata.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
          
          <Button onClick={fetchMarketsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Top Exchange</div>
              <div className="text-lg font-semibold">{summary.topExchange}</div>
              <div className="text-xs text-muted-foreground">
                {formatVolume(summary.topVolume)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Active Exchanges</div>
              <div className="text-lg font-semibold">{summary.activeExchanges}</div>
              <div className="text-xs text-muted-foreground">
                {summary.totalVenues} pairs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
              <div className="text-lg font-semibold">{formatVolume(summary.totalVolume)}</div>
              <div className="text-xs text-muted-foreground">
                Avg: {formatVolume(summary.avgPrice)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Data Quality</div>
              <div className="text-lg font-semibold text-green-500">{metadata.totalPairs - metadata.stalePairs - metadata.anomalyPairs}</div>
              <div className="text-xs text-muted-foreground">
                {metadata.stalePairs + metadata.anomalyPairs} filtered
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search exchanges or pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterExchange} onValueChange={setFilterExchange}>
            <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-32">
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
          >
            {sortOrder === "asc" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Markets Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exchange</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h Volume</TableHead>
                <TableHead className="text-right">Spread</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No venues match your filters
                  </TableCell>
                </TableRow>
              ) : (
                venues.map((venue, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{venue.exchange}</TableCell>
                    <TableCell className="font-mono text-sm">{venue.pair}</TableCell>
                    <TableCell className="text-right font-mono">{formatPrice(venue.price)}</TableCell>
                    <TableCell className="text-right font-mono">{formatVolume(venue.volume24h)}</TableCell>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(venue.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(venue.tradeUrl, '_blank')}
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

        {/* Exchange Volume Distribution */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Volume Distribution by Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketsData.byExchange.slice(0, 10).map((exchange, index) => (
                  <div key={exchange.exchange} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{exchange.exchange}</div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(exchange.totalVolume / marketsData.byExchange[0].totalVolume) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="w-24 text-right text-sm font-mono">
                      {formatVolume(exchange.totalVolume)}
                    </div>
                    <div className="w-16 text-right text-xs text-muted-foreground">
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
