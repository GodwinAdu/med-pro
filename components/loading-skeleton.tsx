"use client"

import { Heart } from "lucide-react"

export function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      {/* Header Skeleton */}
      <div className="mb-8 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="mb-8">
        <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-2 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-24 bg-muted rounded"></div>
                  <div className="h-3 w-32 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tips Skeleton */}
      <div className="mb-8">
        <div className="h-6 w-36 bg-muted rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="mx-auto max-w-md px-4 py-2">
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2 animate-pulse">
                <div className="w-6 h-6 bg-muted rounded"></div>
                <div className="h-2 w-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}