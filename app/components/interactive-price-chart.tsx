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

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercentage = (pct: number) => {
    const isPositive = pct >= 0;
    return (
      <span className={`inline-flex items-center space-x-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(pct).toFixed(2)}%</span>
      </span>
    );
  };

  // Format date for X-axis display
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <div className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchChartData(selectedRange)}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-950"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="border-orange-200 dark:border-orange-700 rounded-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">No chart data available</div>
      </div>
    );
  }

  const { dataPoints, summary, metadata } = chartData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <BarChart3 className="h-6 w-6" />
            <span>BONK Price Chart</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {metadata.timeRange} • {metadata.totalPoints} data points • Last updated: {new Date(metadata.lastUpdated).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchChartData(selectedRange)}
          className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-950"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Chart Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <ToggleGroup 
              type="single" 
              value={selectedRange} 
              onValueChange={(value) => value && setSelectedRange(value)}
              className="bg-gray-50 dark:bg-gray-900"
            >
                {timeRanges.map((range) => (
                <ToggleGroupItem 
                  key={range.value} 
                  value={range.value} 
                  className="data-[state=on]:bg-orange-500 data-[state=on]:text-white dark:data-[state=on]:bg-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900"
                >
                    {range.label}
                </ToggleGroupItem>
                ))}
            </ToggleGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <ToggleGroup 
              type="single" 
              value={chartMode} 
              onValueChange={(value) => value && setChartMode(value as "price" | "marketCap")}
              className="bg-gray-50 dark:bg-gray-900"
            >
              <ToggleGroupItem 
                value="price" 
                className="data-[state=on]:bg-orange-500 data-[state=on]:text-white dark:data-[state=on]:bg-orange-600 data-[state=off]:bg-white data-[state=off]:text-gray-700 dark:data-[state=off]:bg-gray-800 dark:data-[state=off]:text-gray-300"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="marketCap" 
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-700 data-[state=off]:bg-white data-[state=off]:text-gray-700 dark:data-[state=off]:bg-gray-800 dark:data-[state=off]:text-gray-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Cap
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      
        {/* Chart */}
        <div className="h-96 w-full">
          <div className="flex items-center justify-center mb-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              chartMode === "price" 
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}>
              {chartMode === "price" ? "Price Chart" : "Market Cap Chart"}
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatChartDate}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (chartMode === "price") {
                    return formatPrice(value);
                  }
                  return `$${formatNumber(value)}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid ${chartMode === "price" ? "#f97316" : "#2563eb"}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                formatter={(value: any, name: any) => {
                  if (chartMode === "price") {
                    return [formatPrice(value), "Price"];
                  }
                  return [`$${formatNumber(value)}`, "Market Cap"];
                }}
                labelFormatter={(label) => `Date: ${formatChartDate(label)}`}
              />
              <Area
                type="monotone"
                dataKey={chartMode === "price" ? "price" : "marketCap"}
                stroke={chartMode === "price" ? "#f97316" : "#2563eb"}
                strokeWidth={2}
                fill={chartMode === "price" ? "url(#colorPrice)" : "url(#colorMarketCap)"}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {formatPercentage(summary.changePercent)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price Change</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatPrice(summary.changeAmount)}
            </div>
          </div>
          
          <div className="text-center p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
              ${formatNumber(summary.totalVolume)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Avg: ${formatNumber(summary.avgVolume)}
            </div>
          </div>
          
          <div className="text-center p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-orange-950">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
              ${formatNumber(summary.highestVolume)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Volume</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Low: ${formatNumber(summary.lowestVolume)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <Skeleton className="h-8 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-96 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950">
              <Skeleton className="h-6 w-20 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
