"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, LineChart, Activity, RefreshCw, DollarSign, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

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
  const [selectedRange, setSelectedRange] = useState("1");
  const [chartMode, setChartMode] = useState<"price" | "marketCap">("price");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
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

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedRange === "1") {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (selectedRange === "7") {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else if (selectedRange === "30") {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        year: '2-digit'
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {new Date(data.timestamp).toLocaleString()}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium">
                {chartMode === "price" ? "Price" : "Market Cap"}: {
                  chartMode === "price" ? formatPrice(data.price) : formatMarketCap(data.marketCap)
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Volume: {formatVolume(data.volume)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full border-border bg-card">
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
      <Card className="w-full border-border bg-card">
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
      <Card className="w-full border-border bg-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No chart data available</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, metadata, dataPoints } = chartData;

  // Debug logging to see what data we're receiving
  console.log('Chart Component Debug:', {
    chartMode,
    summary,
    dataPointsLength: dataPoints.length,
    firstDataPoint: dataPoints[0],
    lastDataPoint: dataPoints[dataPoints.length - 1],
    marketCapRange: {
      min: Math.min(...dataPoints.map(d => d.marketCap)),
      max: Math.max(...dataPoints.map(d => d.marketCap))
    }
  });

  // Calculate proper Y-axis ranges for better visualization
  const priceRange = summary.highestPrice - summary.lowestPrice;
  const volumeRange = Math.max(...dataPoints.map(d => d.volume)) - Math.min(...dataPoints.map(d => d.volume));
  
  const minPrice = summary.lowestPrice - (priceRange * 0.1);
  const maxPrice = summary.highestPrice + (priceRange * 0.1);
  const minVolume = Math.min(...dataPoints.map(d => d.volume)) - (volumeRange * 0.1);
  const maxVolume = Math.max(...dataPoints.map(d => d.volume)) + (volumeRange * 0.1);

  return (
    <Card className="w-full border-border bg-card shadow-lg">
      <CardHeader className="border-b border-border pb-2 md:pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground text-sm md:text-base">
              <Activity className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
              BONK {chartMode === "price" ? "Price" : "Market Cap"} Chart
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {metadata.timeRange} • {metadata.totalPoints} data points • Last updated: {new Date(metadata.lastUpdated).toLocaleString()}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Price/Market Cap Toggle */}
            <ToggleGroup type="single" value={chartMode} onValueChange={(value) => value && setChartMode(value as "price" | "marketCap")}>
              <ToggleGroupItem value="price" className="px-2 py-1 text-xs bg-background border-border hover:bg-accent">
                <DollarSign className="w-3 h-3 mr-1 text-purple-500" />
                Price
              </ToggleGroupItem>
              <ToggleGroupItem value="marketCap" className="px-2 py-1 text-xs bg-background border-border hover:bg-accent">
                <BarChart3 className="w-3 h-3 mr-1 text-blue-500" />
                Market Cap
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Time Range Selector */}
            <ToggleGroup type="single" value={selectedRange} onValueChange={(value) => value && setSelectedRange(value)}>
              {timeRanges.map((range) => (
                <ToggleGroupItem 
                  key={range.value} 
                  value={range.value} 
                  className="px-2 py-1 text-xs bg-background border-border hover:bg-accent data-[state=on]:bg-purple-500 data-[state=on]:text-white"
                >
                  {range.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
        {/* Chart */}
        <div className="h-80 md:h-96 w-full bg-muted/10 rounded-lg p-3 md:p-4 border border-border">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dataPoints} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
              />
              
              <YAxis 
                yAxisId="left"
                domain={[minPrice, maxPrice]}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => 
                  chartMode === "price" ? formatPrice(value) : formatMarketCap(value)
                }
              />
              
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[minVolume, maxVolume]}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={formatVolume}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Main Chart Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={chartMode === "price" ? "price" : "marketCap"}
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
              />
              
              {/* Area Fill */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey={chartMode === "price" ? "price" : "marketCap"}
                stroke="none"
                fill="url(#priceGradient)"
                fillOpacity={0.4}
              />
              
              {/* Volume Bars */}
              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="url(#volumeGradient)"
                opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center pt-2 md:pt-3">
          <Button 
            onClick={() => fetchChartData(selectedRange)} 
            variant="outline" 
            size="sm"
            className="px-3 md:px-4 py-1 h-7 md:h-8 text-xs md:text-sm border-border hover:bg-accent"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> 
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
