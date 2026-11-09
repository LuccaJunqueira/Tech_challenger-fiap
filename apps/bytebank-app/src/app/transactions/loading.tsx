export default function TransactionsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-white/10 rounded" />
          <div className="h-4 w-28 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-36 bg-white/10 rounded-pill" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-white/5 rounded-xl p-4 space-y-3"
          >
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-8 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-bg-surface border border-white/5 rounded-xl p-4 space-y-3">
        <div className="h-5 w-40 bg-white/10 rounded mb-2" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-4 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
