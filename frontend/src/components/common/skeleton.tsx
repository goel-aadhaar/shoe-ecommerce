export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-bone-deep ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-ink/15 bg-paper">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-3 border-t border-ink/15 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-4 flex justify-between border-t border-dashed border-ink/15 pt-3">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      </div>
    </div>
  );
}
