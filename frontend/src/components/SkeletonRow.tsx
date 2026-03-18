export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-3 w-16 rounded bg-muted" />
      <div className="h-5 w-20 rounded bg-muted" />
      <div className="h-3 w-4 rounded bg-muted" />
      <div className="h-5 w-20 rounded bg-muted" />
      <div className="ml-auto h-4 w-16 rounded bg-muted" />
      <div className="h-3 w-32 rounded bg-muted hidden sm:block" />
    </div>
  );
}
