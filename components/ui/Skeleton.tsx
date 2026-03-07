interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded-md ${className}`}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}