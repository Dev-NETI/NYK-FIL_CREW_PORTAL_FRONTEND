"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/api";
import {
  TravelDocument,
  TravelDocumentService,
} from "@/services/travel-document";

interface DashboardStatsCardProps {
  currentUser: User | null;
  isLoaded?: boolean;
}

interface DocumentStats {
  expired: {
    travel: number;
    employment: number;
    total: number;
  };
  nearExpiring: {
    travel: number;
    employment: number;
    total: number;
  };
}

export default function DashboardStatsCard({
  currentUser,
  isLoaded = true,
}: DashboardStatsCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DocumentStats>({
    expired: { travel: 0, employment: 0, total: 0 },
    nearExpiring: { travel: 0, employment: 0, total: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentStats = async () => {
      if (!currentUser?.profile?.crew_id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch travel documents only (employment docs don't have expiration)
        const travelDocs =
          await TravelDocumentService.getTravelDocumentsByCrewId(
            currentUser.profile.crew_id
          );

        const now = new Date();
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

        // Analyze travel documents
        const travelStats = analyzeDocs(
          travelDocs as TravelDocument[],
          now,
          twoMonthsFromNow
        );

        setStats({
          expired: {
            travel: travelStats.expired,
            employment: 0,
            total: travelStats.expired,
          },
          nearExpiring: {
            travel: travelStats.nearExpiring,
            employment: 0,
            total: travelStats.nearExpiring,
          },
        });
      } catch (error) {
        console.error("Error fetching document stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentStats();
  }, [currentUser]);

  const analyzeDocs = (
    docs: TravelDocument[],
    now: Date,
    twoMonthsFromNow: Date
  ) => {
    let expired = 0;
    let nearExpiring = 0;

    docs.forEach((doc) => {
      const expirationDate = new Date(doc.expiration_date);

      if (expirationDate < now) {
        expired++;
      } else if (expirationDate <= twoMonthsFromNow) {
        nearExpiring++;
      }
    });

    return { expired, nearExpiring };
  };

  // Don't show anything if no issues
  if (
    !isLoading &&
    stats.expired.total === 0 &&
    stats.nearExpiring.total === 0
  ) {
    return null;
  }

  return (
    <div
      className={`mb-4 transform transition-all duration-1000 delay-500 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="px-3 sm:px-6 lg:px-8">
        {/* Compact Mobile-First Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Compact Header */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <i className="bi bi-exclamation-circle text-amber-400 text-lg mr-2"></i>
                  <span className="text-white font-semibold text-sm">
                    Document Alerts
                  </span>
                </div>
                <div className="bg-white/20 px-2 py-0.5 rounded-full">
                  <span className="text-white text-xs font-bold">
                    {stats.expired.total + stats.nearExpiring.total}
                  </span>
                </div>
              </div>

              {/* Compact Stats Grid */}
              <div className="p-3 space-y-2">
                {/* Expired - Compact Row */}
                {stats.expired.total > 0 && (
                  <div className="flex items-center justify-between bg-red-50 rounded-lg p-2.5 border border-red-200">
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="bg-red-500 rounded-full p-1.5 flex-shrink-0">
                        <i className="bi bi-x-circle text-white text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-red-900 text-xs leading-tight">
                          Expired
                        </p>
                        <p className="text-red-700 text-[10px] leading-tight">
                          Action needed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <i className="bi bi-passport text-red-600 text-xs"></i>
                          <span className="text-red-900 font-bold text-sm">
                            {stats.expired.travel}
                          </span>
                        </div>
                      </div>
                      <div className="bg-red-500 text-white font-bold text-base rounded-full w-8 h-8 flex items-center justify-center shadow">
                        {stats.expired.total}
                      </div>
                    </div>
                  </div>
                )}

                {/* Near Expiring - Compact Row */}
                {stats.nearExpiring.total > 0 && (
                  <div className="flex items-center justify-between bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="bg-amber-500 rounded-full p-1.5 flex-shrink-0">
                        <i className="bi bi-clock text-white text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-amber-900 text-xs leading-tight">
                          Expiring Soon
                        </p>
                        <p className="text-amber-700 text-[10px] leading-tight">
                          Within 2 months
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <i className="bi bi-passport text-amber-600 text-xs"></i>
                          <span className="text-amber-900 font-bold text-sm">
                            {stats.nearExpiring.travel}
                          </span>
                        </div>
                      </div>
                      <div className="bg-amber-500 text-white font-bold text-base rounded-full w-8 h-8 flex items-center justify-center shadow">
                        {stats.nearExpiring.total}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Minimal Footer */}
              <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  <i className="bi bi-clock-history mr-1"></i>Just now
                </span>
                <button
                  onClick={() => router.push("/crew/documents")}
                  className="text-[10px] text-blue-600 font-medium hover:text-blue-700 hover:underline transition-all"
                >
                  View Documents <i className="bi bi-arrow-right ml-0.5"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
