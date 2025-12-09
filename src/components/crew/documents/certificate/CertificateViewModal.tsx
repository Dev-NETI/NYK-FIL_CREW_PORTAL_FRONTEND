import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Calendar, FileText, Building2, Hash, Award, User } from "lucide-react";
import { CrewCertificate } from "@/services/crew-certificate";

interface CertificateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CrewCertificate;
}

export default function CertificateViewModal({
  isOpen,
  onClose,
  certificate,
}: CertificateViewModalProps) {
  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get status badge
  const getStatusBadge = () => {
    const status = certificate.status || "valid";
    switch (status) {
      case "valid":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Valid
          </span>
        );
      case "expiring_soon":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Expiring Soon
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  // Helper function to view/download file
  const handleViewFile = () => {
    if (certificate.file_path) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api", "");
      const fileUrl = `${backendUrl}/storage/${certificate.file_path}`;
      window.open(fileUrl, "_blank");
    }
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <Dialog.Title className="text-base font-bold text-white">
                        Certificate Details
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Certificate Name & Status */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {certificate.certificate?.name ||
                           certificate.certificate?.code ||
                           `Certificate #${certificate.certificate_id}`}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {certificate.certificate?.certificateType?.name || "Certificate"}
                        </p>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </div>

                  {/* Certificate Information Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Certificate Number */}
                    {certificate.certificate_no && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Hash className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Certificate Number
                            </p>
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {certificate.certificate_no}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Issuing Authority */}
                    {certificate.issued_by && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Issued By
                            </p>
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {certificate.issued_by}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Issued */}
                    {certificate.date_issued && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Date Issued
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              {formatDate(certificate.date_issued)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expiry Date */}
                    {certificate.expiry_date && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Expiry Date
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              {formatDate(certificate.expiry_date)}
                            </p>
                            {certificate.days_until_expiry !== null &&
                             certificate.days_until_expiry !== undefined && (
                              <p className="text-[10px] text-gray-600 mt-0.5">
                                {certificate.days_until_expiry > 0
                                  ? `${certificate.days_until_expiry} days remaining`
                                  : `Expired ${Math.abs(certificate.days_until_expiry)} days ago`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Grade (if applicable) */}
                    {certificate.grade && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Grade
                            </p>
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {certificate.grade}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rank Permitted (if applicable) */}
                    {certificate.rank_permitted && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium">
                              Rank Permitted
                            </p>
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {certificate.rank_permitted}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Attachment */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            Attached Document
                          </p>
                          {certificate.file_path ? (
                            <p className="text-[10px] text-gray-600">
                              {certificate.file_ext?.toUpperCase()} file available
                            </p>
                          ) : (
                            <p className="text-[10px] text-red-600 font-medium">
                              No document attached
                            </p>
                          )}
                        </div>
                      </div>
                      {certificate.file_path && (
                        <button
                          onClick={handleViewFile}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium shadow-sm"
                        >
                          View File
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
