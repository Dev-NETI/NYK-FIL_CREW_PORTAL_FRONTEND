"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface DocumentViewerModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  certificateName: string;
  crewCertificateId: number;
  currentDocumentPath?: string;
  pendingDocumentPath?: string;
  initialView?: "current" | "pending";
}

export default function DocumentViewerModalComponent({
  isOpen,
  onClose,
  certificateName,
  crewCertificateId,
  currentDocumentPath,
  pendingDocumentPath,
  initialView = "current",
}: DocumentViewerModalComponentProps) {
  // Determine which document to show first based on what's available
  const getInitialView = () => {
    if (initialView === "pending" && pendingDocumentPath) return "pending";
    if (initialView === "current" && currentDocumentPath) return "current";
    // Fallback: show whichever is available
    if (pendingDocumentPath) return "pending";
    if (currentDocumentPath) return "current";
    return "current";
  };

  const [viewingDocument, setViewingDocument] = useState<"current" | "pending">(
    getInitialView()
  );

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getCurrentDocumentUrl = () => {
    return `${backendUrl}/api/crew-certificates/${crewCertificateId}/view-file`;
  };

  const getPendingDocumentUrl = () => {
    if (!pendingDocumentPath) return null;
    return `${backendUrl}/storage/${pendingDocumentPath}`;
  };

  const hasCurrentDocument = !!currentDocumentPath;
  const hasPendingDocument = !!pendingDocumentPath;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col m-4">
        {/* Viewer Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {hasCurrentDocument && hasPendingDocument
                ? viewingDocument === "current"
                  ? "Current Document"
                  : "Pending Document"
                : hasPendingDocument
                ? "Pending Document (New Submission)"
                : "Current Document"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {certificateName || "Certificate"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle between documents if both exist */}
            {hasCurrentDocument && hasPendingDocument && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingDocument("current")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    viewingDocument === "current"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Current
                </button>
                <button
                  onClick={() => setViewingDocument("pending")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    viewingDocument === "pending"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Pending
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {viewingDocument === "current" && hasCurrentDocument && (
            <iframe
              src={getCurrentDocumentUrl()}
              className="w-full h-full min-h-[600px] border-0"
              title="Current Document"
            />
          )}
          {viewingDocument === "pending" && hasPendingDocument && (
            <iframe
              src={getPendingDocumentUrl()!}
              className="w-full h-full min-h-[600px] border-0"
              title="Pending Document"
            />
          )}
          {!hasCurrentDocument && viewingDocument === "current" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <i className="bi bi-file-earmark-x text-6xl mb-4"></i>
                <p className="font-medium">No current document available</p>
                <p className="text-sm mt-2">
                  This is a new certificate submission
                </p>
                {hasPendingDocument && (
                  <button
                    onClick={() => setViewingDocument("pending")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Pending Document
                  </button>
                )}
              </div>
            </div>
          )}
          {!hasPendingDocument && viewingDocument === "pending" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <i className="bi bi-file-earmark-x text-6xl mb-4"></i>
                <p className="font-medium">No pending document available</p>
                <p className="text-sm mt-2">
                  No new document was uploaded with this update
                </p>
                {hasCurrentDocument && (
                  <button
                    onClick={() => setViewingDocument("current")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Current Document
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
