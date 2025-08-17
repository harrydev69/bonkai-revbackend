"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

export interface ChartData {
  hour: string
  engagement: number
  sentiment: number
}

const chartConfig = {
  engagement: {
    label: "Engagement",
    color: "var(--color-chart-1)",
  },
  sentiment: {
    label: "Sentiment",
    color: "var(--color-chart-2)"
  },
} satisfies ChartConfig;

interface EngagementTrendChartProps {
  data: ChartData[]
  isLoading: boolean
}

export function EngagementTrendChart({ data, isLoading }: EngagementTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment & Engagement Trends</CardTitle>
          <CardDescription>Hourly engagement and sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment & Engagement Trends</CardTitle>
        <CardDescription>Hourly engagement and sentiment analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full [&_.recharts-surface]:bg-muted/30">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          > 
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              yAxisId="left"
              dataKey="engagement"
              type="monotone"
              stroke={chartConfig.engagement.color}
              strokeWidth={3}
              dot={false}
            />
            <Line
              yAxisId="right"
              dataKey="sentiment"
              type="monotone"
              stroke={chartConfig.sentiment.color}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}