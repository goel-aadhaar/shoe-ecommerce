export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-brown-100 ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-brown-200 bg-white shadow-sm">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex justify-between mt-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      </div>
    </div>
  );
}
