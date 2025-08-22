import { Suspense } from 'react';
import { HoldersDashboard } from '@/app/components/holders-dashboard';

// Simple loading skeleton for holders page
function HoldersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HoldersPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          BONK Holders Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive analysis of BONK token holders, distribution, and trends
        </p>
      </div>
      
      <Suspense fallback={<HoldersSkeleton />}>
        <HoldersDashboard />
      </Suspense>
    </div>
  );
}
