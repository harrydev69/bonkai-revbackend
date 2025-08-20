"use client";

import { Suspense, lazy, ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  props?: any;
}

const defaultFallback = (
  <Card className="w-full h-32">
    <CardContent className="flex items-center justify-center h-full">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </CardContent>
  </Card>
);

export function LazyWrapper({ 
  component: Component, 
  fallback = defaultFallback,
  props = {}
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

// Pre-defined lazy components for common use cases
export const LazyChart = lazy(() => import('./sentiment-trend-chart').then(m => ({ default: m.SentimentTrendChart })));
export const LazyRadarChart = lazy(() => import('./mindshare-radar-chart').then(m => ({ default: m.MindshareRadarChart })));
export const LazyWordCloud = lazy(() => import('./social-word-cloud').then(m => ({ default: m.SocialWordCloud })));
export const LazyWhaleTracker = lazy(() => import('./whale-movement-tracker').then(m => ({ default: m.WhaleMovementTracker })));
export const LazyVolumeHeatmap = lazy(() => import('./volume-heatmap').then(m => ({ default: m.VolumeHeatmap })));
