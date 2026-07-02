/** Skeleton shown while authenticated pages fetch their data. */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="불러오는 중">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted-bg" />
        <div className="h-7 w-56 animate-pulse rounded-lg bg-muted-bg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
