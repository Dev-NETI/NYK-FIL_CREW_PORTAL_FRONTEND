import { useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { TravelDocumentService } from "@/services/travel-document";
import ViewTravelDocumentModal from "./ViewTravelDocumentModal";

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const validateFile = (file: File): boolean => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must not exceed 5MB");
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(
        "Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed"
      );
      return false;
    }

    setFileError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setDocumentFile(file);
      } else {
        setDocumentFile(null);
        e.target.value = "";
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFileError("");
    setDocumentFile(null);
  };

  const handleCancel = () => {
    setEditedDocument(document);
    setFileError("");
    setDocumentFile(null);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const loadingToast = toast.loading("Deleting travel document...");
      await TravelDocumentService.deleteTravelDocument(document.id);
      toast.dismiss(loadingToast);
      toast.success(`${document.documentType} document deleted successfully!`);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete travel document"
      );
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    // Validate form using Yup
    try {
      await travelDocumentSchema.validate(editedDocument, {
        abortEarly: false,
      });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        toast.error(validationError.errors[0]);
      }
      return;
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSaving(true);

    try {
      let requestData: FormData | any;

      if (documentFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("id_no", editedDocument.documentNumber);
        formData.append("place_of_issue", editedDocument.issuingCountry);
        formData.append("date_of_issue", editedDocument.issueDate);
        formData.append("expiration_date", editedDocument.expiryDate);
        formData.append(
          "remaining_pages",
          (editedDocument.remaining_pages || 0).toString()
        );
        formData.append(
          "is_US_VISA",
          editedDocument.travel_document_type_id === 4 ? "1" : "0"
        );
        if (
          editedDocument.travel_document_type_id === 4 &&
          editedDocument.visa_type
        ) {
          formData.append("visa_type", editedDocument.visa_type);
        }
        formData.append("file", documentFile);
        formData.append("_method", "PUT");
        requestData = formData;
      } else {
        // Use JSON if no file
        requestData = {
          id_no: editedDocument.documentNumber,
          place_of_issue: editedDocument.issuingCountry,
          date_of_issue: editedDocument.issueDate,
          expiration_date: editedDocument.expiryDate,
          remaining_pages: editedDocument.remaining_pages,
          is_US_VISA: editedDocument.travel_document_type_id === 4 ? 1 : 0,
          visa_type:
            editedDocument.travel_document_type_id === 4
              ? editedDocument.visa_type
              : undefined,
        };
      }

      const response = await TravelDocumentService.updateTravelDocument(
        document.id,
        requestData
      );

      if (response.success) {
        toast.success(response.message);
        setIsEditing(false);
        setDocumentFile(null);
        setFileError("");

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update document"
      );
      console.error(error);
    } finally {
      setIsSaving(false);
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

              {/* View/Edit/Delete/Save/Cancel Buttons */}
              {!isEditing ? (
                <div className="flex gap-2">
                  {document.file_path && (
                    <button
                      onClick={() => setIsViewModalOpen(true)}
                      disabled={isDeleting}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="bi bi-eye"></i>
                      <span className="hidden sm:inline">View</span>
                    </button>
                  )}
                  <button
                    onClick={handleEdit}
                    disabled={isDeleting}
                    className={`${colors.bg} text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <i className="bi bi-pencil-square"></i>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i
                      className={
                        isDeleting ? "bi bi-hourglass-split" : "bi bi-trash"
                      }
                    ></i>
                    <span className="hidden sm:inline">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="bi bi-check-lg"></i>
                    <span className="hidden sm:inline">
                      {isSaving ? "Saving..." : "Save"}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* File Upload/Replace (only in edit mode) */}
            {isEditing && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <i
                  className={`bi bi-cloud-upload ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    {document.file_path
                      ? "Replace Document"
                      : "Upload Document"}{" "}
                    <span className="text-gray-400">(Optional)</span>
                  </p>
                  <div className="mt-1">
                    <input
                      id={`travel-document-file-${document.id}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor={`travel-document-file-${document.id}`}
                      className={`inline-flex items-center px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer text-xs sm:text-sm transition-colors ${
                        fileError
                          ? "border-red-500 bg-red-50 text-red-700"
                          : documentFile
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {documentFile ? (
                        <>
                          <i className="bi bi-file-earmark-check mr-2"></i>
                          <span className="font-medium">
                            {documentFile.name}
                          </span>
                          <span className="ml-2 text-xs">
                            ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload mr-2"></i>
                          <span>
                            {document.file_path
                              ? "Choose new file to replace"
                              : "Choose file to upload"}
                          </span>
                        </>
                      )}
                    </label>
                    {fileError && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {fileError}
                      </p>
                    )}
                    {documentFile && !fileError && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentFile(null);
                          setFileError("");
                          const fileInput = window.document.getElementById(
                            `travel-document-file-${document.id}`
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium mt-1"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded File Indicator (only when not editing) */}
            {!isEditing && document.file_path && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <i
                  className={`bi bi-paperclip ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Attached File
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    Document uploaded
                  </p>
                </div>
              </div>
            )}

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

      {/* View Document Modal */}
      {document.file_path && (
        <ViewTravelDocumentModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          documentType={document.documentType}
          documentId={document.id}
          fileExt={document.file_ext}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {document.documentType} Document?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to delete this document? This action
                  cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Document Number:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {document.documentNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
