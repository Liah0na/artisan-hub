import Skeleton from "@/components/ui/Skeleton";

export default function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">

      <div className="grid gap-12 md:grid-cols-2">

        {/* IMAGE AREA */}
        <div>
          <Skeleton className="aspect-square rounded-2xl" />

          <div className="flex gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-20 h-20 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* INFO AREA */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />

          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="pt-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-16">
        <Skeleton className="h-6 w-1/3 mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}