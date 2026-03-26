"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  TravelDocumentService,
  TravelDocument,
} from "@/services/travel-document";
import {
  TravelDocumentTypeService,
  TravelDocumentType,
} from "@/services/travel-document-type";
import { X, Upload, FileText } from "lucide-react";

interface AdminTravelDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  crewId: string;
  editDoc?: TravelDocument | null;
}

const SIRB_TYPE_ID = 2;
const US_VISA_TYPE_ID = 4;

const idNoSchema = Yup.string()
  .required("ID Number is required")
  .min(3, "ID Number must be at least 3 characters")
  .max(50, "ID Number must not exceed 50 characters")
  .trim();

const placeSchema = Yup.string()
  .required("Place of Issue is required")
  .trim();

const dateRequiredSchema = Yup.date().required("This field is required");

const remainingPagesSchema = Yup.number()
  .required("Remaining pages is required")
  .min(1, "Must be at least 1 page")
  .max(100, "Cannot exceed 100 pages");

export default function AdminTravelDocModal({
  isOpen,
  onClose,
  onSuccess,
  crewId,
  editDoc = null,
}: AdminTravelDocModalProps) {
  const isEditMode = !!editDoc;

  const [documentTypes, setDocumentTypes] = useState<TravelDocumentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [isUSVISA, setIsUSVISA] = useState(false);
  const [isSIRB, setIsSIRB] = useState(false);

  const [formData, setFormData] = useState({
    id_no: "",
    place_of_issue: "",
    date_of_issue: "",
    expiration_date: "",
    remaining_pages: "",
    visa_type: "",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Load travel document types
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoadingTypes(true);
      try {
        const types =
          await TravelDocumentTypeService.getTravelDocumentTypes();
        setDocumentTypes(types);
      } catch {
        toast.error("Failed to load document types");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    load();
  }, [isOpen]);

  // Pre-populate on open
  useEffect(() => {
    if (!isOpen) return;
    if (editDoc) {
      const typeId = editDoc.travel_document_type_id.toString();
      setSelectedTypeId(typeId);
      setIsUSVISA(editDoc.is_US_VISA === 1);
      setIsSIRB(editDoc.travel_document_type_id === SIRB_TYPE_ID);
      setFormData({
        id_no: editDoc.id_no ?? "",
        place_of_issue: editDoc.place_of_issue ?? "",
        date_of_issue: editDoc.date_of_issue ?? "",
        expiration_date: editDoc.expiration_date ?? "",
        remaining_pages: editDoc.remaining_pages?.toString() ?? "",
        visa_type: editDoc.visa_type ?? "",
      });
    } else {
      setSelectedTypeId("");
      setIsUSVISA(false);
      setIsSIRB(false);
      setFormData({
        id_no: "",
        place_of_issue: "",
        date_of_issue: "",
        expiration_date: "",
        remaining_pages: "",
        visa_type: "",
      });
    }
    setDocumentFile(null);
    setErrors({});
    setFileError("");
  }, [isOpen, editDoc]);

  // Update SIRB/USVISA flags when type changes (add mode)
  const handleTypeChange = (value: string) => {
    setSelectedTypeId(value);
    const numId = parseInt(value);
    setIsSIRB(numId === SIRB_TYPE_ID);
    setIsUSVISA(numId === US_VISA_TYPE_ID);
    setErrors((prev) => ({ ...prev, type: "" }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateFile = (file: File): boolean => {
    const MAX = 5 * 1024 * 1024;
    const ALLOWED = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (file.size > MAX) {
      setFileError("File size must not exceed 5MB");
      return false;
    }
    if (!ALLOWED.includes(file.type)) {
      setFileError("Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed");
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

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode && !selectedTypeId) {
      newErrors.type = "Document type is required";
    }

    try {
      await idNoSchema.validate(formData.id_no);
    } catch (e: any) {
      newErrors.id_no = e.message;
    }

    try {
      await placeSchema.validate(formData.place_of_issue);
    } catch (e: any) {
      newErrors.place_of_issue = e.message;
    }

    try {
      await dateRequiredSchema.validate(formData.date_of_issue);
    } catch (e: any) {
      newErrors.date_of_issue = e.message;
    }

    try {
      await dateRequiredSchema.validate(formData.expiration_date);
    } catch (e: any) {
      newErrors.expiration_date = e.message;
    }

    if (isSIRB && formData.remaining_pages) {
      try {
        await remainingPagesSchema.validate(parseInt(formData.remaining_pages));
      } catch (e: any) {
        newErrors.remaining_pages = e.message;
      }
    }

    if (isUSVISA && !formData.visa_type) {
      newErrors.visa_type = "Visa type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const valid = await validateForm();
    if (!valid) return;
    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        // UPDATE — do NOT include crew_id to bypass approval workflow
        let payload: FormData | object;
        if (documentFile) {
          const fd = new FormData();
          fd.append("id_no", formData.id_no.trim());
          fd.append("place_of_issue", formData.place_of_issue.trim());
          fd.append("date_of_issue", formData.date_of_issue);
          fd.append("expiration_date", formData.expiration_date);
          if (isSIRB && formData.remaining_pages) {
            fd.append("remaining_pages", formData.remaining_pages);
          }
          fd.append("is_US_VISA", isUSVISA ? "1" : "0");
          if (isUSVISA && formData.visa_type) {
            fd.append("visa_type", formData.visa_type);
          }
          fd.append("_method", "PUT");
          fd.append("file", documentFile);
          payload = fd;
        } else {
          payload = {
            id_no: formData.id_no.trim(),
            place_of_issue: formData.place_of_issue.trim(),
            date_of_issue: formData.date_of_issue,
            expiration_date: formData.expiration_date,
            is_US_VISA: isUSVISA,
            ...(isSIRB && formData.remaining_pages
              ? { remaining_pages: parseInt(formData.remaining_pages) }
              : {}),
            ...(isUSVISA ? { visa_type: formData.visa_type } : {}),
          };
        }
        await TravelDocumentService.updateTravelDocument(editDoc!.id, payload as any);
        toast.success("Travel document updated successfully!");
      } else {
        // CREATE — include crew_id; admin bypasses approval via is_crew=0
        const typeId = parseInt(selectedTypeId);
        let payload: FormData | object;
        if (documentFile) {
          const fd = new FormData();
          fd.append("crew_id", crewId);
          fd.append("travel_document_type_id", selectedTypeId);
          fd.append("id_no", formData.id_no.trim());
          fd.append("place_of_issue", formData.place_of_issue.trim());
          fd.append("date_of_issue", formData.date_of_issue);
          fd.append("expiration_date", formData.expiration_date);
          if (isSIRB && formData.remaining_pages) {
            fd.append("remaining_pages", formData.remaining_pages);
          }
          fd.append("is_US_VISA", isUSVISA ? "1" : "0");
          if (isUSVISA && formData.visa_type) {
            fd.append("visa_type", formData.visa_type);
          }
          fd.append("file", documentFile);
          payload = fd;
        } else {
          payload = {
            crew_id: crewId,
            travel_document_type_id: typeId,
            id_no: formData.id_no.trim(),
            place_of_issue: formData.place_of_issue.trim(),
            date_of_issue: formData.date_of_issue,
            expiration_date: formData.expiration_date,
            is_US_VISA: isUSVISA,
            ...(isSIRB && formData.remaining_pages
              ? { remaining_pages: parseInt(formData.remaining_pages) }
              : {}),
            ...(isUSVISA ? { visa_type: formData.visa_type } : {}),
          };
        }
        await TravelDocumentService.saveTravelDocument(payload as any);
        toast.success("Travel document added successfully!");
      }
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save travel document"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedTypeId("");
    setIsUSVISA(false);
    setIsSIRB(false);
    setFormData({
      id_no: "",
      place_of_issue: "",
      date_of_issue: "",
      expiration_date: "",
      remaining_pages: "",
      visa_type: "",
    });
    setDocumentFile(null);
    setErrors({});
    setFileError("");
    onClose();
  };

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {isEditMode
                        ? "Edit Travel Document"
                        : "Add Travel Document"}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isEditMode
                        ? `Editing: ${
                            editDoc?.is_US_VISA
                              ? "US VISA"
                              : editDoc?.travel_document_type?.name
                          }`
                        : "Fill in the document details below"}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Document Type (add mode only) */}
                  {!isEditMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedTypeId}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        disabled={isLoadingTypes}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.type ? "border-red-500" : "border-gray-300"
                        } ${isLoadingTypes ? "bg-gray-100" : ""}`}
                      >
                        <option value="">
                          {isLoadingTypes
                            ? "Loading types..."
                            : "Select document type"}
                        </option>
                        {documentTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                      )}
                    </div>
                  )}

                  {/* ID Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ID / Document Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.id_no}
                      onChange={(e) => handleInputChange("id_no", e.target.value)}
                      placeholder="Enter ID / document number"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.id_no ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.id_no && (
                      <p className="text-red-600 text-sm mt-1">{errors.id_no}</p>
                    )}
                  </div>

                  {/* Place of Issue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Place of Issue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.place_of_issue}
                      onChange={(e) =>
                        handleInputChange("place_of_issue", e.target.value)
                      }
                      placeholder="Enter place of issue"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.place_of_issue ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.place_of_issue && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.place_of_issue}
                      </p>
                    )}
                  </div>

                  {/* Date Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date of Issue <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_issue}
                        onChange={(e) =>
                          handleInputChange("date_of_issue", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.date_of_issue ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.date_of_issue && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.date_of_issue}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expiration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) =>
                          handleInputChange("expiration_date", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.expiration_date ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.expiration_date && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.expiration_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remaining Pages (SIRB only) */}
                  {isSIRB && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Remaining Pages{" "}
                        <span className="text-gray-400 text-xs font-normal">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.remaining_pages}
                        onChange={(e) =>
                          handleInputChange("remaining_pages", e.target.value)
                        }
                        placeholder="e.g. 24"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.remaining_pages ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.remaining_pages && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.remaining_pages}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Visa Type (US VISA only) */}
                  {isUSVISA && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Visa Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.visa_type}
                        onChange={(e) =>
                          handleInputChange("visa_type", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.visa_type ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select visa type</option>
                        <option value="C1/D">C1/D</option>
                      </select>
                      {errors.visa_type && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.visa_type}
                        </p>
                      )}
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Document File{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        (Optional
                        {isEditMode && editDoc?.file_path
                          ? " — replaces existing file"
                          : ""}
                        )
                      </span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                        fileError
                          ? "border-red-400 bg-red-50"
                          : documentFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-blue-400"
                      }`}
                    >
                      {documentFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-green-600 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {documentFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDocumentFile(null);
                              setFileError("");
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="travel-doc-file"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-sm text-blue-600 font-medium">
                            Click to upload
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            PDF or Image (Max 5MB)
                          </span>
                          <input
                            id="travel-doc-file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-red-600 text-sm mt-1">{fileError}</p>
                    )}
                    {isEditMode && editDoc?.file_path && !documentFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current file attached. Upload a new file to replace it.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving
                      ? "Saving..."
                      : isEditMode
                      ? "Update Document"
                      : "Add Document"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSaving}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
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
