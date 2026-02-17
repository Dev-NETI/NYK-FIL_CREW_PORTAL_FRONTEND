import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CrewCertificateUpdate } from "@/services/crew-certificate-approval";
import { X, CheckCircle, XCircle, Award, Calendar, User, Eye } from "lucide-react";
import DocumentViewerModalComponent from "./DocumentViewerModalComponent";

interface ApprovalModalProps {
  update: CrewCertificateUpdate;
  onClose: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}

export default function ApprovalModal({
  update,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [initialDocumentView, setInitialDocumentView] = useState<
    "current" | "pending"
  >("current");

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(update.id);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    setIsRejecting(true);
    try {
      await onReject(update.id, rejectionReason);
    } finally {
      setIsRejecting(false);
    }
  };

  const isNewCertificate =
    update.original_data?.certificate_no?.startsWith("PENDING_");

  const hasCurrentDocument = !!(update.crew_certificate?.file_path && update.crew_certificate.file_path.trim());
  const hasPendingDocument = !!(update.updated_data?.file_path && update.updated_data.file_path.trim());

  const openDocumentViewer = (type: "current" | "pending") => {
    setInitialDocumentView(type);
    setShowDocumentViewer(true);
  };

  return (
    <>
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-white">
                          {isNewCertificate
                            ? "New Certificate Request"
                            : "Certificate Update Request"}
                        </Dialog.Title>
                        <p className="text-sm text-blue-100">
                          Review and approve changes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(hasCurrentDocument || hasPendingDocument) && (
                        <button
                          onClick={() =>
                            openDocumentViewer(
                              hasPendingDocument ? "pending" : "current"
                            )
                          }
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Files
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Crew Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Crew Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">
                          {update.user_profile?.first_name}{" "}
                          {update.user_profile?.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Crew ID:</span>
                        <p className="font-medium">{update.crew_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {isNewCertificate ? "New " : "Updated "}Certificate
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Certificate:
                        </span>
                        <p className="font-medium">
                          {update.crew_certificate?.certificate?.name ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Certificate No:
                        </span>
                        <p className="font-medium">
                          {update.updated_data?.certificate_no || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Issued By:
                        </span>
                        <p className="font-medium">
                          {update.updated_data?.issued_by || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Date Issued:
                        </span>
                        <p className="font-medium">
                          {update.updated_data?.date_issued
                            ? new Date(
                                update.updated_data.date_issued
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Expiry Date:
                        </span>
                        <p className="font-medium">
                          {update.updated_data?.expiry_date
                            ? new Date(
                                update.updated_data.expiry_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      {update.updated_data?.grade && (
                        <div>
                          <span className="text-gray-600 block mb-1">
                            Grade:
                          </span>
                          <p className="font-medium">
                            {update.updated_data.grade}
                          </p>
                        </div>
                      )}
                      {update.updated_data?.rank_permitted && (
                        <div>
                          <span className="text-gray-600 block mb-1">
                            Rank Permitted:
                          </span>
                          <p className="font-medium">
                            {update.updated_data.rank_permitted}
                          </p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-gray-600 block mb-1">
                          Attached File:
                        </span>
                        <p className="font-medium flex items-center gap-2">
                          {hasPendingDocument ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <i className="bi bi-check-circle-fill"></i>
                                File attached
                              </span>
                              <button
                                onClick={() => openDocumentViewer("pending")}
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <i className="bi bi-x-circle"></i>
                              No file attached
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Request Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Submitted:</span>
                        <p className="font-medium">
                          {new Date(update.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              update.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : update.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {update.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Form */}
                  {showRejectForm && (
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={3}
                        placeholder="Please provide a reason for rejection..."
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {update.status === "pending" && (
                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    {!showRejectForm ? (
                      <>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={isApproving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {isApproving ? "Approving..." : "Approve"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason("");
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={
                            isRejecting || !rejectionReason.trim()
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          {isRejecting
                            ? "Rejecting..."
                            : "Confirm Rejection"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Document Viewer Modal */}
    <DocumentViewerModalComponent
      isOpen={showDocumentViewer}
      onClose={() => setShowDocumentViewer(false)}
      certificateName={
        update.crew_certificate?.certificate?.name || "Certificate"
      }
      crewCertificateId={update.crew_certificate_id}
      currentDocumentPath={update.crew_certificate?.file_path}
      pendingDocumentPath={update.updated_data.file_path}
      initialView={initialDocumentView}
    />
    </>
  );
}
