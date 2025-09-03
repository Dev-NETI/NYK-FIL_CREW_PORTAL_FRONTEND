"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import JobDescriptionStatus from "@/components/job-description-module/JobDescriptionStatus";
import Link from "next/link";

interface JobDescriptionRequest {
  id: string;
  purpose: string;
  visaType?: string;
  status:
    | "pending"
    | "in_progress"
    | "ready_for_approval"
    | "approved"
    | "disapproved";
  requestDate: string;
  notes?: string;
  memoNo?: string;
  disapprovalReason?: string;
  approvedDate?: string;
}

export default function JobDescriptionStatusPage() {
  const [requests, setRequests] = useState<JobDescriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with crew_id 219454 data
    const fetchRequests = async () => {
      try {
        // Simulated data for crew_id 219454
        const mockData: JobDescriptionRequest[] = [
          {
            id: "JD-2025-001",
            purpose: "SSS",
            status: "approved",
            requestDate: "2025-01-20",
            notes: "Social Security System verification for pension claims",
            memoNo: "NYK-JD-2025-001",
            approvedDate: "2025-01-25",
          },
          {
            id: "JD-2025-002",
            purpose: "VISA",
            visaType: "SEAMAN",
            status: "in_progress",
            requestDate: "2025-01-22",
            notes: "Seaman's visa application for upcoming vessel assignment",
          },
          {
            id: "JD-2025-003",
            purpose: "PHILHEALTH",
            status: "ready_for_approval",
            requestDate: "2025-01-18",
            notes: "PhilHealth membership verification and benefits update",
          },
          {
            id: "JD-2025-004",
            purpose: "PAG_IBIG",
            status: "disapproved",
            requestDate: "2025-01-15",
            notes: "Pag-Ibig fund membership and contribution verification",
            disapprovalReason: "Incomplete employment contract documentation. Please provide updated contract with current vessel assignment details.",
          },
          {
            id: "JD-2025-005",
            purpose: "VISA",
            visaType: "BUSINESS",
            status: "pending",
            requestDate: "2025-01-28",
            notes: "Business visa for training program in Singapore",
          },
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRequests(mockData);
      } catch (error) {
        console.error("Error fetching job description requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation currentPath="/job-description/status" />

      <main className="pt-16 sm:pt-20 pb-24 sm:pb-32 md:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Link
              href="/job-description"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group text-sm sm:text-base"
            >
              <i className="bi bi-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i>
              <span className="hidden sm:inline">Back to Job Description Request</span>
              <span className="sm:hidden">Back to Request</span>
            </Link>
          </div>

          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
              <i className="bi bi-list-check text-white text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Job Description Status
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
              Track the progress of your job description requests
            </p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 border-2 sm:border-3 border-blue-600 border-t-transparent mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Loading your requests...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-center">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                      <i className="bi bi-file-earmark-text mr-1 sm:mr-2 text-blue-600"></i>
                      <span className="hidden sm:inline">Your Job Description Requests</span>
                      <span className="sm:hidden">Your Requests</span>
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                      {requests.length} Total
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                      <span className="hidden sm:inline">Crew ID: </span>219454
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-6">
                {requests.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-12">
                    <i className="bi bi-file-earmark-text text-gray-400 text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4"></i>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base">No job description requests found.</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Submit a new request to get started.</p>
                  </div>
                ) : (
                  <JobDescriptionStatus requests={requests} />
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/job-description"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm sm:text-base rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="bi bi-plus-circle mr-2"></i>
                  <span className="hidden sm:inline">Submit New Request</span>
                  <span className="sm:hidden">New Request</span>
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium text-sm sm:text-base rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="bi bi-arrow-clockwise mr-2"></i>
                  <span className="hidden sm:inline">Refresh Status</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}