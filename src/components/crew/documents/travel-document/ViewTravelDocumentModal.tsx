import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface TravelDocument {
  id: number;
  crew_id: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  travel_document_type_id: number;
  remaining_pages?: number;
  visa_type?: string;
  file_path?: string;
  file_ext?: string;
}

interface ViewTravelDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: TravelDocument;
}

export default function ViewTravelDocumentModal({
  isOpen,
  onClose,
  document,
}: ViewTravelDocumentModalProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const fileUrl = `${backendUrl}/api/travel-documents/${document.id}/view-file`;

  const isPDF = document.file_ext?.toLowerCase() === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    document.file_ext?.toLowerCase() || ""
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const daysUntilExpiry = getDaysUntilExpiry();

    if (daysUntilExpiry < 0) {
      return {
        text: "Expired",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        text: "Expiring Soon",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
      };
    } else {
      return {
        text: "Valid",
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
      };
    }
  };

  const getColorClasses = (documentType: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; icon: string }
    > = {
      Passport: {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
      },
      SIRB: {
        bg: "bg-purple-600",
        border: "border-purple-200",
        icon: "text-purple-600",
      },
      SID: {
        bg: "bg-green-600",
        border: "border-green-200",
        icon: "text-green-600",
      },
      "US VISA": {
        bg: "bg-red-600",
        border: "border-red-200",
        icon: "text-red-600",
      },
    };
    return (
      colorMap[documentType] || {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
      }
    );
  };

  const colors = getColorClasses(document.documentType);
  const expiryStatus = getExpiryStatus();

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
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}>
                      <i className={`bi ${document.icon} text-white text-2xl`}></i>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        {document.documentType}
                      </Dialog.Title>
                      <p className="text-xs text-gray-600">
                        {document.documentType === "Passport" && "Travel Passport"}
                        {document.documentType === "SIRB" && "Seafarer's Identification and Record Book"}
                        {document.documentType === "SID" && "Seafarer's Identity Document"}
                        {document.documentType === "US VISA" && "United States Travel Visa"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.file_path && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1.5"
                      >
                        <i className="bi bi-box-arrow-up-right"></i>
                        <span className="hidden sm:inline">Open in New Tab</span>
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

                <div className="flex flex-col lg:flex-row">
                  {/* Document Details Section */}
                  <div className="lg:w-2/5 p-6 bg-white border-r border-gray-200 overflow-y-auto max-h-[70vh]">
                    <div className="mb-4">
                      <span className={`${expiryStatus.bgColor} ${expiryStatus.color} px-3 py-1.5 rounded-lg text-sm font-semibold border ${expiryStatus.borderColor} inline-block`}>
                        {expiryStatus.text}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* ID Number */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-hash ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">ID Number</p>
                          <p className="text-base text-gray-900 font-semibold break-all">{document.documentNumber}</p>
                        </div>
                      </div>

                      {/* Place of Issue */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-geo-alt ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Place of Issue</p>
                          <p className="text-base text-gray-900 font-semibold">{document.issuingCountry}</p>
                        </div>
                      </div>

                      {/* Date of Issue */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-calendar-plus ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Date of Issue</p>
                          <p className="text-base text-gray-900">{formatDate(document.issueDate)}</p>
                        </div>
                      </div>

                      {/* Expiration Date */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-calendar-x ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Expiration Date</p>
                          <p className="text-base text-gray-900">{formatDate(document.expiryDate)}</p>
                          {getDaysUntilExpiry() > 0 && (
                            <p className="text-xs text-gray-500 mt-1">{getDaysUntilExpiry()} days remaining</p>
                          )}
                        </div>
                      </div>

                      {/* Remaining Pages - Only for SIRB */}
                      {document.travel_document_type_id === 2 && (
                        <div className="flex items-start gap-3">
                          <i className={`bi bi-file-earmark-text ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Remaining Pages</p>
                            <p className="text-base text-gray-900 font-semibold">{document.remaining_pages}</p>
                          </div>
                        </div>
                      )}

                      {/* Visa Type - Only for US VISA */}
                      {document.travel_document_type_id === 4 && document.visa_type && (
                        <div className="flex items-start gap-3">
                          <i className={`bi bi-tag ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">Visa Type</p>
                            <p className="text-base text-gray-900 font-semibold">{document.visa_type}</p>
                          </div>
                        </div>
                      )}

                      {/* Created At */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-calendar-check ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Created At</p>
                          <p className="text-base text-gray-900">{formatDate(document.createdAt)}</p>
                        </div>
                      </div>

                      {/* Modified By */}
                      <div className="flex items-start gap-3">
                        <i className={`bi bi-person-badge ${colors.icon} text-lg mt-1 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium mb-1">Modified By</p>
                          <p className="text-base text-gray-900">{document.modifiedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Preview Section */}
                  <div className="lg:w-3/5 bg-gray-100">
                    {document.file_path ? (
                      isPDF ? (
                        <iframe
                          src={fileUrl}
                          className="w-full h-[70vh] border-0"
                          title={`${document.documentType} Document`}
                        />
                      ) : isImage ? (
                        <div className="flex items-center justify-center p-6 h-[70vh]">
                          <img
                            src={fileUrl}
                            alt={`${document.documentType} Document`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 h-[70vh]">
                          <i className="bi bi-file-earmark text-6xl text-gray-400 mb-4"></i>
                          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
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
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 h-[70vh]">
                        <i className="bi bi-file-earmark-x text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600">No document file uploaded</p>
                      </div>
                    )}
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
