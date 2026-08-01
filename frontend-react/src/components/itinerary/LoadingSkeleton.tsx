export default function LoadingSkeleton() {
  return (
    <div className="p-8 min-h-[calc(100vh-64px)] animate-pulse">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-10 bg-surface-container-high rounded-xl w-64"></div>
        <div className="h-6 bg-surface-container-high rounded-xl w-96"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface-container-low rounded-xl"></div>
            ))}
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-48 bg-surface-container-low rounded-xl"></div>
            <div className="h-64 bg-surface-container-low rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
