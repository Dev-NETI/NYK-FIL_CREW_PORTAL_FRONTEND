import { useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { TravelDocumentService } from "@/services/travel-document";

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
  onUpdate?: () => void;
}

// Yup validation schema
const travelDocumentSchema = Yup.object().shape({
  documentNumber: Yup.string().required("ID Number is required"),
  issuingCountry: Yup.string()
    .required("Place of Issue is required")
    .max(255, "Place of Issue must not exceed 255 characters"),
  issueDate: Yup.date()
    .required("Date of Issue is required")
    .typeError("Date of Issue must be a valid date"),
  expiryDate: Yup.date()
    .required("Expiration Date is required")
    .typeError("Expiration Date must be a valid date")
    .test(
      "is-after-issue-date",
      "Expiration Date must be after Date of Issue",
      function (value) {
        const { issueDate } = this.parent;
        if (!value || !issueDate) return true;
        return new Date(value) > new Date(issueDate);
      }
    ),
  remaining_pages: Yup.number()
    .nullable()
    .integer("Remaining Pages must be a whole number")
    .min(0, "Remaining Pages must be at least 0"),
});

export default function TravelDocumentListItemComponent({
  document,
  onUpdate,
}: TravelDocumentListItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocument, setEditedDocument] = useState(document);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedDocument(document);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validate form using Yup
    try {
      await travelDocumentSchema.validate(editedDocument, {
        abortEarly: false,
      });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        // Show the first validation error
        toast.error(validationError.errors[0]);
      }
      return;
    }

    try {
      const dataToSave = {
        id_no: editedDocument.documentNumber,
        place_of_issue: editedDocument.issuingCountry,
        date_of_issue: editedDocument.issueDate,
        expiration_date: editedDocument.expiryDate,
        remaining_pages: editedDocument.remaining_pages,
        is_US_VISA: editedDocument.travel_document_type_id === 4,
        visa_type:
          editedDocument.travel_document_type_id === 4
            ? editedDocument.visa_type
            : undefined,
      };

      const response = await TravelDocumentService.updateTravelDocument(
        document.id,
        dataToSave
      );

      if (response.success) {
        toast.success(response.message);
        setIsEditing(false);

        // Refresh the travel document list
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update document"
      );
      console.error(error);
    }
  };

  const handleInputChange = (
    field: keyof TravelDocument,
    value: string | number
  ) => {
    setEditedDocument({ ...editedDocument, [field]: value });
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
            <div className="flex-1">
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

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status Badge */}
              <span
                className={`${expiryStatus.bgColor} ${expiryStatus.color} px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border ${expiryStatus.borderColor}`}
              >
                {expiryStatus.text}
              </span>

              {/* Edit/Save/Cancel Buttons */}
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className={`${colors.bg} text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1`}
                >
                  <i className="bi bi-pencil-square"></i>
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <i className="bi bi-check-lg"></i>
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    <i className="bi bi-x-lg"></i>
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID Number */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-hash ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">ID Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedDocument.documentNumber}
                    onChange={(e) =>
                      handleInputChange("documentNumber", e.target.value)
                    }
                    className="w-full text-sm sm:text-base text-gray-900 font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900 font-semibold break-all">
                    {document.documentNumber}
                  </p>
                )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editedDocument.issuingCountry}
                    onChange={(e) =>
                      handleInputChange("issuingCountry", e.target.value)
                    }
                    className="w-full text-sm sm:text-base text-gray-900 font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    {document.issuingCountry}
                  </p>
                )}
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
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editedDocument.issueDate)}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full text-sm sm:text-base text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">
                    {formatDate(document.issueDate)}
                  </p>
                )}
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
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editedDocument.expiryDate)}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                    className="w-full text-sm sm:text-base text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <p className="text-sm sm:text-base text-gray-900">
                      {formatDate(document.expiryDate)}
                    </p>
                    {getDaysUntilExpiry() > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getDaysUntilExpiry()} days remaining
                      </p>
                    )}
                  </>
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
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedDocument.remaining_pages || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "remaining_pages",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full text-sm sm:text-base text-gray-900 font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">
                      {document.remaining_pages}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Visa Type - Only for US VISA */}
            {document.travel_document_type_id === 4 && (
              <div className="flex items-start gap-2">
                <i
                  className={`bi bi-tag ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-medium">Visa Type</p>
                  {isEditing ? (
                    <select
                      value={editedDocument.visa_type || ""}
                      onChange={(e) =>
                        handleInputChange("visa_type", e.target.value)
                      }
                      className="w-full text-sm sm:text-base text-gray-900 font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Visa Type</option>
                      <option value="C1/D">C1/D</option>
                    </select>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">
                      {document.visa_type}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
