"use client";

interface CalendarSkeletonProps {
  daysInWeek?: number;
  weeks?: number;
  className?: string;
  showHeader?: boolean;
}

export default function CalendarSkeleton({
  daysInWeek = 7,
  weeks = 6,
  className = "",
  showHeader = true,
}: CalendarSkeletonProps) {
  const shimmer =
    "relative overflow-hidden bg-gray-200 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <div className={`bg-white rounded-xl shadow p-4 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className={`h-6 w-40 ${shimmer}`} />
          <div className="flex gap-2">
            <div className={`h-9 w-24 ${shimmer}`} />
            <div className={`h-9 w-24 ${shimmer}`} />
          </div>
        </div>
      )}

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: daysInWeek }).map((_, i) => (
          <div key={i} className={`h-6 ${shimmer}`} />
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: weeks * daysInWeek }).map((_, i) => (
          <div key={i} className={`h-20 ${shimmer}`} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
