"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Unlock, 
  Clock, 
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TokenomicsData = {
  supply: {
    circulating: number;
    total: number;
    max: number;
    burned: number;
    locked: number;
    available: number;
  };
  distribution: {
    team: number;
    community: number;
    liquidity: number;
    marketing: number;
    development: number;
    treasury: number;
    other: number;
  };
  vestingSchedule: Array<{
    category: string;
    totalAmount: number;
    unlockedAmount: number;
    lockedAmount: number;
    unlockDate: string;
    vestingPeriod: string;
    cliffDate?: string;
  }>;
  economicMetrics: {
    inflationRate: number;
    deflationRate: number;
    utilizationRate: number;
    velocity: number;
    marketCapToSupply: number;
  };
  communityMetrics: {
    totalHolders: number;
    activeHolders: number;
    averageHoldingTime: number;
    diamondHands: number;
    paperHands: number;
  };
  developerMetrics: {
    githubStars: number;
    githubForks: number;
    commitsLast4Weeks: number;
    contributors: number;
    lastCommit: string;
  };
  metadata: {
    lastUpdated: string;
    dataSource: string;
    contractAddress: string;
    blockchain: string;
  };
};

export function TokenomicsDashboard() {
  const [tokenomicsData, setTokenomicsData] = useState<TokenomicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTokenomicsData();
  }, []);

  const fetchTokenomicsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bonk/tokenomics');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokenomics data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tokenomics API Response:', data); // Debug log
      setTokenomicsData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tokenomics data');
      console.error('Tokenomics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <TokenomicsSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading tokenomics data: {error}</p>
            <Button variant="outline" size="sm" onClick={fetchTokenomicsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenomicsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No tokenomics data available</p>
        </CardContent>
      </Card>
    );
  }

  const { supply, distribution, vestingSchedule, economicMetrics, communityMetrics, developerMetrics, metadata } = tokenomicsData;

  // Debug log to see the actual data structure
  console.log('Tokenomics Dashboard Data:', {
    supply: !!supply,
    distribution: !!distribution,
    vestingSchedule: !!vestingSchedule,
    economicMetrics: !!economicMetrics,
    communityMetrics: !!communityMetrics,
    developerMetrics: !!developerMetrics,
    metadata: !!metadata
  });

  // Safety check for required data
  if (!economicMetrics || !supply || !distribution || !vestingSchedule || !communityMetrics || !developerMetrics || !metadata) {
    console.log('Missing data:', {
      economicMetrics: !!economicMetrics,
      supply: !!supply,
      distribution: !!distribution,
      vestingSchedule: !!vestingSchedule,
      communityMetrics: !!communityMetrics,
      developerMetrics: !!developerMetrics,
      metadata: !!metadata
    });
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <p>Incomplete tokenomics data structure. Please refresh.</p>
            <Button variant="outline" size="sm" onClick={fetchTokenomicsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number | null | undefined, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return `${num.toFixed(2)}%`;
  };

  const getSupplyStatusColor = (utilization: number) => {
    if (!utilization || isNaN(utilization)) return "text-gray-400";
    if (utilization >= 80) return "text-green-600";
    if (utilization >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getVestingStatusColor = (unlocked: number, total: number) => {
    if (!total || total === 0) return "text-gray-400";
    const percentage = (unlocked / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tokenomics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of BONK's token economics and distribution
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchTokenomicsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="vesting">Vesting</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Supply Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Circulating Supply</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(supply.circulating)}</div>
                <p className="text-xs text-muted-foreground">
                  {supply.total && supply.circulating ? formatPercentage((supply.circulating / supply.total) * 100) : 'N/A'} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(supply.total)}</div>
                <p className="text-xs text-muted-foreground">
                  Max: {supply.max ? formatNumber(supply.max) : 'Unlimited'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Burned</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(supply.burned)}</div>
                <p className="text-xs text-muted-foreground">
                  {supply.total && supply.burned ? formatPercentage((supply.burned / supply.total) * 100) : 'N/A'} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locked</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(supply.locked)}</div>
                <p className="text-xs text-muted-foreground">
                  {supply.total && supply.locked ? formatPercentage((supply.locked / supply.total) * 100) : 'N/A'} of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supply Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Supply Utilization</CardTitle>
              <CardDescription>
                Current distribution and utilization of BONK tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Circulating</span>
                  <span className={supply.total && supply.circulating ? getSupplyStatusColor((supply.circulating / supply.total) * 100) : ''}>
                    {supply.total && supply.circulating ? formatPercentage((supply.circulating / supply.total) * 100) : 'N/A'}
                  </span>
                </div>
                <Progress 
                  value={supply.total && supply.circulating ? (supply.circulating / supply.total) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Locked</span>
                  <span>{supply.total && supply.locked ? formatPercentage((supply.locked / supply.total) * 100) : 'N/A'}</span>
                </div>
                <Progress 
                  value={supply.total && supply.locked ? (supply.locked / supply.total) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Burned</span>
                  <span>{supply.total && supply.burned ? formatPercentage((supply.burned / supply.total) * 100) : 'N/A'}</span>
                </div>
                <Progress 
                  value={supply.total && supply.burned ? (supply.burned / supply.total) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Economic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inflation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(economicMetrics.inflationRate)}
                </div>
                <p className="text-xs text-muted-foreground">Annual rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(economicMetrics.utilizationRate)}
                </div>
                <p className="text-xs text-muted-foreground">Active tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {economicMetrics.velocity ? economicMetrics.velocity.toFixed(2) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Transactions per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
              <CardDescription>
                How BONK tokens are allocated across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(distribution).map(([category, percentage]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span>{formatPercentage(percentage)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Holders</span>
                  <span className="font-medium">{formatNumber(communityMetrics.totalHolders)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Holders</span>
                  <span className="font-medium">{formatNumber(communityMetrics.activeHolders)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diamond Hands</span>
                  <span className="font-medium">{formatNumber(communityMetrics.diamondHands)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paper Hands</span>
                  <span className="font-medium">{formatNumber(communityMetrics.paperHands)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Developer Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>GitHub Stars</span>
                  <span className="font-medium">{formatNumber(developerMetrics.githubStars)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GitHub Forks</span>
                  <span className="font-medium">{formatNumber(developerMetrics.githubForks)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commits (4w)</span>
                  <span className="font-medium">{formatNumber(developerMetrics.commitsLast4Weeks)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contributors</span>
                  <span className="font-medium">{formatNumber(developerMetrics.contributors)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vesting Tab */}
        <TabsContent value="vesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vesting Schedule</CardTitle>
              <CardDescription>
                Token unlock schedule and vesting periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vestingSchedule.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{item.category}</h4>
                      <Badge variant="outline">
                        {item.vestingPeriod}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <div className="font-medium">{formatNumber(item.totalAmount)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unlocked:</span>
                        <div className="font-medium text-green-600">
                          {formatNumber(item.unlockedAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Locked:</span>
                        <div className="font-medium text-red-600">
                          {formatNumber(item.lockedAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span className={item.totalAmount ? getVestingStatusColor(item.unlockedAmount, item.totalAmount) : ''}>
                          {item.totalAmount ? formatPercentage((item.unlockedAmount / item.totalAmount) * 100) : 'N/A'}
                        </span>
                      </div>
                      <Progress 
                        value={item.totalAmount ? (item.unlockedAmount / item.totalAmount) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Unlock Date: {new Date(item.unlockDate).toLocaleDateString()}</span>
                      {item.cliffDate && (
                        <span>Cliff: {new Date(item.cliffDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Economic Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Economic Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Market Cap to Supply Ratio</span>
                    <span className="font-medium">{economicMetrics.marketCapToSupply ? economicMetrics.marketCapToSupply.toFixed(2) : 'N/A'}</span>
                  </div>
                  <Progress value={economicMetrics.marketCapToSupply ? Math.min(economicMetrics.marketCapToSupply * 10, 100) : 0} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Inflation Rate</span>
                    <div className="font-medium text-green-600">
                      {formatPercentage(economicMetrics.inflationRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deflation Rate</span>
                    <div className="font-medium text-red-600">
                      {formatPercentage(economicMetrics.deflationRate)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Supply Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Supply</span>
                    <span className="font-medium">{formatNumber(supply.available)}</span>
                  </div>
                  <Progress 
                    value={supply.total && supply.available ? (supply.available / supply.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Circulating</span>
                    <span>{formatNumber(supply.circulating)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Locked</span>
                    <span>{formatNumber(supply.locked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Burned</span>
                    <span>{formatNumber(supply.burned)}</span>
                  </div>
                </div>
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
                  <span className="text-muted-foreground">Blockchain:</span>
                  <div className="font-medium">{metadata.blockchain}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Contract Address:</span>
                  <div className="font-mono text-xs break-all">{metadata.contractAddress}</div>
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

function TokenomicsSkeleton() {
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
