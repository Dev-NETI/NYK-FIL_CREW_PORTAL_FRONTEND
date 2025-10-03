import React from "react";

function EmploymentDocumentListSkeleton() {
  return (
    <div className="space-y-4 mb-28">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-5 border border-gray-200 animate-pulse"
        >
          <div className="flex items-start gap-4">
            {/* Icon Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-xl"></div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title Skeleton */}
              <div className="h-6 bg-gray-300 rounded w-32"></div>

              {/* Document Number Skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-48"></div>
              </div>

              {/* Created At Skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-40"></div>
              </div>

              {/* Modified By Skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-36"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmploymentDocumentListSkeleton;
