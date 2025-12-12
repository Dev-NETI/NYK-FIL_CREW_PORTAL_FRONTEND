"use client";

import { useState } from "react";
import { TravelDocumentUpdate } from "@/services/travel-document-approval";
import {
  X,
  Check,
  XCircle,
  ArrowRight,
  Eye,
  Calendar,
  MapPin,
} from "lucide-react";
import TravelDocumentViewerModalComponent from "./TravelDocumentViewerModalComponent";

interface TravelDocumentApprovalModalProps {
  update: TravelDocumentUpdate;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

export default function TravelDocumentApprovalModal({
  update,
  onClose,
  onApprove,
  onReject,
}: TravelDocumentApprovalModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [initialDocumentView, setInitialDocumentView] = useState<
    "current" | "pending"
  >("current");

  const hasCurrentDocument = !!update.travelDocument?.file_path;
  const hasPendingDocument = !!update.updated_data.file_path;

  const openDocumentViewer = (type: "current" | "pending") => {
    setInitialDocumentView(type);
    setShowDocumentViewer(true);
  };

  const getCrewName = () => {
    const profile = update.travelDocument?.userProfile;
    if (!profile) return "Unknown Crew";
    return `${profile.first_name} ${profile.middle_name || ""} ${
      profile.last_name
    }`.trim();
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      crew_id: "Crew ID",
      travel_document_type_id: "Document Type ID",
      id_no: "ID Number",
      place_of_issue: "Place of Issue",
      date_of_issue: "Date of Issue",
      expiration_date: "Expiration Date",
      remaining_pages: "Remaining Pages",
      visa_type: "Visa Type",
      is_US_VISA: "US Visa",
      file_path: "Document File",
      file_ext: "File Extension",
    };
    return labels[key] || key;
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "-";

    // Date formatting
    if (key === "date_of_issue" || key === "expiration_date") {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Boolean formatting
    if (key === "is_US_VISA") {
      return value ? "Yes" : "No";
    }

    // File path formatting
    if (key === "file_path") {
      return value ? "Document attached" : "No document";
    }

    return String(value);
  };

  const renderFieldComparison = (key: string) => {
    const originalValue = update.original_data[key];
    const updatedValue = update.updated_data[key];

    // Skip file_ext
    if (key === "file_ext") return null;

    // Skip if both are empty/null
    if (!originalValue && !updatedValue) return null;

    const hasChanged = originalValue !== updatedValue;
    const isFilePath = key === "file_path";

    return (
      <div
        key={key}
        className={`p-4 rounded-lg ${
          hasChanged ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
        }`}
      >
        <div className="text-sm font-medium text-gray-700 mb-2">
          {getFieldLabel(key)}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Original</div>
            {isFilePath && originalValue ? (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    hasChanged ? "line-through text-red-600" : "text-gray-900"
                  }`}
                >
                  Document attached
                </span>
                {hasCurrentDocument && (
                  <button
                    onClick={() => openDocumentViewer("current")}
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`text-sm ${
                  hasChanged ? "line-through text-red-600" : "text-gray-900"
                }`}
              >
                {formatValue(key, originalValue)}
              </div>
            )}
          </div>
          {hasChanged && (
            <ArrowRight className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Updated</div>
            {isFilePath && updatedValue ? (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    hasChanged ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {hasChanged ? "New document attached" : "Document attached"}
                </span>
                {hasPendingDocument && (
                  <button
                    onClick={() => openDocumentViewer("pending")}
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`text-sm font-medium ${
                  hasChanged ? "text-green-600" : "text-gray-900"
                }`}
              >
                {formatValue(key, updatedValue)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(update.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setProcessing(true);
    await onReject(update.id, rejectionReason);
    setProcessing(false);
  };

  const isPending = update.status === "pending";
  const isNewDocument = update.original_data.id_no?.startsWith("PENDING_");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Travel Document {isNewDocument ? "Creation" : "Update"} Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review changes before approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Crew Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">
                Crew Information
              </h3>
              {(hasCurrentDocument || hasPendingDocument) && (
                <div className="flex items-center gap-2">
                  {hasCurrentDocument && (
                    <button
                      onClick={() => openDocumentViewer("current")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Current
                    </button>
                  )}
                  {hasPendingDocument && (
                    <button
                      onClick={() => openDocumentViewer("pending")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View {hasCurrentDocument ? "Pending" : "Document"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getCrewName()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Crew ID</div>
                  <div className="text-sm font-medium text-gray-900">
                    {update.travelDocument?.userProfile?.crew_id || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Document Type
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {update.travelDocument?.travelDocumentType?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Submitted At</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(update.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {!isPending && (
            <div className="mb-6">
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  update.status === "approved"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {update.status === "approved" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {update.status === "approved" ? "Approved" : "Rejected"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    By {update.reviewed_by} on{" "}
                    {update.reviewed_at
                      ? new Date(update.reviewed_at).toLocaleString()
                      : "N/A"}
                  </div>
                  {update.rejection_reason && (
                    <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                      Reason: {update.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New Document Notice */}
          {isNewDocument && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">
                    New Document Creation Request
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    This is a request to create a new travel document. No
                    existing document will be modified.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Changes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {isNewDocument ? "Document Details" : "Proposed Changes"}
            </h3>
            <div className="space-y-3">
              {Object.keys(update.updated_data)
                .filter((key) => key !== "file_ext")
                .map((key) => renderFieldComparison(key))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {isPending && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {!showRejectForm ? (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {processing ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={processing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={processing || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : "Confirm Rejection"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    disabled={processing}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isPending && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && (
        <TravelDocumentViewerModalComponent
          isOpen={showDocumentViewer}
          onClose={() => setShowDocumentViewer(false)}
          documentTypeName={
            update.travelDocument?.travelDocumentType?.name ||
            "Travel Document"
          }
          travelDocumentId={update.travelDocument?.id || 0}
          currentDocumentPath={update.travelDocument?.file_path || undefined}
          pendingDocumentPath={update.updated_data.file_path || undefined}
          initialView={initialDocumentView}
        />
      )}
    </div>
  );
}
