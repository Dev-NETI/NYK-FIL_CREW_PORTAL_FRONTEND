import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { EmploymentDocumentService } from "@/services/employment-document";

interface AddEmploymentDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentType: string;
  documentTypeId: number;
  crewId: string;
  icon: string;
}

// Yup validation schema
const documentNumberSchema = Yup.string()
  .required("Document number is required")
  .min(3, "Document number must be at least 3 characters")
  .max(50, "Document number must not exceed 50 characters")
  .trim();

export default function AddEmploymentDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  documentType,
  documentTypeId,
  crewId,
  icon,
}: AddEmploymentDocumentModalProps) {
  const [documentNumber, setDocumentNumber] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

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

  const handleSave = async () => {
    const isValid = await validateDocumentNumber(documentNumber);

    if (!isValid) {
      toast.error(validationError);
      return;
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    const trimmedValue = documentNumber.trim();

    // Create FormData if file is uploaded, otherwise use JSON
    let requestData: FormData | any;

    if (documentFile) {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("crew_id", crewId);
      formData.append("employment_document_type_id", documentTypeId.toString());
      formData.append("document_number", trimmedValue);
      formData.append("file", documentFile);
      requestData = formData;

      // Debug: Log FormData contents
      console.log("📤 Sending FormData with file:");
      console.log("  - crew_id:", crewId);
      console.log("  - employment_document_type_id:", documentTypeId);
      console.log("  - document_number:", trimmedValue);
      console.log(
        "  - file:",
        documentFile.name,
        `(${(documentFile.size / 1024).toFixed(2)} KB)`
      );

      // Verify FormData entries
      for (const pair of formData.entries()) {
        console.log(`  - ${pair[0]}:`, pair[1]);
      }
    } else {
      // Use JSON object if no file
      requestData = {
        crew_id: parseInt(crewId),
        employment_document_type_id: documentTypeId,
        document_number: trimmedValue,
      };
      console.log("📤 Sending JSON:", requestData);
    }

    setIsSaving(true);

    try {
      const response = await EmploymentDocumentService.createEmploymentDocument(
        requestData
      );

      if (response.success) {
        toast.success(`${documentType} document added successfully!`);

        // Reset form and close modal
        setDocumentNumber("");
        setDocumentFile(null);
        setValidationError("");
        setFileError("");
        onClose();

        // Reload the list
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to save employment document";
      toast.error(errorMessage);
      console.error("Error saving employment document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setDocumentNumber("");
    setDocumentFile(null);
    setValidationError("");
    setFileError("");
    onClose();
  };

  const getColorClasses = () => {
    const colorMap: Record<
      string,
      { bg: string; hover: string; ring: string }
    > = {
      TIN: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        ring: "focus:ring-blue-500",
      },
      SSS: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
        ring: "focus:ring-green-500",
      },
      "PAG-IBIG": {
        bg: "bg-purple-600",
        hover: "hover:bg-purple-700",
        ring: "focus:ring-purple-500",
      },
      PHILHEALTH: {
        bg: "bg-orange-600",
        hover: "hover:bg-orange-700",
        ring: "focus:ring-orange-500",
      },
      SRN: {
        bg: "bg-indigo-600",
        hover: "hover:bg-indigo-700",
        ring: "focus:ring-indigo-500",
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

  const colors = getColorClasses();

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <i className={`bi ${icon} text-white text-2xl`}></i>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      Add {documentType}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      Enter your {documentType} document number
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="mt-4 space-y-4">
                  {/* Document Number Field */}
                  <div>
                    <label
                      htmlFor="document-number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Document Number
                    </label>
                    <input
                      id="document-number"
                      type="text"
                      value={documentNumber}
                      onChange={(e) => {
                        setDocumentNumber(e.target.value);
                        validateDocumentNumber(e.target.value);
                      }}
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        validationError
                          ? "border-red-500 focus:ring-red-500"
                          : `border-gray-300 ${colors.ring} focus:border-transparent`
                      }`}
                      placeholder={`Enter ${documentType} number`}
                    />
                    {validationError && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {validationError}
                      </p>
                    )}
                  </div>

                  {/* File Upload Field */}
                  <div>
                    <label
                      htmlFor="document-file"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Document{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="document-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="document-file"
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
                                Click to upload document
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
                          const fileInput = document.getElementById(
                            "document-file"
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
                    {isSaving ? "Saving..." : "Save Document"}
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
