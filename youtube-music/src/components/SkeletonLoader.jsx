export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] animate-pulse">
      <div className="aspect-square rounded-lg bg-[#282828] mb-2"></div>
      <div className="h-3 bg-[#282828] rounded w-3/4 mb-1"></div>
      <div className="h-2.5 bg-[#282828] rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-2 animate-pulse">
      <div className="w-8 h-4 bg-[#282828] rounded"></div>
      <div className="w-10 h-10 bg-[#282828] rounded"></div>
      <div className="flex-1">
        <div className="h-3 bg-[#282828] rounded w-1/3 mb-1"></div>
        <div className="h-2.5 bg-[#282828] rounded w-1/4"></div>
      </div>
      <div className="w-12 h-3 bg-[#282828] rounded"></div>
    </div>
  );
}

export function SkeletonCircle() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px] animate-pulse">
      <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mx-auto rounded-full bg-[#282828] mb-3"></div>
      <div className="h-3 bg-[#282828] rounded w-3/4 mx-auto mb-1"></div>
      <div className="h-2.5 bg-[#282828] rounded w-1/2 mx-auto"></div>
    </div>
  );
}
