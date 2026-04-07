"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  EmploymentDocumentService,
  EmploymentDocument,
} from "@/services/employment-document";
import { EmploymentDocumentTypeService } from "@/services/employment-document-type";
import { X, Upload, FileText } from "lucide-react";

interface EmploymentDocumentType {
  id: number;
  name: string;
}

interface AdminEmpDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  crewId: string;
  editDoc?: EmploymentDocument | null;
}

const documentNumberSchema = Yup.string()
  .required("Document number is required")
  .min(3, "Document number must be at least 3 characters")
  .max(50, "Document number must not exceed 50 characters")
  .trim();

export default function AdminEmpDocModal({
  isOpen,
  onClose,
  onSuccess,
  crewId,
  editDoc = null,
}: AdminEmpDocModalProps) {
  const isEditMode = !!editDoc;

  const [documentTypes, setDocumentTypes] = useState<EmploymentDocumentType[]>(
    []
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // Load document types
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoadingTypes(true);
      try {
        const types =
          await EmploymentDocumentTypeService.getEmploymentDocumentTypes();
        setDocumentTypes(types);
      } catch {
        toast.error("Failed to load document types");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    load();
  }, [isOpen]);

  // Pre-populate in edit mode
  useEffect(() => {
    if (isOpen && editDoc) {
      setSelectedTypeId(editDoc.employment_document_type_id.toString());
      setDocumentNumber(editDoc.document_number ?? "");
    } else if (isOpen && !editDoc) {
      setSelectedTypeId("");
      setDocumentNumber("");
    }
    setDocumentFile(null);
    setErrors({});
    setFileError("");
  }, [isOpen, editDoc]);

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

  const handleSave = async () => {
    // Validate type selection (add mode only)
    if (!isEditMode && !selectedTypeId) {
      setErrors((prev) => ({ ...prev, type: "Document type is required" }));
      return;
    }

    // Validate document number
    try {
      await documentNumberSchema.validate(documentNumber);
      setErrors((prev) => ({ ...prev, number: "" }));
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, number: err.message }));
        return;
      }
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        // UPDATE — do NOT include crew_id to bypass approval workflow
        let data: FormData | { document_number: string };
        if (documentFile) {
          const fd = new FormData();
          fd.append("document_number", documentNumber.trim());
          fd.append("_method", "PUT");
          fd.append("file", documentFile);
          data = fd;
        } else {
          data = { document_number: documentNumber.trim() };
        }
        await EmploymentDocumentService.updateEmploymentDocument(
          editDoc!.id,
          data
        );
        toast.success("Employment document updated successfully!");
      } else {
        // CREATE — include crew_id; admin bypasses approval via is_crew=0
        let data: FormData | object;
        if (documentFile) {
          const fd = new FormData();
          fd.append("crew_id", crewId);
          fd.append("employment_document_type_id", selectedTypeId);
          fd.append("document_number", documentNumber.trim());
          fd.append("file", documentFile);
          data = fd;
        } else {
          data = {
            crew_id: crewId,
            employment_document_type_id: parseInt(selectedTypeId),
            document_number: documentNumber.trim(),
          };
        }
        await EmploymentDocumentService.createEmploymentDocument(data as any);
        toast.success("Employment document added successfully!");
      }
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save employment document"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedTypeId("");
    setDocumentNumber("");
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {isEditMode
                        ? "Edit Employment Document"
                        : "Add Employment Document"}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isEditMode
                        ? `Editing: ${editDoc?.employment_document_type?.name}`
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
                        onChange={(e) => {
                          setSelectedTypeId(e.target.value);
                          setErrors((prev) => ({ ...prev, type: "" }));
                        }}
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

                  {/* Document Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Document Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => {
                        setDocumentNumber(e.target.value);
                        setErrors((prev) => ({ ...prev, number: "" }));
                      }}
                      placeholder="Enter document number"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.number ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.number && (
                      <p className="text-red-600 text-sm mt-1">{errors.number}</p>
                    )}
                  </div>

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
                          htmlFor="emp-doc-file"
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
                            id="emp-doc-file"
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
