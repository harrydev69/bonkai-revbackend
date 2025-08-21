"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  User,
  Activity,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Shield,
  Zap,
  CircleDollarSign,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type HoldersData = {
  distribution: {
    totalHolders: number;
    activeHolders: number;
    whaleCount: number;
    retailCount: number;
    exchangeCount: number;
  };
  concentration: {
    top1Percent: number;
    top5Percent: number;
    top10Percent: number;
    top25Percent: number;
    top50Percent: number;
    giniCoefficient: number;
    herfindahlIndex: number;
  };
  whaleAnalysis: {
    whaleThreshold: number;
    whaleCount: number;
    whalePercentage: number;
    whaleHoldings: number;
    averageWhaleBalance: number;
  };
  holderTypes: {
    exchanges: Array<{
      name: string;
      address: string;
      balance: number;
      percentage: number;
      type: 'cex' | 'dex';
    }>;
    whales: Array<{
      rank: number;
      address: string;
      balance: number;
      percentage: number;
      lastActivity: string;
      type: 'individual' | 'institution' | 'unknown';
    }>;
    team: Array<{
      rank: number;
      address: string;
      balance: number;
      percentage: number;
      role: string;
      vestingStatus: 'locked' | 'unlocked' | 'partially';
    }>;
    community: Array<{
      rank: number;
      address: string;
      balance: number;
      percentage: number;
      activity: 'active' | 'inactive' | 'new';
    }>;
  };
  trends: {
    newHolders: number;
    lostHolders: number;
    netGrowth: number;
    averageHoldingTime: number;
    diamondHands: number;
    paperHands: number;
  };
  metadata: {
    lastUpdated: string;
    dataSource: string;
    blockchainExplorer: string;
    totalTransactions: number;
  };
};

export function HoldersDashboard() {
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchHoldersData();
  }, []);

  const fetchHoldersData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bonk/holders');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch holders data: ${response.status}`);
      }
      
      const data = await response.json();
      setHoldersData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch holders data');
      console.error('Holders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <HoldersSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading holders data: {error}</p>
            <Button variant="outline" size="sm" onClick={fetchHoldersData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!holdersData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No holders data available</p>
        </CardContent>
      </Card>
    );
  }

  const { distribution, concentration, whaleAnalysis, holderTypes, trends, metadata } = holdersData;

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number) => `${num.toFixed(2)}%`;

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getConcentrationColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-green-600";
  };

  const getWhaleTypeColor = (type: string) => {
    switch (type) {
      case 'institution': return 'bg-blue-100 text-blue-800';
      case 'individual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVestingStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'bg-red-100 text-red-800';
      case 'unlocked': return 'bg-green-100 text-green-800';
      case 'partially': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Holders Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of BONK token holders and distribution
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchHoldersData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="concentration">Concentration</TabsTrigger>
          <TabsTrigger value="whales">Whales</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Distribution Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(distribution.totalHolders)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((distribution.activeHolders / distribution.totalHolders) * 100)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Whales</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(distribution.whaleCount)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(whaleAnalysis.whalePercentage)} of supply
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retail</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(distribution.retailCount)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((distribution.retailCount / distribution.totalHolders) * 100)} of holders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exchanges</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(distribution.exchangeCount)}</div>
                <p className="text-xs text-muted-foreground">
                  CEX & DEX platforms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(holderTypes.team.length)}</div>
                <p className="text-xs text-muted-foreground">
                  Core team members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Concentration Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Concentration Analysis</CardTitle>
              <CardDescription>
                Distribution of tokens across holder percentiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(concentration).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className={`text-2xl font-bold ${getConcentrationColor(value)}`}>
                      {formatPercentage(value)}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">Gini Coefficient</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {concentration.giniCoefficient.toFixed(3)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {concentration.giniCoefficient >= 0.8 ? 'High inequality' : 
                     concentration.giniCoefficient >= 0.6 ? 'Moderate inequality' : 'Low inequality'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">Herfindahl Index</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {concentration.herfindahlIndex.toFixed(3)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {concentration.herfindahlIndex >= 0.25 ? 'High concentration' : 
                     concentration.herfindahlIndex >= 0.15 ? 'Moderate concentration' : 'Low concentration'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Whale Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Whale Analysis</CardTitle>
              <CardDescription>
                Analysis of large token holders and their impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(whaleAnalysis.whaleHoldings)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Whale Holdings</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(whaleAnalysis.whalePercentage)} of total supply
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(whaleAnalysis.averageWhaleBalance)}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Whale Balance</p>
                  <p className="text-xs text-muted-foreground">
                    Per whale address
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(whaleAnalysis.whaleThreshold)}
                  </div>
                  <p className="text-sm text-muted-foreground">Whale Threshold</p>
                  <p className="text-xs text-muted-foreground">
                    Minimum balance to qualify
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Concentration Tab */}
        <TabsContent value="concentration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concentration Distribution</CardTitle>
              <CardDescription>
                Detailed breakdown of token concentration across different percentiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(concentration).slice(0, 5).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={getConcentrationColor(value)}>
                      {formatPercentage(value)}
                    </span>
                  </div>
                  <Progress value={value} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {key === 'top1Percent' && 'Richest 1% of holders'}
                    {key === 'top5Percent' && 'Richest 5% of holders'}
                    {key === 'top10Percent' && 'Richest 10% of holders'}
                    {key === 'top25Percent' && 'Richest 25% of holders'}
                    {key === 'top50Percent' && 'Richest 50% of holders'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inequality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gini Coefficient</CardTitle>
                <CardDescription>
                  Measure of inequality (0 = perfect equality, 1 = perfect inequality)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {concentration.giniCoefficient.toFixed(3)}
                  </div>
                  <Progress 
                    value={concentration.giniCoefficient * 100} 
                    className="h-3 mb-4"
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Perfect Equality</span>
                      <span>0.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current</span>
                      <span>{concentration.giniCoefficient.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perfect Inequality</span>
                      <span>1.000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Herfindahl Index</CardTitle>
                <CardDescription>
                  Measure of market concentration and competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {concentration.herfindahlIndex.toFixed(3)}
                  </div>
                  <Progress 
                    value={concentration.herfindahlIndex * 400} 
                    className="h-3 mb-4"
                  />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Low Concentration</span>
                      <span>&lt; 0.15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moderate</span>
                      <span>0.15 - 0.25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Concentration</span>
                      <span>&gt; 0.25</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Whales Tab */}
        <TabsContent value="whales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Whale Holders</CardTitle>
              <CardDescription>
                Largest individual and institutional BONK holders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holderTypes.whales.map((whale) => (
                    <TableRow key={whale.rank}>
                      <TableCell className="font-medium">#{whale.rank}</TableCell>
                      <TableCell className="font-mono">
                        <a 
                          href={`${metadata.blockchainExplorer}/account/${whale.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {formatAddress(whale.address)}
                        </a>
                      </TableCell>
                      <TableCell>{formatNumber(whale.balance)}</TableCell>
                      <TableCell>{formatPercentage(whale.percentage)}</TableCell>
                      <TableCell>
                        <Badge className={getWhaleTypeColor(whale.type)}>
                          {whale.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(whale.lastActivity).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Team Holders */}
          <Card>
            <CardHeader>
              <CardTitle>Team & Foundation</CardTitle>
              <CardDescription>
                Core team members and foundation addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Vesting Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holderTypes.team.map((member) => (
                    <TableRow key={member.rank}>
                      <TableCell className="font-medium">#{member.rank}</TableCell>
                      <TableCell className="font-mono">
                        <a 
                          href={`${metadata.blockchainExplorer}/account/${member.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {formatAddress(member.address)}
                        </a>
                      </TableCell>
                      <TableCell>{formatNumber(member.balance)}</TableCell>
                      <TableCell>{formatPercentage(member.percentage)}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Badge className={getVestingStatusColor(member.vestingStatus)}>
                          {member.vestingStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Holdings</CardTitle>
              <CardDescription>
                Centralized and decentralized exchange balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holderTypes.exchanges.map((exchange, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{exchange.name}</TableCell>
                      <TableCell className="font-mono">
                        <a 
                          href={`${metadata.blockchainExplorer}/account/${exchange.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {formatAddress(exchange.address)}
                        </a>
                      </TableCell>
                      <TableCell>{formatNumber(exchange.balance)}</TableCell>
                      <TableCell>{formatPercentage(exchange.percentage)}</TableCell>
                      <TableCell>
                        <Badge variant={exchange.type === 'cex' ? 'default' : 'secondary'}>
                          {exchange.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Community Holders */}
          <Card>
            <CardHeader>
              <CardTitle>Top Community Holders</CardTitle>
              <CardDescription>
                Active community members and early adopters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holderTypes.community.map((holder) => (
                    <TableRow key={holder.rank}>
                      <TableCell className="font-medium">#{holder.rank}</TableCell>
                      <TableCell className="font-mono">
                        <a 
                          href={`${metadata.blockchainExplorer}/account/${holder.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {formatAddress(holder.address)}
                        </a>
                      </TableCell>
                      <TableCell>{formatNumber(holder.balance)}</TableCell>
                      <TableCell>{formatPercentage(holder.percentage)}</TableCell>
                      <TableCell>
                        <Badge className={getActivityColor(holder.activity)}>
                          {holder.activity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Holders</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{formatNumber(trends.newHolders)}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lost Holders</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-{formatNumber(trends.lostHolders)}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${trends.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.netGrowth >= 0 ? '+' : ''}{formatNumber(trends.netGrowth)}
                </div>
                <p className="text-xs text-muted-foreground">Net holder change</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diamond Hands</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatNumber(trends.diamondHands)}</div>
                <p className="text-xs text-muted-foreground">Long-term holders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paper Hands</CardTitle>
                <Zap className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatNumber(trends.paperHands)}</div>
                <p className="text-xs text-muted-foreground">Short-term holders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Holding Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{trends.averageHoldingTime}</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
          </div>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Data Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Data Source:</span>
                  <div className="font-medium">{metadata.dataSource}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Blockchain Explorer:</span>
                  <div className="font-medium">
                    <a 
                      href={metadata.blockchainExplorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {metadata.blockchainExplorer}
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Transactions:</span>
                  <div className="font-medium">{formatNumber(metadata.totalTransactions)}</div>
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

function HoldersSkeleton() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
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
