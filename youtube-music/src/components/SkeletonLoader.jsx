export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px]">
      <div className="aspect-square rounded-lg animate-shimmer mb-2"></div>
      <div className="h-3 animate-shimmer rounded w-3/4 mb-1"></div>
      <div className="h-2.5 animate-shimmer rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <div className="w-8 h-4 animate-shimmer rounded"></div>
      <div className="w-10 h-10 animate-shimmer rounded"></div>
      <div className="flex-1">
        <div className="h-3 animate-shimmer rounded w-1/3 mb-1"></div>
        <div className="h-2.5 animate-shimmer rounded w-1/4"></div>
      </div>
      <div className="w-12 h-3 animate-shimmer rounded"></div>
    </div>
  );
}

export function SkeletonCircle() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px]">
      <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mx-auto rounded-full animate-shimmer mb-3"></div>
      <div className="h-3 animate-shimmer rounded w-3/4 mx-auto mb-1"></div>
      <div className="h-2.5 animate-shimmer rounded w-1/2 mx-auto"></div>
    </div>
  );
}
