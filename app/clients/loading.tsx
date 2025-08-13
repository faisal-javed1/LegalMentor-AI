import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Search Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-4">
          <Skeleton className="h-10 w-full mb-4" /> {/* Table Header */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 ml-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
