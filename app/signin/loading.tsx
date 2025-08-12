import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SignInLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Skeleton className="w-12 h-12 rounded-lg mr-3" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Main Card Skeleton */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Requirements Skeleton */}
              <div className="text-center space-y-4">
                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Skeleton className="h-6 w-32 mx-auto mb-4" />
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-8 mx-auto" />
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connect Button Skeleton */}
              <Skeleton className="h-14 w-full rounded-lg" />

              {/* Help Links Skeleton */}
              <div className="flex justify-center space-x-4 pt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Security Notice Skeleton */}
              <div className="text-center space-y-2 pt-4 border-t">
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

