"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import { JobDescriptionRequestForm } from "@/components/job-description-module";
import Link from "next/link";

export default function JobDescriptionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (formData: {
    purpose: string;
    visaType?: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/job-description-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          purpose: formData.purpose,
          ...(formData.purpose === "VISA" &&
            formData.visaType && { visa_type: formData.visaType }),
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        throw new Error(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting job description request:", error);
      alert("Failed to submit job description request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation currentPath="/crew/job-description" />

      <main className="pt-16 sm:pt-20 pb-24 sm:pb-32 md:pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i className="bi bi-file-earmark-text text-white text-lg sm:text-2xl"></i>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Job Description Request
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
              Request a job description file for official purposes
            </p>
          </div>

          {submitSuccess ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="bi bi-check-circle text-green-600 text-2xl sm:text-3xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-2 sm:px-0">
                  Your job description request has been sent to the Executive
                  Assistant and Vice President for processing.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-800 mb-3">
                    <i className="bi bi-info-circle mr-2"></i>
                    You will receive email notifications about the status of
                    your request.
                  </p>
                  <Link
                    href="/job-description/status"
                    className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <i className="bi bi-arrow-right-circle mr-2"></i>
                    View detailed status tracking
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <JobDescriptionRequestForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Status Check Card */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="bi bi-list-check text-white text-lg sm:text-xl"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Check Your Job Description Request Status
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2 sm:px-0">
                  Track the progress of your submitted job description requests
                  and download approved documents
                </p>
                <Link
                  href="/job-description/status"
                  className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium text-sm sm:text-base rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <i className="bi bi-arrow-right-circle mr-2"></i>
                  <span className="hidden sm:inline">View Request Status</span>
                  <span className="sm:hidden">View Status</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
