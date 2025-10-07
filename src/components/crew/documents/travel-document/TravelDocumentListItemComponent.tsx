import { useState } from "react";

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
}

interface TravelDocumentListItemComponentProps {
  document: TravelDocument;
}

export default function TravelDocumentListItemComponent({
  document,
}: TravelDocumentListItemComponentProps) {
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
      { bg: string; border: string; icon: string; gradient: string }
    > = {
      Passport: {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      },
      SIRB: {
        bg: "bg-purple-600",
        border: "border-purple-200",
        icon: "text-purple-600",
        gradient: "from-purple-50 to-purple-100",
      },
      SID: {
        bg: "bg-green-600",
        border: "border-green-200",
        icon: "text-green-600",
        gradient: "from-green-50 to-green-100",
      },
      "US VISA": {
        bg: "bg-red-600",
        border: "border-red-200",
        icon: "text-red-600",
        gradient: "from-red-50 to-red-100",
      },
    };
    return (
      colorMap[documentType] || {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      }
    );
  };

  const colors = getColorClasses(document.documentType);
  const expiryStatus = getExpiryStatus();

  return (
    <div
      className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-5 border ${colors.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}
          >
            <i
              className={`bi ${document.icon} text-white text-xl sm:text-2xl`}
            ></i>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {document.documentType}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {document.documentType === "Passport" && "Travel Passport"}
                {document.documentType === "SIRB" &&
                  "Seafarer's Identification and Record Book"}
                {document.documentType === "SID" &&
                  "Seafarer's Identity Document"}
                {document.documentType === "US VISA" &&
                  "United States Travel Visa"}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`${expiryStatus.bgColor} ${expiryStatus.color} px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex-shrink-0 border ${expiryStatus.borderColor}`}
            >
              {expiryStatus.text}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID Number */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-hash ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">ID Number</p>
                <p className="text-sm sm:text-base text-gray-900 font-semibold break-all">
                  {document.documentNumber}
                </p>
              </div>
            </div>

            {/* Place of Issue */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-geo-alt ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">
                  Place of Issue
                </p>
                <p className="text-sm sm:text-base text-gray-900 font-semibold">
                  {document.issuingCountry}
                </p>
              </div>
            </div>

            {/* Date of Issue */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-calendar-plus ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">
                  Date of Issue
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(document.issueDate)}
                </p>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-calendar-x ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">
                  Expiration Date
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(document.expiryDate)}
                </p>
                {getDaysUntilExpiry() > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getDaysUntilExpiry()} days remaining
                  </p>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-calendar-check ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">Created At</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(document.createdAt)}
                </p>
              </div>
            </div>

            {/* Modified By */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-person-badge ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">Modified By</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {document.modifiedBy}
                </p>
              </div>
            </div>

            {/* Remaining Pages - Only for SIRB */}
            {document.travel_document_type_id === 2 && (
              <div className="flex items-start gap-2">
                <i
                  className={`bi bi-file-earmark-text ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Remaining Pages
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    {document.remaining_pages}
                  </p>
                </div>
              </div>
            )}

            {/* Visa Type - Only for US VISA */}
            {document.travel_document_type_id === 4 && document.visa_type && (
              <div className="flex items-start gap-2">
                <i
                  className={`bi bi-tag ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-medium">Visa Type</p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    {document.visa_type}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
