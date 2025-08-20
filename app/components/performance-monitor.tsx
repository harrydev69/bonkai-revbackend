"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lcp } : null);
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      setMetrics(prev => prev ? { ...prev, firstContentfulPaint: fcpEntry.startTime } : null);
    }

    // Measure CLS
    let clsValue = 0;
    const observer2 = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null);
    });

    observer2.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      observer2.disconnect();
    };
  }, []);

  useEffect(() => {
    // Show performance monitor after 3 seconds
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !metrics) return null;

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.firstContentfulPaint > 1800) score -= 20;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.firstInputDelay > 100) score -= 20;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 20;
    
    return Math.max(0, score);
  };

  const score = getPerformanceScore();
  const isGood = score >= 80;
  const isWarning = score >= 60;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Monitor
            <Badge variant={isGood ? "default" : isWarning ? "secondary" : "destructive"}>
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>FCP:</span>
            <span className={metrics.firstContentfulPaint > 1800 ? 'text-red-600' : 'text-green-600'}>
              {Math.round(metrics.firstContentfulPaint)}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>LCP:</span>
            <span className={metrics.largestContentfulPaint > 2500 ? 'text-red-600' : 'text-green-600'}>
              {Math.round(metrics.largestContentfulPaint)}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>CLS:</span>
            <span className={metrics.cumulativeLayoutShift > 0.1 ? 'text-red-600' : 'text-green-600'}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </span>
          </div>
          {score < 80 && (
            <div className="flex items-center gap-2 text-orange-600 mt-2">
              <AlertTriangle className="w-3 h-3" />
              <span>Performance needs improvement</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
