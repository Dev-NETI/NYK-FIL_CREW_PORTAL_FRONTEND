"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TravelDocumentViewerModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  documentTypeName: string;
  travelDocumentId: number;
  currentDocumentPath?: string;
  pendingDocumentPath?: string;
  initialView?: "current" | "pending";
}

export default function TravelDocumentViewerModalComponent({
  isOpen,
  onClose,
  documentTypeName,
  travelDocumentId,
  currentDocumentPath,
  pendingDocumentPath,
  initialView = "current",
}: TravelDocumentViewerModalComponentProps) {
  const [viewingDocument, setViewingDocument] = useState<"current" | "pending">(
    initialView
  );

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getCurrentDocumentUrl = () => {
    return `${backendUrl}/api/travel-documents/${travelDocumentId}/view-file`;
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {viewingDocument === "current"
                ? "Current Document"
                : "Pending Document"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {documentTypeName || "Travel Document"}
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
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Current
                </button>
                <button
                  onClick={() => setViewingDocument("pending")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    viewingDocument === "pending"
                      ? "bg-purple-600 text-white"
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
                <p>No current document available</p>
              </div>
            </div>
          )}
          {!hasPendingDocument && viewingDocument === "pending" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <i className="bi bi-file-earmark-x text-6xl mb-4"></i>
                <p>No pending document available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
