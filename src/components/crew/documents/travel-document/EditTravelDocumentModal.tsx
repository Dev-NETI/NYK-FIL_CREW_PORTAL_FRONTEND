import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
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
  file_path?: string;
  file_ext?: string;
}

interface EditTravelDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: TravelDocument | null;
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

export default function EditTravelDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  document,
}: EditTravelDocumentModalProps) {
  const [editedDocument, setEditedDocument] = useState<TravelDocument | null>(
    null
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setEditedDocument(document);
    }
  }, [document]);

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

  const handleInputChange = (
    field: keyof TravelDocument,
    value: string | number
  ) => {
    if (editedDocument) {
      setEditedDocument({ ...editedDocument, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!editedDocument) return;

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
        formData.append("crew_id", editedDocument.crew_id); // Added for approval workflow
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
          crew_id: editedDocument.crew_id, // Added for approval workflow
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
        editedDocument.id,
        requestData
      );

      if (response.success) {
        toast.success(response.message);
        handleClose();
        onSuccess();
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

  const handleClose = () => {
    setEditedDocument(document);
    setDocumentFile(null);
    setFileError("");
    onClose();
  };

  const getColorClasses = (documentType: string) => {
    const colorMap: Record<
      string,
      { bg: string; hover: string; ring: string }
    > = {
      Passport: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        ring: "focus:ring-blue-500",
      },
      SIRB: {
        bg: "bg-purple-600",
        hover: "hover:bg-purple-700",
        ring: "focus:ring-purple-500",
      },
      SID: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
        ring: "focus:ring-green-500",
      },
      "US VISA": {
        bg: "bg-red-600",
        hover: "hover:bg-red-700",
        ring: "focus:ring-red-500",
      },
    };
    return (
      colorMap[documentType] || {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        ring: "focus:ring-blue-500",
      }
    );
  };

  if (!editedDocument) return null;

  const colors = getColorClasses(editedDocument.documentType);
  const isSIRB = editedDocument.travel_document_type_id === 2;
  const isUSVISA = editedDocument.travel_document_type_id === 4;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <i
                      className={`bi ${editedDocument.icon} text-white text-2xl`}
                    ></i>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      Edit {editedDocument.documentType}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      Update travel document details
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="mt-4 space-y-4">
                  {/* ID Number */}
                  <div>
                    <label
                      htmlFor="id_no"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="id_no"
                      type="text"
                      value={editedDocument.documentNumber}
                      onChange={(e) =>
                        handleInputChange("documentNumber", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                      placeholder="Enter ID number"
                    />
                  </div>

                  {/* Place of Issue */}
                  <div>
                    <label
                      htmlFor="place_of_issue"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Place of Issue <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="place_of_issue"
                      type="text"
                      value={editedDocument.issuingCountry}
                      onChange={(e) =>
                        handleInputChange("issuingCountry", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                      placeholder="Enter place of issue"
                    />
                  </div>

                  {/* Date Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date of Issue */}
                    <div>
                      <label
                        htmlFor="date_of_issue"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Date of Issue <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="date_of_issue"
                        type="date"
                        value={formatDateForInput(editedDocument.issueDate)}
                        onChange={(e) =>
                          handleInputChange("issueDate", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                      />
                    </div>

                    {/* Expiration Date */}
                    <div>
                      <label
                        htmlFor="expiration_date"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Expiration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="expiration_date"
                        type="date"
                        value={formatDateForInput(editedDocument.expiryDate)}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                      />
                    </div>
                  </div>

                  {/* Remaining Pages - Only for SIRB */}
                  {isSIRB && (
                    <div>
                      <label
                        htmlFor="remaining_pages"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Remaining Pages
                      </label>
                      <input
                        id="remaining_pages"
                        type="number"
                        min="0"
                        value={editedDocument.remaining_pages || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "remaining_pages",
                            parseInt(e.target.value)
                          )
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                        placeholder="Enter remaining pages"
                      />
                    </div>
                  )}

                  {/* Visa Type - Only for US VISA */}
                  {isUSVISA && (
                    <div>
                      <label
                        htmlFor="visa_type"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Visa Type
                      </label>
                      <select
                        id="visa_type"
                        value={editedDocument.visa_type || ""}
                        onChange={(e) =>
                          handleInputChange("visa_type", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 ${colors.ring} focus:border-transparent`}
                      >
                        <option value="">Select visa type</option>
                        <option value="C1/D">C1/D</option>
                      </select>
                    </div>
                  )}

                  {/* File Upload Field */}
                  <div>
                    <label
                      htmlFor="document-file-edit"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {editedDocument.file_path
                        ? "Replace Document"
                        : "Upload Document"}{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="document-file-edit"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="document-file-edit"
                        className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          fileError
                            ? "border-red-500 bg-red-50"
                            : documentFile
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-center">
                          {documentFile ? (
                            <>
                              <i className="bi bi-file-earmark-check text-3xl text-green-600 mb-2"></i>
                              <p className="text-sm font-medium text-gray-700">
                                {documentFile.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(documentFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                              <p className="text-sm font-medium text-gray-700">
                                {editedDocument.file_path
                                  ? "Click to replace document"
                                  : "Click to upload document"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF or Image (Max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    {fileError && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
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
                            "document-file-edit"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex-1 ${colors.bg} ${colors.hover} text-white px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 ${colors.ring} focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
