'use client';

import React from 'react';
import { Card } from './card';
import { Skeleton } from './skeleton';

export default function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-0">
        {/* Image Skeleton */}
        <div className="relative aspect-square bg-gray-100">
          <Skeleton className="w-full h-full" />
          
          {/* Badge Skeletons */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Brand and Category */}
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Product Name */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Price */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Button */}
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </Card>
  );
}
