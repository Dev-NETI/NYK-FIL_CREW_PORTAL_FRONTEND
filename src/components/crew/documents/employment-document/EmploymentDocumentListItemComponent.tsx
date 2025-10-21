import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { EmploymentDocumentService } from "@/services/employment-document";
import { EmploymentDocumentApprovalService, EmploymentDocumentUpdate } from "@/services/employment-document-approval";
import ViewEmploymentDocumentModal from "./ViewEmploymentDocumentModal";

interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  file_path?: string;
  file_ext?: string;
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<EmploymentDocumentUpdate[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch pending updates for this document
  useEffect(() => {
    const fetchPendingUpdates = async () => {
      try {
        setLoadingPending(true);
        const history = await EmploymentDocumentApprovalService.getHistory(document.id);
        // Filter for pending updates only
        const pending = history.filter(update => update.status === 'pending');
        setPendingUpdates(pending);
      } catch (error) {
        console.error('Error fetching pending updates:', error);
      } finally {
        setLoadingPending(false);
      }
    };

    fetchPendingUpdates();
  }, [document.id]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startOffsetRef.current = swipeOffset;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isEditing) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    const newOffset = startOffsetRef.current + diff;

    // Limit swipe to left only (negative values) with max of -200px
    if (newOffset <= 0 && newOffset >= -200) {
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isEditing) return;
    setIsDragging(false);

    // Snap to open (-150px) or closed (0) based on threshold
    if (swipeOffset < -75) {
      setSwipeOffset(-150);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startOffsetRef.current = swipeOffset;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isEditing) return;
      const currentX = e.clientX;
      const diff = currentX - startXRef.current;
      const newOffset = startOffsetRef.current + diff;

      // Limit swipe to left only (negative values) with max of -200px
      if (newOffset <= 0 && newOffset >= -200) {
        setSwipeOffset(newOffset);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging || isEditing) return;
      setIsDragging(false);

      // Snap to open (-150px) or closed (0) based on threshold
      if (swipeOffset < -75) {
        setSwipeOffset(-150);
      } else {
        setSwipeOffset(0);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isEditing, swipeOffset]);

  // Reset swipe when editing mode changes
  useEffect(() => {
    if (isEditing) {
      setSwipeOffset(0);
    }
  }, [isEditing]);

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

  const validateFile = (file: File): boolean => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must not exceed 5MB");
      return false;
    }

    // Check file type
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
        e.target.value = ""; // Reset input
      }
    }
  };

  const handleEdit = () => {
    setSwipeOffset(0);
    setIsEditing(true);
    setValidationError("");
    setFileError("");
    setDocumentFile(null);
  };

  const handleCancel = () => {
    setEditedDocumentNumber(document.documentNumber);
    setValidationError("");
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
      const loadingToast = toast.loading("Deleting employment document...");

      await EmploymentDocumentService.deleteEmploymentDocument(document.id);

      toast.dismiss(loadingToast);
      toast.success(`${document.documentType} document deleted successfully!`);

      // Reload the list after successful deletion
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete employment document"
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
    const isValid = await validateDocumentNumber(editedDocumentNumber);

    if (!isValid) {
      toast.error(validationError);
      return;
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    const trimmedValue = editedDocumentNumber.trim();

    // Create FormData if file is uploaded, otherwise use JSON
    let requestData: FormData | any;

    if (documentFile) {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("crew_id", document.crew_id);
      formData.append(
        "employment_document_type_id",
        document.employment_document_type_id.toString()
      );
      formData.append("document_number", trimmedValue);
      formData.append("file", documentFile);
      formData.append("_method", "PUT"); // Laravel method spoofing for file uploads
      requestData = formData;

      console.log("📤 Updating with FormData (file included)");
    } else {
      // Use JSON object if no file
      requestData = {
        crew_id: document.crew_id,
        employment_document_type_id: document.employment_document_type_id,
        document_number: trimmedValue,
      };
      console.log("📤 Updating with JSON (no file)");
    }

    setIsSaving(true);

    try {
      const loadingToast = toast.loading("Updating employment document...");

      const response = await EmploymentDocumentService.updateEmploymentDocument(
        document.id,
        requestData
      );
      console.log(response);
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success(
          response.message || "Employment document updated successfully!"
        );

        setIsEditing(false);
        setDocumentFile(null);
        setFileError("");

        // Reload the list after successful update
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error(response.message || "Failed to update employment document");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "An error occurred while updating"
      );
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
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
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons background (shown when swiped) */}
      <div className="absolute inset-0 flex items-stretch justify-end bg-gray-100">
        <button
          onClick={() => {
            setSwipeOffset(0);
            setIsViewModalOpen(true);
          }}
          disabled={isDeleting || !document.file_path}
          className="w-16 flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="bi bi-eye text-xl"></i>
        </button>
        <button
          onClick={() => {
            setSwipeOffset(0);
            handleEdit();
          }}
          disabled={isDeleting}
          className={`w-16 flex items-center justify-center ${colors.bg} text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <i className="bi bi-pencil-square text-xl"></i>
        </button>
        <button
          onClick={() => {
            setSwipeOffset(0);
            handleDeleteClick();
          }}
          disabled={isDeleting}
          className="w-16 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            className={
              isDeleting
                ? "bi bi-hourglass-split text-xl"
                : "bi bi-trash text-xl"
            }
          ></i>
        </button>
      </div>

      {/* Main content (swipeable) */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-5 border ${
          colors.border
        } hover:shadow-lg transition-all duration-300 ${
          !isEditing && !isDragging && "cursor-grab active:cursor-grabbing"
        } relative`}
      >
        {!isEditing ? (
          // Simple view - only document name
          <div
            className="flex items-center gap-4"
            onClick={() => setIsViewModalOpen(true)}
          >
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

            {/* Document name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {document.documentType}
                </h3>
                {!loadingPending && pendingUpdates.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <i className="bi bi-clock-history mr-1"></i>
                    Pending Approval
                  </span>
                )}
              </div>
              {document.file_path && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  <i className="bi bi-paperclip mr-1"></i>
                  Document attached
                </p>
              )}
              {!loadingPending && pendingUpdates.length > 0 && (
                <p className="text-xs sm:text-sm text-yellow-700 mt-1 font-medium">
                  <i className="bi bi-info-circle mr-1"></i>
                  You have changes awaiting admin approval
                </p>
              )}
            </div>

            {/* Chevron indicator */}
            <div className="flex-shrink-0">
              <i className="bi bi-chevron-right text-gray-400 text-xl"></i>
            </div>
          </div>
        ) : (
          // Edit mode
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

                {/* Cancel/Save Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="bi bi-check-lg"></i>
                    <span className="hidden sm:inline">
                      {isSaving ? "Saving..." : "Save"}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="bi bi-x-lg"></i>
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
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
                  </div>
                </div>

                {/* File Upload/Replace (only in edit mode) */}
                <div className="flex items-start gap-2">
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
                        id={`document-file-${document.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor={`document-file-${document.id}`}
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
                              ({(documentFile.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
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
                              `document-file-${document.id}`
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Document Modal */}
      <ViewEmploymentDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        documentType={document.documentType}
        documentId={document.id}
        fileExt={document.file_ext}
        documentNumber={document.documentNumber}
        createdAt={document.createdAt}
        modifiedBy={document.modifiedBy}
        pendingUpdates={pendingUpdates}
      />

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
