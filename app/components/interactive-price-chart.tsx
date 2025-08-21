"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, LineChart, Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChartDataPoint = {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
  date: string;
};

type ChartPayload = {
  timeframe: string;
  dataPoints: ChartDataPoint[];
  summary: {
    startPrice: number;
    endPrice: number;
    changePercent: number;
    changeAmount: number;
    highestPrice: number;
    lowestPrice: number;
    totalVolume: number;
    avgVolume: number;
    highestVolume: number;
    lowestVolume: number;
  };
  metadata: {
    totalPoints: number;
    timeRange: string;
    lastUpdated: string;
  };
};

const timeRanges = [
  { value: "1", label: "24H" },
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "365", label: "1Y" }
];

export function InteractivePriceChart() {
  const [chartData, setChartData] = useState<ChartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState("30");
  const [chartType, setChartType] = useState<"line" | "area" | "candlestick">("line");

  useEffect(() => {
    fetchChartData(selectedRange);
  }, [selectedRange]);

  const fetchChartData = async (days: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/bonk/chart?days=${days}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
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
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">Chart Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => fetchChartData(selectedRange)} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No chart data available</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, metadata } = chartData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              BONK Price Chart
            </CardTitle>
            <CardDescription>
              {metadata.timeRange} • {metadata.totalPoints} data points • Last updated: {new Date(metadata.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: "line" | "area" | "candlestick") => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4" />
                    Line
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Area
                  </div>
                </SelectItem>
                <SelectItem value="candlestick">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Candles
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Real Chart Implementation */}
        <div className="mb-6">
          <div className="w-full h-64 bg-muted/10 rounded-lg p-4">
            {chartData.dataPoints.length > 0 ? (
              <svg width="100%" height="100%" viewBox="0 0 800 240" className="w-full h-full">
                {/* Chart background */}
                <rect width="100%" height="100%" fill="transparent" />
                
                {/* Y-axis grid lines */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = (i * 240) / 4;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1={y}
                      x2="800"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  );
                })}
                
                {/* X-axis grid lines */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const x = (i * 800) / 7;
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="240"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  );
                })}
                
                {/* Price line chart */}
                <polyline
                  fill="none"
                  stroke={summary.changePercent >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                  points={chartData.dataPoints.map((point, index) => {
                    const x = (index * 800) / (chartData.dataPoints.length - 1);
                    const priceRange = summary.highestPrice - summary.lowestPrice;
                    const y = 240 - ((point.price - summary.lowestPrice) / priceRange) * 200 - 20;
                    return `${x},${y}`;
                  }).join(" ")}
                />
                
                {/* Data points */}
                {chartData.dataPoints.map((point, index) => {
                  const x = (index * 800) / (chartData.dataPoints.length - 1);
                  const priceRange = summary.highestPrice - summary.lowestPrice;
                  const y = 240 - ((point.price - summary.lowestPrice) / priceRange) * 200 - 20;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={summary.changePercent >= 0 ? "#10b981" : "#ef4444"}
                    />
                  );
                })}
                
                {/* Chart labels */}
                <text x="10" y="20" fill="#6b7280" fontSize="12" fontWeight="500">
                  ${summary.highestPrice.toFixed(6)}
                </text>
                <text x="10" y="120" fill="#6b7280" fontSize="12" fontWeight="500">
                  ${((summary.highestPrice + summary.lowestPrice) / 2).toFixed(6)}
                </text>
                <text x="10" y="220" fill="#6b7280" fontSize="12" fontWeight="500">
                  ${summary.lowestPrice.toFixed(6)}
                </text>
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Price Change</div>
              <div className={`text-lg font-semibold flex items-center gap-1 ${getChangeColor(summary.changePercent)}`}>
                {getChangeIcon(summary.changePercent)}
                {formatPercentage(summary.changePercent)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(summary.changeAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Current Price</div>
              <div className="text-lg font-semibold">{formatPrice(summary.endPrice)}</div>
              <div className="text-xs text-muted-foreground">
                Start: {formatPrice(summary.startPrice)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">24h High</div>
              <div className="text-lg font-semibold text-green-500">{formatPrice(summary.highestPrice)}</div>
              <div className="text-xs text-muted-foreground">
                Low: {formatPrice(summary.lowestPrice)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
              <div className="text-lg font-semibold">{formatVolume(summary.totalVolume)}</div>
              <div className="text-xs text-muted-foreground">
                Avg: {formatVolume(summary.avgVolume)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Volume Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Highest Volume:</span>
                  <span className="font-medium">{formatVolume(summary.highestVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lowest Volume:</span>
                  <span className="font-medium">{formatVolume(summary.lowestVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Volume:</span>
                  <span className="font-medium">{formatVolume(summary.avgVolume)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price Range:</span>
                  <span className="font-medium">
                    {formatPrice(summary.lowestPrice)} - {formatPrice(summary.highestPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Points:</span>
                  <span className="font-medium">{metadata.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time Period:</span>
                  <span className="font-medium">{metadata.timeRange}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
