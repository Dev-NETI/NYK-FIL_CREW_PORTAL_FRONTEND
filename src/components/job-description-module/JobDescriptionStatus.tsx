"use client";

import { useState } from "react";

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

interface JobDescriptionStatusProps {
  crewId?: string;
  className?: string;
}

export default function JobDescriptionStatus({
  className = "",
}: JobDescriptionStatusProps) {
  const [requests] = useState<JobDescriptionRequest[]>([
    {
      id: "JD-001",
      purpose: "SSS",
      status: "in_progress",
      requestDate: "2025-01-15",
      notes: "Social Security System application",
    },
    {
      id: "JD-002",
      purpose: "VISA",
      visaType: "SEAMAN",
      status: "approved",
      requestDate: "2025-01-10",
      approvedDate: "2025-01-16",
      memoNo: "NYK-JD-2025-002",
    },
    {
      id: "JD-003",
      purpose: "PHILHEALTH",
      status: "disapproved",
      requestDate: "2025-01-08",
      disapprovalReason: "Incomplete contract information provided",
    },
  ]);

  const [selectedRequest, setSelectedRequest] =
    useState<JobDescriptionRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready_for_approval":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "disapproved":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "bi-clock";
      case "in_progress":
        return "bi-gear";
      case "ready_for_approval":
        return "bi-eye";
      case "approved":
        return "bi-check-circle";
      case "disapproved":
        return "bi-x-circle";
      default:
        return "bi-question-circle";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "in_progress":
        return "Being Processed";
      case "ready_for_approval":
        return "Awaiting VP Approval";
      case "approved":
        return "Approved & Ready";
      case "disapproved":
        return "Disapproved";
      default:
        return "Unknown";
    }
  };

  const handleViewDetails = (request: JobDescriptionRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleDownload = (request: JobDescriptionRequest) => {
    // Simulate PDF download
    alert(
      `Downloading Job Description PDF for ${request.purpose} request (${request.memoNo})`
    );
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: "submitted", label: "Submitted", icon: "bi-send" },
      { key: "processing", label: "EA Processing", icon: "bi-gear" },
      { key: "vp_review", label: "VP Review", icon: "bi-eye" },
      { key: "completed", label: "Completed", icon: "bi-check-circle" },
    ];

    const currentStep =
      {
        pending: 0,
        in_progress: 1,
        ready_for_approval: 2,
        approved: 3,
        disapproved: -1,
      }[status] ?? 0;

    return { steps, currentStep };
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="bi bi-file-earmark-text mr-2 text-blue-600"></i>
            Job Description Requests
          </h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {requests.length} Total
          </span>
        </div>
      </div>

      <div className="p-4">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <i className="bi bi-file-earmark-text text-gray-400 text-4xl mb-3"></i>
            <p className="text-gray-500">No job description requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      <i
                        className={`bi ${getStatusIcon(request.status)} mr-1`}
                      ></i>
                      {getStatusText(request.status)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                  {request.memoNo && (
                    <span className="text-xs font-medium text-blue-600">
                      {request.memoNo}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.purpose}
                      {request.visaType && ` - ${request.visaType}`}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {request.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Steps */}
                {request.status !== "disapproved" && (
                  <div className="mb-4">
                    {(() => {
                      const { steps, currentStep } = getProgressSteps(
                        request.status
                      );
                      return (
                        <div className="flex items-center space-x-2">
                          {steps.map((step, index) => (
                            <div key={step.key} className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  index <= currentStep
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                <i className={`bi ${step.icon}`}></i>
                              </div>
                              {index < steps.length - 1 && (
                                <div
                                  className={`w-12 h-0.5 mx-1 ${
                                    index < currentStep
                                      ? "bg-blue-600"
                                      : "bg-gray-200"
                                  }`}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Disapproval Reason */}
                {request.status === "disapproved" &&
                  request.disapprovalReason && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <i className="bi bi-exclamation-triangle text-red-600 text-sm mt-0.5 mr-2"></i>
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Disapproval Reason:
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            {request.disapprovalReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <i className="bi bi-eye mr-1"></i>
                    View Details
                  </button>

                  {request.status === "approved" && request.memoNo && (
                    <button
                      onClick={() => handleDownload(request)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      <i className="bi bi-download mr-1"></i>
                      Download PDF
                    </button>
                  )}

                  {request.status === "disapproved" && (
                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                      <i className="bi bi-arrow-clockwise mr-1"></i>
                      Resubmit Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Job Description Request Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request ID
                  </label>
                  <p className="text-sm text-gray-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRequest.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.purpose}
                    {selectedRequest.visaType &&
                      ` - ${selectedRequest.visaType}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    <i
                      className={`bi ${getStatusIcon(
                        selectedRequest.status
                      )} mr-1`}
                    ></i>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>
              </div>

              {selectedRequest.memoNo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Memo Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedRequest.memoNo}
                  </p>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {selectedRequest.disapprovalReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <label className="block text-sm font-medium text-red-800 mb-1">
                    Disapproval Reason
                  </label>
                  <p className="text-sm text-red-700">
                    {selectedRequest.disapprovalReason}
                  </p>
                </div>
              )}

              {selectedRequest.status === "approved" &&
                selectedRequest.approvedDate && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="bi bi-check-circle text-green-600 mr-2"></i>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Approved on{" "}
                          {new Date(
                            selectedRequest.approvedDate
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-green-700">
                          Your job description document is ready for download.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedRequest.status === "approved" &&
                  selectedRequest.memoNo && (
                    <button
                      onClick={() => handleDownload(selectedRequest)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <i className="bi bi-download mr-2"></i>
                      Download PDF
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
