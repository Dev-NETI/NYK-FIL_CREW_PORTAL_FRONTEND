import { Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { EmploymentDocumentUpdate } from "@/services/employment-document-approval";

interface ViewEmploymentDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentId: number;
  fileExt?: string;
  documentNumber?: string;
  createdAt?: string;
  modifiedBy?: string;
  pendingUpdates?: EmploymentDocumentUpdate[];
}

export default function ViewEmploymentDocumentModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  fileExt,
  documentNumber,
  createdAt,
  modifiedBy,
  pendingUpdates = [],
}: ViewEmploymentDocumentModalProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fileUrl = `${backendUrl}/api/employment-documents/${documentId}/view-file`;

  const isPDF = fileExt?.toLowerCase() === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    fileExt?.toLowerCase() || ""
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900 mb-3"
                    >
                      {documentType} Document
                    </Dialog.Title>
                    {/* Document Details */}
                    <div className="space-y-2 text-sm">
                      {documentNumber && (
                        <div className="flex items-center gap-2">
                          <i className="bi bi-hash text-gray-500"></i>
                          <span className="text-gray-600">
                            Document Number:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {documentNumber}
                          </span>
                        </div>
                      )}
                      {createdAt && (
                        <div className="flex items-center gap-2">
                          <i className="bi bi-calendar-check text-gray-500"></i>
                          <span className="text-gray-600">Created At:</span>
                          <span className="text-gray-900">
                            {formatDate(createdAt)}
                          </span>
                        </div>
                      )}
                      {modifiedBy && (
                        <div className="flex items-center gap-2">
                          <i className="bi bi-person-badge text-gray-500"></i>
                          <span className="text-gray-600">Modified By:</span>
                          <span className="text-gray-900">{modifiedBy}</span>
                        </div>
                      )}
                    </div>

                    {/* Pending Updates Alert */}
                    {pendingUpdates.length > 0 && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <i className="bi bi-clock-history text-yellow-600 text-lg mt-0.5"></i>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                              Pending Changes
                            </h4>
                            <p className="text-xs text-yellow-700 mb-2">
                              You have {pendingUpdates.length} update
                              {pendingUpdates.length > 1 ? "s" : ""} awaiting
                              admin approval
                            </p>
                            {pendingUpdates.map((update) => (
                              <div
                                key={update.id}
                                className="bg-white rounded p-2 mb-2 last:mb-0 border border-yellow-100"
                              >
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <i className="bi bi-calendar3"></i>
                                    <span>
                                      Submitted:{" "}
                                      {new Date(
                                        update.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {update.updated_data.document_number && (
                                    <div className="flex items-center gap-2">
                                      <i className="bi bi-arrow-right text-blue-600"></i>
                                      <span className="text-gray-600">
                                        New Document Number:
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {update.updated_data.document_number}
                                      </span>
                                    </div>
                                  )}
                                  {update.updated_data.file_path && (
                                    <div className="flex items-center gap-2">
                                      <i className="bi bi-paperclip text-blue-600"></i>
                                      <span className="text-gray-600">
                                        File update included
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    {fileExt && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1.5"
                      >
                        <i className="bi bi-box-arrow-up-right"></i>
                        <span>Open in New Tab</span>
                      </a>
                    )}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="bi bi-x-lg text-xl"></i>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-gray-100">
                  {fileExt && isPDF ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-[70vh] border-0"
                      title={`${documentType} Document`}
                    />
                  ) : fileExt && isImage ? (
                    <div className="flex items-center justify-center p-6 min-h-[70vh] relative">
                      <Image
                        src={fileUrl}
                        alt={`${documentType} Document`}
                        width={1200}
                        height={800}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : fileExt ? (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[70vh]">
                      <i className="bi bi-file-earmark text-6xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <i className="bi bi-download"></i>
                        <span>Download File</span>
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[70vh]">
                      <i className="bi bi-file-earmark-x text-6xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600">No document file attached</p>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
