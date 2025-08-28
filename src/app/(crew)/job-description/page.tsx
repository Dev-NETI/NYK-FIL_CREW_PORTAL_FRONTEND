"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import {
  JobDescriptionRequestForm,
  JobDescriptionStatus,
} from "@/components/job-description-module";

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
          ...(formData.purpose === "VISA" && formData.visaType && { visa_type: formData.visaType }),
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
      <Navigation currentPath="/job-description" />

      <main className="pt-20 pb-32 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-file-earmark-text text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Description Request
            </h1>
            <p className="text-gray-600">
              Request a job description file for official purposes
            </p>
          </div>

          {submitSuccess ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-check-circle text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your job description request has been sent to the Executive
                  Assistant and Vice President for processing.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <i className="bi bi-info-circle mr-2"></i>
                    You will receive email notifications about the status of
                    your request. You can also check the status in your
                    notifications.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <JobDescriptionRequestForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          <JobDescriptionStatus className="mt-8" />
        </div>
      </main>
    </div>
  );
}
