"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Store, 
  Activity,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Shield,
  Zap,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  ExternalLink,
  Globe,
  Lock,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type EnhancedMarketsData = {
  venues: Array<{
    rank: number;
    exchange: string;
    pair: string;
    price: number;
    spread: number;
    depth2Percent: {
      positive: number;
      negative: number;
    };
    volume24h: number;
    volumePercentage: number;
    lastUpdated: string;
    trustScore: string;
    marketType: 'spot' | 'perpetual' | 'futures';
    exchangeType: 'cex' | 'dex';
    tradeUrl: string;
    priceChange24h: number;
    priceChangePercentage24h: number;
    high24h: number;
    low24h: number;
    bidAsk: {
      bid: number;
      ask: number;
      bidSize: number;
      askSize: number;
    };
  }>;
  summary: {
    totalVenues: number;
    totalVolume: number;
    averageSpread: number;
    averageTrustScore: string;
    marketTypeDistribution: {
      spot: number;
      perpetual: number;
      futures: number;
    };
    exchangeTypeDistribution: {
      cex: number;
      dex: number;
    };
    topExchanges: Array<{
      name: string;
      volume: number;
      venueCount: number;
      averageTrustScore: string;
    }>;
  };
  filters: {
    marketTypes: string[];
    exchangeTypes: string[];
    trustScores: string[];
    exchanges: string[];
  };
  metadata: {
    lastUpdated: string;
    totalPairs: number;
    stalePairs: number;
    anomalyPairs: number;
    dataQuality: {
      highTrust: number;
      mediumTrust: number;
      lowTrust: number;
    };
  };
};

export function EnhancedMarketsDashboard() {
  const [marketsData, setMarketsData] = useState<EnhancedMarketsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "price" | "spread" | "exchange" | "trust">("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterMarketType, setFilterMarketType] = useState<string>("all");
  const [filterExchangeType, setFilterExchangeType] = useState<string>("all");
  const [filterTrustScore, setFilterTrustScore] = useState<string>("all");
  const [filterExchange, setFilterExchange] = useState<string>("all");

  useEffect(() => {
    fetchMarketsData();
  }, []);

  const fetchMarketsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bonk/markets/enhanced');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enhanced markets data: ${response.status}`);
      }
      
      const data = await response.json();
      setMarketsData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enhanced markets data');
      console.error('Enhanced markets fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <EnhancedMarketsSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading enhanced markets data: {error}</p>
            <Button variant="outline" size="sm" onClick={fetchMarketsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No enhanced markets data available</p>
        </CardContent>
      </Card>
    );
  }

  const { venues, summary, filters, metadata } = marketsData;

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number) => `${num.toFixed(2)}%`;

  const formatPrice = (price: number) => `$${price.toFixed(6)}`;

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getMarketTypeColor = (type: string) => {
    switch (type) {
      case 'spot': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'perpetual': return 'bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100';
      case 'futures': return 'bg-orange-300 text-orange-900 dark:bg-orange-700 dark:text-orange-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getExchangeTypeColor = (type: string) => {
    switch (type) {
      case 'cex': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'dex': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getSpreadColor = (spread: number) => {
    if (spread <= 0.1) return "text-green-600 dark:text-green-400";
    if (spread <= 0.5) return "text-yellow-600 dark:text-yellow-400";
    if (spread <= 1.0) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatPairDisplay = (pair: string) => {
    if (pair.length > 20) {
      return `${pair.substring(0, 10)}...${pair.substring(pair.length - 10)}`;
    }
    return pair;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  };

  // Filter and sort venues
  const filteredVenues = venues
    .filter(venue => {
      if (searchTerm && !venue.exchange.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !venue.pair.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterMarketType !== "all" && venue.marketType !== filterMarketType) return false;
      if (filterExchangeType !== "all" && venue.exchangeType !== filterExchangeType) return false;
      if (filterTrustScore !== "all" && venue.trustScore !== filterTrustScore) return false;
      if (filterExchange !== "all" && venue.exchange !== filterExchange) return false;
      return true;
    })
    .sort((a, b) => {
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
          aValue = a.spread;
          bValue = b.spread;
          break;
        case "exchange":
          aValue = a.exchange.localeCompare(b.exchange);
          bValue = 0;
          break;
        case "trust":
          const trustOrder = { 'green': 3, 'yellow': 2, 'red': 1 };
          aValue = trustOrder[a.trustScore as keyof typeof trustOrder] || 2;
          bValue = trustOrder[b.trustScore as keyof typeof trustOrder] || 2;
          break;
        default:
          aValue = a.volume24h;
          bValue = b.volume24h;
      }
      
      if (sortBy === "exchange") {
        return sortOrder === "asc" ? aValue : -aValue;
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-orange-500 dark:text-orange-400">Enhanced Markets Dashboard</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Comprehensive analysis of BONK trading venues with depth, spread, and trust metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-950">
            Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchMarketsData} className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-orange-50 dark:bg-orange-950">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">Overview</TabsTrigger>
          <TabsTrigger value="venues" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">Trading Venues</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">Market Analysis</TabsTrigger>
          <TabsTrigger value="quality" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">Data Quality</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Total Venues</CardTitle>
                <Globe className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalVenues}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {metadata.totalPairs} total pairs
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Total Volume</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(summary.totalVolume)}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  24h trading volume
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Avg Spread</CardTitle>
                <Target className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(summary.averageSpread)}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Bid-ask spread
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Trust Score</CardTitle>
                <Shield className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.averageTrustScore}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Average quality
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Market Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown by trading instrument type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spot Trading</span>
                    <span className="font-medium">{summary.marketTypeDistribution.spot}</span>
                  </div>
                  <Progress 
                    value={(summary.marketTypeDistribution.spot / summary.totalVenues) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Perpetuals</span>
                    <span className="font-medium">{summary.marketTypeDistribution.perpetual}</span>
                  </div>
                  <Progress 
                    value={(summary.marketTypeDistribution.perpetual / summary.totalVenues) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Futures</span>
                    <span className="font-medium">{summary.marketTypeDistribution.futures}</span>
                  </div>
                  <Progress 
                    value={(summary.marketTypeDistribution.futures / summary.totalVenues) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exchange Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown by exchange type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Centralized (CEX)</span>
                    <span className="font-medium">{summary.exchangeTypeDistribution.cex}</span>
                  </div>
                  <Progress 
                    value={(summary.exchangeTypeDistribution.cex / summary.totalVenues) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Decentralized (DEX)</span>
                    <span className="font-medium">{summary.exchangeTypeDistribution.dex}</span>
                  </div>
                  <Progress 
                    value={(summary.exchangeTypeDistribution.dex / summary.totalVenues) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle>Top Exchanges by Volume</CardTitle>
              <CardDescription>
                Leading trading venues for BONK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topExchanges.map((exchange, index) => (
                  <div key={exchange.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{exchange.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exchange.venueCount} venues
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(exchange.volume)}</div>
                      <div className="text-sm text-muted-foreground">
                        Trust: {exchange.averageTrustScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Venues Tab */}
        <TabsContent value="venues" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Search</label>
                  <Input
                    placeholder="Exchange or pair..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Market Type</label>
                  <Select value={filterMarketType} onValueChange={setFilterMarketType}>
                    <SelectTrigger className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {filters.marketTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Exchange Type</label>
                  <Select value={filterExchangeType} onValueChange={setFilterExchangeType}>
                    <SelectTrigger className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filters.exchangeTypes.map(type => (
                        <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Trust Score</label>
                  <Select value={filterTrustScore} onValueChange={setFilterTrustScore}>
                    <SelectTrigger className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      {filters.trustScores.map(score => (
                        <SelectItem key={score} value={score}>{score}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Exchange</label>
                  <Select value={filterExchange} onValueChange={setFilterExchange}>
                    <SelectTrigger className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exchanges</SelectItem>
                      {filters.exchanges.map(exchange => (
                        <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Sort By</label>
                  <div className="flex space-x-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="border-orange-200 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="spread">Spread</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950"
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venues Table */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Venues ({filteredVenues.length})</CardTitle>
              <CardDescription>
                Detailed view of all BONK trading venues with metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto border rounded-md border-orange-200 dark:border-orange-700">
                <Table>
                  <TableHeader className="sticky top-0 bg-orange-50 dark:bg-orange-950 z-10">
                    <TableRow className="border-orange-200 dark:border-orange-700">
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-16">Rank</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-32">Exchange</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-40">Pair</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-24">Price</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-20">Spread</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-28">24h Volume</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-20">Vol %</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-20">Trust</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-24">Type</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-28">Updated</TableHead>
                      <TableHead className="text-gray-800 dark:text-gray-200 font-semibold w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVenues.map((venue) => (
                      <TableRow key={`venue-${venue.rank}-${venue.exchange}-${venue.pair}`} className="hover:bg-orange-50 dark:hover:bg-orange-950 border-orange-100 dark:border-orange-800">
                        <TableCell className="font-medium text-gray-900 dark:text-white">#{venue.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{venue.exchange}</span>
                            <Badge className={getExchangeTypeColor(venue.exchangeType)}>
                              {venue.exchangeType.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
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
                        <TableCell className="text-gray-900 dark:text-white">{formatPrice(venue.price)}</TableCell>
                        <TableCell className={getSpreadColor(venue.spread)}>
                          {formatPercentage(venue.spread)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatNumber(venue.volume24h)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-white">{formatPercentage(venue.volumePercentage)}</TableCell>
                        <TableCell>
                          <Badge className={getTrustScoreColor(venue.trustScore)}>
                            {venue.trustScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getMarketTypeColor(venue.marketType)}>
                            {venue.marketType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(venue.lastUpdated)}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950">
                            <a href={venue.tradeUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                Showing {filteredVenues.length} venues • Scroll to see more • Hover over pairs to see full details
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Depth Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Depth Analysis</CardTitle>
              <CardDescription>
                +2% and -2% depth analysis for liquidity assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVenues.slice(0, 6).map((venue) => (
                  <div key={`depth-${venue.rank}-${venue.exchange}-${venue.pair}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{venue.exchange}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="cursor-help max-w-24 truncate">
                            {formatPairDisplay(venue.pair)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-mono break-all">{venue.pair}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>+2% Depth</span>
                          <span className="font-medium">{formatNumber(venue.depth2Percent.positive)}</span>
                        </div>
                        <Progress 
                          value={(venue.depth2Percent.positive / venue.volume24h) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>-2% Depth</span>
                          <span className="font-medium">{formatNumber(venue.depth2Percent.negative)}</span>
                        </div>
                        <Progress 
                          value={(venue.depth2Percent.negative / venue.volume24h) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>Bid: {formatPrice(venue.bidAsk.bid)}</div>
                        <div>Ask: {formatPrice(venue.bidAsk.ask)}</div>
                        <div>Spread: {formatPercentage(venue.spread)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Performance</CardTitle>
                <CardDescription>
                  24h price changes and ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVenues.slice(0, 5).map((venue) => (
                    <div key={`price-${venue.rank}-${venue.exchange}-${venue.pair}`} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{venue.exchange}</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-muted-foreground cursor-help max-w-32 truncate">
                              {formatPairDisplay(venue.pair)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-mono break-all">{venue.pair}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(venue.price)}</div>
                        <div className="text-sm text-muted-foreground">
                          H: {formatPrice(venue.high24h)} L: {formatPrice(venue.low24h)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
                <CardDescription>
                  Top venues by trading volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVenues.slice(0, 5).map((venue) => (
                    <div key={`volume-${venue.rank}-${venue.exchange}-${venue.pair}`} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-2">
                        <span>{venue.exchange}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help max-w-24 truncate">
                                ({formatPairDisplay(venue.pair)})
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-mono break-all">{venue.pair}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span>{formatPercentage(venue.volumePercentage)}</span>
                      </div>
                      <Progress value={venue.volumePercentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          {/* Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-green-600">High Trust</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">{metadata.dataQuality.highTrust}</div>
                <p className="text-sm text-muted-foreground">Venues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-yellow-600">Medium Trust</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{metadata.dataQuality.mediumTrust}</div>
                <p className="text-sm text-muted-foreground">Venues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-red-600">Low Trust</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-red-600">{metadata.dataQuality.lowTrust}</div>
                <p className="text-sm text-muted-foreground">Venues</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Issues</CardTitle>
              <CardDescription>
                Summary of data quality and filtering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metadata.totalPairs}</div>
                  <p className="text-sm text-muted-foreground">Total Pairs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metadata.stalePairs}</div>
                  <p className="text-sm text-muted-foreground">Stale Pairs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metadata.anomalyPairs}</div>
                  <p className="text-sm text-muted-foreground">Anomaly Pairs</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Stale and anomaly pairs are automatically filtered out to ensure data quality. 
                  Only active, reliable trading venues are displayed in the main analysis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Data Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Venues:</span>
                  <div className="font-medium">{summary.totalVenues}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Volume:</span>
                  <div className="font-medium">{formatNumber(summary.totalVolume)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Average Spread:</span>
                  <div className="font-medium">{formatPercentage(summary.averageSpread)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div className="font-medium">
                    {new Date(metadata.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EnhancedMarketsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
