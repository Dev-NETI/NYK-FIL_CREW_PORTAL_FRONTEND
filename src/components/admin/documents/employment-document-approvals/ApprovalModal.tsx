"use client";

import { useState } from "react";
import { EmploymentDocumentUpdate } from "@/services/employment-document-approval";
import { X, Check, XCircle, ArrowRight, Eye } from "lucide-react";
import DocumentViewerModalComponent from "./DocumentViewerModalComponent";

interface ApprovalModalProps {
  update: EmploymentDocumentUpdate;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

export default function ApprovalModal({
  update,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [initialDocumentView, setInitialDocumentView] = useState<
    "current" | "pending"
  >("current");

  const getCrewName = () => {
    const profile = update.employment_document?.user_profile;
    if (!profile) return "Unknown Crew";
    return `${profile.first_name} ${profile.middle_name || ""} ${
      profile.last_name
    }`.trim();
  };

  const hasCurrentDocument = !!update.employment_document?.file_path;
  const hasPendingDocument = !!update.updated_data.file_path;

  const openDocumentViewer = (type: "current" | "pending") => {
    setInitialDocumentView(type);
    setShowDocumentViewer(true);
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      crew_id: "Crew ID",
      employment_document_type_id: "Document Type ID",
      document_number: "Document Number",
      file_path: "File Path",
      file_ext: "File Extension",
    };
    return labels[key] || key;
  };

  const renderFieldComparison = (key: string) => {
    const originalValue = update.original_data[key];
    const updatedValue = update.updated_data[key];

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
            <div
              className={`text-sm ${
                hasChanged ? "line-through text-red-600" : "text-gray-900"
              }`}
            >
              {isFilePath && originalValue ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Document attached</span>
                  {hasCurrentDocument && (
                    <button
                      onClick={() => openDocumentViewer("current")}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  )}
                </div>
              ) : (
                originalValue || <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
          {hasChanged && (
            <ArrowRight className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Updated</div>
            <div
              className={`text-sm font-medium ${
                hasChanged ? "text-green-600" : "text-gray-900"
              }`}
            >
              {isFilePath && updatedValue ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">
                    New document attached
                  </span>
                  {hasPendingDocument && (
                    <button
                      onClick={() => openDocumentViewer("pending")}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  )}
                </div>
              ) : (
                updatedValue || <span className="text-gray-400">-</span>
              )}
            </div>
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Employment Document Update Request
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
                <button
                  onClick={() =>
                    openDocumentViewer(
                      hasPendingDocument ? "pending" : "current"
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Documents
                </button>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{getCrewName()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Crew ID</div>
                  <div className="font-medium">
                    {update.employment_document?.user_profile?.crew_id || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Document Type</div>
                  <div className="font-medium">
                    {update.employment_document?.employment_document_type
                      ?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Submitted</div>
                  <div className="font-medium">
                    {new Date(update.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium capitalize">{update.status}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Changes Comparison */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Proposed Changes
            </h3>
            <div className="space-y-3">
              {Object.keys(update.updated_data).map((key) =>
                renderFieldComparison(key)
              )}
            </div>
          </div>

          {/* Rejection Info (if already rejected) */}
          {update.status === "rejected" && update.rejection_reason && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Rejection Information
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Reason</div>
                <div className="text-gray-900">{update.rejection_reason}</div>
                {update.reviewed_by && (
                  <div className="mt-2 text-sm text-gray-600">
                    Rejected by: {update.reviewed_by}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {isPending && showRejectForm && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Explain why this update is being rejected..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={processing}
          >
            Close
          </button>
          {isPending && !showRejectForm && (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                disabled={processing}
              >
                <Check className="w-4 h-4 mr-2" />
                {processing ? "Approving..." : "Approve"}
              </button>
            </>
          )}
          {isPending && showRejectForm && (
            <>
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={processing}
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModalComponent
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        documentTypeName={
          update.employment_document?.employment_document_type?.name || ""
        }
        employmentDocumentId={update.employment_document_id}
        currentDocumentPath={update.employment_document?.file_path || undefined}
        pendingDocumentPath={update.updated_data.file_path || undefined}
        initialView={initialDocumentView}
      />
    </div>
  );
}
