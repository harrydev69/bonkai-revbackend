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
      
      console.log(`Fetching chart data for ${days} days...`);
      const response = await fetch(`/api/bonk/chart?days=${days}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Chart data received:', data);
      console.log('Data points:', data.dataPoints);
      console.log('First data point:', data.dataPoints?.[0]);
      console.log('Last data point:', data.dataPoints?.[data.dataPoints?.length - 1]);
      
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      console.error('Chart fetch error:', err);
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
      <span className={`inline-flex items-center space-x-1 text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(pct).toFixed(2)}%</span>
      </span>
    );
  };

  const formatChartDate = (date: string | number) => {
    if (typeof date === 'string') {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      // Format based on selectedRange
      if (selectedRange === '1') {
        return d.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (selectedRange === '7') {
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      } else {
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
    return 'Invalid Date';
  };

  // Process chart data for proper display
  const dataPoints = useMemo(() => {
    if (!chartData?.dataPoints) {
      console.log('No dataPoints found in chartData, checking alternative structure...');
      console.log('chartData keys:', Object.keys(chartData || {}));
      
      // Try alternative data structure - check if it's a different API response format
      if (chartData && typeof chartData === 'object' && 'data' in chartData) {
        console.log('Found alternative data structure, using that instead');
        return (chartData as any).data || [];
      }
      
      console.log('No valid chart data structure found');
      return [];
    }
    
    // Sort data points by timestamp to ensure proper chronological order
    const sortedData = [...chartData.dataPoints].sort((a, b) => a.timestamp - b.timestamp);
    
    // Filter out any invalid data points
    const validData = sortedData.filter(point => 
      point.price > 0 && 
      point.timestamp > 0 && 
      !isNaN(point.price) && 
      !isNaN(point.timestamp)
    );
    
    const processed = validData.map(point => ({
      ...point,
      date: formatChartDate(point.date),
      // Ensure price is properly formatted for display
      displayPrice: formatPrice(point.price)
    }));
    
    return processed;
  }, [chartData]);

  const summary = chartData?.summary || {
    startPrice: 0,
    endPrice: 0,
    changePercent: 0,
    changeAmount: 0,
    highestPrice: 0,
    lowestPrice: 0,
    totalVolume: 0,
    avgVolume: 0,
    highestVolume: 0,
    lowestVolume: 0
  };

  const metadata = chartData?.metadata || {
    totalPoints: 0,
    timeRange: '',
    lastUpdated: ''
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <BarChart3 className="h-6 w-6" />
            <span>BONK Price Chart</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            BONK Price Chart
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
              className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
            >
                {timeRanges.map((range) => (
                <ToggleGroupItem 
                  key={range.value} 
                  value={range.value} 
                  className="px-3 py-2 rounded-md data-[state=on]:bg-orange-500 data-[state=on]:text-white dark:data-[state=on]:bg-orange-600 data-[state=off]:bg-transparent data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                    {range.label}
                </ToggleGroupItem>
                ))}
            </ToggleGroup>
          </div>
          
          <div className="flex items-center space-x-3">
            <ToggleGroup 
              type="single" 
              value={chartMode} 
              onValueChange={(value) => value && setChartMode(value as "price" | "marketCap")}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
            >
              <ToggleGroupItem 
                value="price" 
                className="px-4 py-2 rounded-md data-[state=on]:bg-orange-500 data-[state=on]:text-white dark:data-[state=on]:bg-orange-600 data-[state=off]:bg-transparent data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="marketCap" 
                className="px-4 py-2 rounded-md data-[state=on]:bg-blue-600 data-[state=on]:text-white dark:data-[state=on]:bg-blue-700 data-[state=off]:bg-transparent data-[state=off]:text-gray-700 dark:data-[state=off]:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Cap
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      
        {/* Chart */}
        <div className="h-96 w-full">
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
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - dataMin * 0.001', 'dataMax + dataMax * 0.001']}
                tickFormatter={(value) => {
                  if (chartMode === "price") {
                    // Use tight, dynamic range like CoinGecko - show actual price movement
                    return `$${value.toFixed(8)}`;
                  }
                  return `$${formatNumber(value)}`;
                }}
              />
              <XAxis 
                dataKey="timestamp" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(timestamp) => {
                  // Convert timestamp to proper date format
                  const date = new Date(timestamp);
                  if (isNaN(date.getTime())) {
                    console.error('Invalid timestamp:', timestamp);
                    return 'Invalid Date';
                  }
                  
                  // Format like CoinGecko - every 3 hours for cleaner appearance
                  if (selectedRange === '1') {
                    // For 24H, show every 3 hours like CoinGecko
                    const hour = date.getHours();
                    if (hour % 3 === 0) {
                      return date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      });
                    }
                    return ''; // Hide other labels
                  } else if (selectedRange === '7') {
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
                labelFormatter={(timestamp) => {
                  // Convert timestamp to proper date format for tooltip
                  const date = new Date(timestamp);
                  if (isNaN(date.getTime())) {
                    console.error('Invalid timestamp in tooltip:', timestamp);
                    return 'Date: Invalid Date';
                  }
                  
                  // Format like CoinGecko: "Aug 21, 2025, 12:57:28 GMT+8"
                  const formattedDate = date.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                  
                  return `Date: ${formattedDate}`;
                }}
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
