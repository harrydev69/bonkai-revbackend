"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PremiumLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Wallet Connection */}
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center pb-6">
                <Skeleton className="h-6 w-48 mx-auto mb-2" />
                <Skeleton className="h-8 w-64 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-4 w-28 mx-auto mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

