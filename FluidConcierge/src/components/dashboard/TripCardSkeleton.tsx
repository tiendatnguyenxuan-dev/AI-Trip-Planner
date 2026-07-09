export default function TripCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden animate-pulse shadow-md">
      <div className="h-64 bg-primary/5"></div>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-primary/5 rounded w-3/4"></div>
        <div className="h-4 bg-primary/5 rounded w-full"></div>
        <div className="h-4 bg-primary/5 rounded w-2/3"></div>
      </div>
    </div>
  );
}
