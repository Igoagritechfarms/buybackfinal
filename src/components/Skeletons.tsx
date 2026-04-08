/**
 * Reusable skeleton/loading placeholder components
 * Used while async data is being fetched
 */

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-3xl border border-agri-earth-200 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-agri-earth-100 rounded-full w-3/4" />
        <div className="h-3 bg-agri-earth-100 rounded-full w-full" />
        <div className="h-3 bg-agri-earth-100 rounded-full w-5/6" />
        <div className="pt-2">
          <div className="h-10 bg-agri-green-100 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="w-full h-80 bg-white rounded-3xl border border-agri-earth-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-agri-earth-100 rounded-full w-1/4" />
        <div className="flex-1 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-agri-earth-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 p-4 border-b border-agri-earth-100 animate-pulse">
      <div className="h-10 w-10 bg-agri-earth-100 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-agri-earth-100 rounded-full w-1/4" />
        <div className="h-3 bg-agri-earth-100 rounded-full w-1/2" />
      </div>
      <div className="h-4 bg-agri-earth-100 rounded-full w-20" />
    </div>
  );
}

export function SkeletonGraph() {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-agri-earth-50 to-agri-earth-100 rounded-3xl border border-agri-earth-200 p-6 animate-pulse flex items-end gap-2">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-agri-green-100 rounded-t-lg"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-agri-earth-100 rounded-full w-1/4" />
          <div className="h-10 bg-agri-earth-100 rounded-xl w-full" />
        </div>
      ))}
      <div className="h-10 bg-agri-green-100 rounded-xl w-full mt-6" />
    </div>
  );
}

export function SkeletonTicker() {
  return (
    <div className="flex gap-3 px-5 py-2 border-r border-white/10 shrink-0 animate-pulse">
      <div className="space-y-2">
        <div className="h-2 bg-white/20 rounded-full w-16" />
        <div className="h-3 bg-white/20 rounded-full w-20" />
      </div>
      <div className="text-right space-y-1">
        <div className="h-3 bg-white/20 rounded-full w-16" />
        <div className="h-2 bg-white/20 rounded-full w-12" />
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards for loading lists
 */
export function SkeletonGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-${columns}`}>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
