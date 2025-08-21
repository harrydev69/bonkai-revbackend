"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Coins, PieChart, RefreshCw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SupplyData = {
  circulating: number;
  total: number | null;
  max: number | null;
  lastUpdated: string;
};

export function SupplyChart() {
  const [supplyData, setSupplyData] = useState<SupplyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplyData();
  }, []);

  const fetchSupplyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bonk/profile');
      if (!response.ok) {
        throw new Error(`Failed to fetch supply data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.supply) {
        setSupplyData({
          circulating: data.supply.circulating,
          total: data.supply.total,
          max: data.supply.max,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supply data');
    } finally {
      setLoading(false);
    }
  };

  const formatSupply = (amount: number) => {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`;
    return amount.toFixed(0);
  };

  const calculatePercentage = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  const getSupplyStatus = () => {
    if (!supplyData) return { status: "unknown", color: "gray", label: "Unknown" };
    
    const { circulating, max } = supplyData;
    if (!max) return { status: "unknown", color: "gray", label: "No Max Supply" };
    
    const percentage = calculatePercentage(circulating, max);
    
    if (percentage >= 90) return { status: "high", color: "red", label: "High Utilization" };
    if (percentage >= 70) return { status: "medium", color: "yellow", label: "Medium Utilization" };
    return { status: "low", color: "green", label: "Low Utilization" };
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
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
          <CardTitle className="text-red-500">Supply Data Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSupplyData} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!supplyData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No supply data available</p>
        </CardContent>
      </Card>
    );
  }

  const { circulating, total, max } = supplyData;
  const supplyStatus = getSupplyStatus();
  const circulatingPercentage = max ? calculatePercentage(circulating, max) : 0;
  const totalPercentage = max && total ? calculatePercentage(total, max) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              BONK Supply Analysis
            </CardTitle>
            <CardDescription>
              Token supply distribution and utilization metrics • Last updated: {new Date(supplyData.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
          
          <Button onClick={fetchSupplyData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Supply Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Supply Utilization</span>
            <Badge 
              variant={supplyStatus.color === "red" ? "destructive" : 
                      supplyStatus.color === "yellow" ? "secondary" : "default"}
            >
              {supplyStatus.label}
            </Badge>
          </div>
          <Progress value={circulatingPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>{circulatingPercentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Supply Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Circulating Supply</span>
              </div>
              <div className="text-2xl font-bold">{formatSupply(circulating)}</div>
              <div className="text-xs text-muted-foreground">
                {max ? `${circulatingPercentage.toFixed(2)}% of max supply` : "Active tokens"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Total Supply</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total tokens created (may include locked/burned tokens)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold">
                {total ? formatSupply(total) : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                {total && max ? `${totalPercentage.toFixed(2)}% of max supply` : "Not specified"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Max Supply</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum tokens that can ever exist</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold">
                {max ? formatSupply(max) : "Unlimited"}
              </div>
              <div className="text-xs text-muted-foreground">
                {max ? "Hard cap" : "No maximum limit"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supply Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supply Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-muted-foreground mb-2">Supply Distribution Chart</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Circulating:</span>
                    <span className="font-medium">{formatSupply(circulating)}</span>
                  </div>
                  {total && (
                    <div className="flex justify-between">
                      <span>Locked/Burned:</span>
                      <span className="font-medium">{formatSupply(total - circulating)}</span>
                    </div>
                  )}
                  {max && total && (
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-medium">{formatSupply(max - total)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supply Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Initial Launch</span>
                  <Badge variant="outline">Dec 2022</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Status</span>
                  <Badge variant="default">
                    {circulatingPercentage.toFixed(1)}% Circulating
                  </Badge>
                </div>
                {max && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Max Supply</span>
                    <Badge variant="secondary">
                      {formatSupply(max)} Tokens
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Utilization</span>
                  <Badge 
                    variant={supplyStatus.color === "red" ? "destructive" : 
                            supplyStatus.color === "yellow" ? "secondary" : "default"}
                  >
                    {supplyStatus.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supply Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Circulation Rate:</span>
                    <span className="font-medium">
                      {max ? `${circulatingPercentage.toFixed(2)}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Locked Tokens:</span>
                    <span className="font-medium">
                      {total ? formatSupply(total - circulating) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available for Mining:</span>
                    <span className="font-medium">
                      {max && total ? formatSupply(max - total) : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Supply Type:</span>
                    <span className="font-medium">
                      {max ? "Fixed Cap" : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Inflation Rate:</span>
                    <span className="font-medium">
                      {max ? "0%" : "Variable"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(supplyData.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
