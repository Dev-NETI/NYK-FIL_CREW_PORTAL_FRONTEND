import { useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { EmploymentDocumentService } from "@/services/employment-document";

interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
}

interface EmploymentDocumentListItemComponentProps {
  document: EmploymentDocument;
  onUpdate?: () => void;
}

// Yup validation schema
const documentNumberSchema = Yup.string()
  .required("Document number is required")
  .min(3, "Document number must be at least 3 characters")
  .max(50, "Document number must not exceed 50 characters")
  .trim();

export default function EmploymentDocumentListItemComponent({
  document,
  onUpdate,
}: EmploymentDocumentListItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocumentNumber, setEditedDocumentNumber] = useState(
    document.documentNumber
  );
  const [validationError, setValidationError] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateDocumentNumber = async (value: string): Promise<boolean> => {
    try {
      await documentNumberSchema.validate(value);
      setValidationError("");
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setValidationError(error.message);
      }
      return false;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationError("");
  };

  const handleCancel = () => {
    setEditedDocumentNumber(document.documentNumber);
    setValidationError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const isValid = await validateDocumentNumber(editedDocumentNumber);

    if (!isValid) {
      toast.error(validationError);
      return;
    }

    const trimmedValue = editedDocumentNumber.trim();
    const requestData = {
      id: document.id,
      crew_id: document.crew_id,
      employment_document_type_id: document.employment_document_type_id,
      document_number: trimmedValue,
    };
    try {
      const loadingToast = toast.loading("Updating document number...");

      const response = await EmploymentDocumentService.updateEmploymentDocument(
        document.id,
        requestData
      );
      console.log(response);
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success(
          response.message || "Document number updated successfully!"
        );

        // Console log the updated fields
        // console.log({
        //   id: document.id,
        //   crew_id: document.crew_id,
        //   employment_document_type_id: document.employment_document_type_id,
        //   document_number: trimmedValue,
        // });

        setIsEditing(false);

        // Reload the list after successful update
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error(response.message || "Failed to update document number");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "An error occurred while updating"
      );
      console.error("Update error:", error);
    }
  };

  const getColorClasses = (documentType: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; icon: string; gradient: string }
    > = {
      TIN: {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      },
      SSS: {
        bg: "bg-green-600",
        border: "border-green-200",
        icon: "text-green-600",
        gradient: "from-green-50 to-green-100",
      },
      "PAG-IBIG": {
        bg: "bg-purple-600",
        border: "border-purple-200",
        icon: "text-purple-600",
        gradient: "from-purple-50 to-purple-100",
      },
      PHILHEALTH: {
        bg: "bg-orange-600",
        border: "border-orange-200",
        icon: "text-orange-600",
        gradient: "from-orange-50 to-orange-100",
      },
      SRN: {
        bg: "bg-indigo-600",
        border: "border-indigo-200",
        icon: "text-indigo-600",
        gradient: "from-indigo-50 to-indigo-100",
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

  return (
    <div
      className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-5 border ${
        colors.border
      } hover:shadow-lg transition-all duration-300 ${
        !isEditing && "transform hover:-translate-y-1"
      }`}
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
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {document.documentType}
            </h3>

            {/* Edit/Cancel/Save Buttons */}
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className={`${colors.bg} text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 flex-shrink-0`}
              >
                <i className="bi bi-pencil-square"></i>
                <span className="hidden sm:inline">Edit</span>
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <i className="bi bi-check-lg"></i>
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <i className="bi bi-x-lg"></i>
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Document Number */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-hash ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">
                  Document Number
                </p>
                {!isEditing ? (
                  <p className="text-sm sm:text-base text-gray-900 font-semibold break-all">
                    {document.documentNumber}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editedDocumentNumber}
                      onChange={(e) => {
                        setEditedDocumentNumber(e.target.value);
                        validateDocumentNumber(e.target.value);
                      }}
                      className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 font-semibold ${
                        validationError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="Enter document number"
                    />
                    {validationError && (
                      <p className="text-xs text-red-600 font-medium">
                        {validationError}
                      </p>
                    )}
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
