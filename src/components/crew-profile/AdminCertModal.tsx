"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  CrewCertificateService,
  CrewCertificate,
} from "@/services/crew-certificate";
import {
  CertificateTypeService,
  CertificateType,
} from "@/services/certificate-type";
import { CertificateService, Certificate } from "@/services/certificate";
import { X, Upload, FileText } from "lucide-react";

interface AdminCertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  crewId: string;
  editCert?: CrewCertificate | null;
}

const createValidationSchema = (selectedCertificate: Certificate | null) => {
  return Yup.object().shape({
    certificate_id: Yup.number()
      .required("Certificate is required")
      .positive("Please select a certificate"),

    certificate_no: Yup.string()
      .nullable()
      .trim()
      .min(3, "Certificate number must be at least 3 characters")
      .max(100, "Certificate number must not exceed 100 characters"),

    issued_by: Yup.string()
      .nullable()
      .trim()
      .min(3, "Issuing authority must be at least 3 characters")
      .max(255, "Issuing authority must not exceed 255 characters"),

    grade:
      selectedCertificate?.stcw_type === "COC"
        ? Yup.string()
            .required("Grade is required for COC certificates")
            .trim()
            .min(2, "Grade must be at least 2 characters")
            .max(255, "Grade must not exceed 255 characters")
        : Yup.string()
            .nullable()
            .trim()
            .max(255, "Grade must not exceed 255 characters"),

    rank_permitted:
      selectedCertificate?.certificate_type_id === 6
        ? Yup.string()
            .required("Rank permitted is required for this certificate type")
            .trim()
            .min(2, "Rank permitted must be at least 2 characters")
            .max(255, "Rank permitted must not exceed 255 characters")
        : Yup.string()
            .nullable()
            .trim()
            .max(255, "Rank permitted must not exceed 255 characters"),

    date_issued: Yup.date().nullable(),

    expiry_date: Yup.date()
      .nullable()
      .test(
        "is-after-issue-date",
        "Expiry date must be after date issued",
        function (value) {
          const { date_issued } = this.parent;
          if (!value || !date_issued) return true;
          return new Date(value) > new Date(date_issued);
        }
      ),
  });
};

const fileValidationSchema = Yup.mixed<File>()
  .nullable()
  .test("fileSize", "File size must not exceed 5MB", (value) => {
    if (!value) return true;
    return value.size <= 5 * 1024 * 1024;
  })
  .test("fileType", "Only PDF and image files are allowed", (value) => {
    if (!value) return true;
    const ALLOWED = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    return ALLOWED.includes(value.type);
  });

export default function AdminCertModal({
  isOpen,
  onClose,
  onSuccess,
  crewId,
  editCert = null,
}: AdminCertModalProps) {
  const isEditMode = !!editCert;

  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);

  const [formData, setFormData] = useState({
    certificate_id: "",
    certificate_no: "",
    issued_by: "",
    date_issued: "",
    expiry_date: "",
    grade: "",
    rank_permitted: "",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load certificate types on open
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setIsLoadingTypes(true);
      try {
        const types = await CertificateTypeService.getCertificateTypes();
        setCertificateTypes(types);
      } catch {
        toast.error("Failed to load certificate types");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    load();
  }, [isOpen]);

  // Load certificates under selected type
  useEffect(() => {
    if (!selectedTypeId) {
      setCertificates([]);
      return;
    }
    const load = async () => {
      setIsLoadingCerts(true);
      try {
        const certs = await CertificateService.getCertificateByCertTypeId(
          parseInt(selectedTypeId)
        );
        setCertificates(certs);

        // In edit mode, pre-select the matching certificate after certs load
        if (isEditMode && editCert && formData.certificate_id) {
          const found = certs.find(
            (c) => c.id === parseInt(formData.certificate_id)
          );
          setSelectedCertificate(found || null);
        }
      } catch {
        toast.error("Failed to load certificates");
      } finally {
        setIsLoadingCerts(false);
      }
    };
    load();
  }, [selectedTypeId]);

  // Pre-populate form in edit mode
  useEffect(() => {
    if (!isOpen) return;
    if (editCert) {
      // Set type from certificate's type
      const typeId =
        editCert.certificate?.certificate_type_id?.toString() ?? "";
      setSelectedTypeId(typeId);
      setFormData({
        certificate_id: editCert.certificate_id.toString(),
        certificate_no: editCert.certificate_no ?? "",
        issued_by: editCert.issued_by ?? "",
        date_issued: editCert.date_issued ?? "",
        expiry_date: editCert.expiry_date ?? "",
        grade: editCert.grade ?? "",
        rank_permitted: editCert.rank_permitted ?? "",
      });
      setSelectedCertificate(editCert.certificate ?? null);
    } else {
      setSelectedTypeId("");
      setFormData({
        certificate_id: "",
        certificate_no: "",
        issued_by: "",
        date_issued: "",
        expiry_date: "",
        grade: "",
        rank_permitted: "",
      });
      setSelectedCertificate(null);
    }
    setDocumentFile(null);
    setErrors({});
    setFileError("");
  }, [isOpen, editCert]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "certificate_id") {
      const cert = certificates.find((c) => c.id === parseInt(value));
      setSelectedCertificate(cert || null);
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        grade: "",
        rank_permitted: "",
      }));
      setErrors((prev) => ({ ...prev, grade: "", rank_permitted: "" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentFile(null);
      setFileError("");
      return;
    }
    try {
      await fileValidationSchema.validate(file);
      setDocumentFile(file);
      setFileError("");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setFileError(err.message);
      }
      setDocumentFile(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const schema = createValidationSchema(selectedCertificate);
      await schema.validate(formData, { abortEarly: false });

      if (documentFile) {
        await fileValidationSchema.validate(documentFile);
      }

      setErrors({});
      setFileError("");

      const submitData = new FormData();
      submitData.append("crew_id", crewId);
      submitData.append("certificate_id", formData.certificate_id);
      if (formData.certificate_no)
        submitData.append("certificate_no", formData.certificate_no);
      if (formData.issued_by) submitData.append("issued_by", formData.issued_by);
      if (formData.date_issued)
        submitData.append("date_issued", formData.date_issued);
      if (formData.expiry_date)
        submitData.append("expiry_date", formData.expiry_date);
      if (formData.grade) submitData.append("grade", formData.grade);
      if (formData.rank_permitted)
        submitData.append("rank_permitted", formData.rank_permitted);
      if (documentFile) submitData.append("file", documentFile);

      if (isEditMode) {
        await CrewCertificateService.updateCrewCertificate(
          editCert!.id,
          submitData
        );
        toast.success("Certificate updated successfully!");
      } else {
        await CrewCertificateService.createCrewCertificate(submitData);
        toast.success("Certificate added successfully!");
      }

      handleClose();
      onSuccess();
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        toast.error("Please fix validation errors");
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to save certificate"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedTypeId("");
    setFormData({
      certificate_id: "",
      certificate_no: "",
      issued_by: "",
      date_issued: "",
      expiry_date: "",
      grade: "",
      rank_permitted: "",
    });
    setSelectedCertificate(null);
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
                      {isEditMode ? "Edit Certificate" : "Add Certificate"}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isEditMode
                        ? `Editing: ${
                            editCert?.certificate?.name ||
                            editCert?.certificate?.code ||
                            "Certificate"
                          }`
                        : "Fill in the certificate details below"}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Certificate Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Certificate Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(e.target.value)}
                      disabled={isLoadingTypes}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isLoadingTypes ? "bg-gray-100" : "border-gray-300"
                      }`}
                    >
                      <option value="">
                        {isLoadingTypes
                          ? "Loading types..."
                          : "Select Certificate Type"}
                      </option>
                      {certificateTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Certificate <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.certificate_id}
                      onChange={(e) =>
                        handleInputChange("certificate_id", e.target.value)
                      }
                      disabled={!selectedTypeId || isLoadingCerts}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.certificate_id
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        !selectedTypeId || isLoadingCerts
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">
                        {isLoadingCerts
                          ? "Loading certificates..."
                          : "Select Certificate"}
                      </option>
                      {certificates.map((cert) => (
                        <option key={cert.id} value={cert.id}>
                          {cert.name || cert.code || `Certificate #${cert.id}`}
                        </option>
                      ))}
                    </select>
                    {errors.certificate_id && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.certificate_id}
                      </p>
                    )}
                  </div>

                  {/* Certificate Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Certificate / License Number
                    </label>
                    <input
                      type="text"
                      value={formData.certificate_no}
                      onChange={(e) =>
                        handleInputChange("certificate_no", e.target.value)
                      }
                      placeholder="Enter certificate no. / license no."
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.certificate_no ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.certificate_no && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.certificate_no}
                      </p>
                    )}
                  </div>

                  {/* Grade (COC only) */}
                  {selectedCertificate?.stcw_type === "COC" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Grade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) =>
                          handleInputChange("grade", e.target.value)
                        }
                        placeholder="e.g., Master Mariner"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.grade ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.grade && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.grade}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rank Permitted (type_id=6 only) */}
                  {selectedCertificate?.certificate_type_id === 6 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Rank Permitted <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.rank_permitted}
                        onChange={(e) =>
                          handleInputChange("rank_permitted", e.target.value)
                        }
                        placeholder="e.g., Chief Engineer"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.rank_permitted
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.rank_permitted && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.rank_permitted}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Issued By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Issuing Authority / Training Center
                    </label>
                    <input
                      type="text"
                      value={formData.issued_by}
                      onChange={(e) =>
                        handleInputChange("issued_by", e.target.value)
                      }
                      placeholder="e.g., MARINA, TESDA"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.issued_by ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.issued_by && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.issued_by}
                      </p>
                    )}
                  </div>

                  {/* Date Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date Issued
                      </label>
                      <input
                        type="date"
                        value={formData.date_issued}
                        onChange={(e) =>
                          handleInputChange("date_issued", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.date_issued ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.date_issued && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.date_issued}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          handleInputChange("expiry_date", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expiry_date ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.expiry_date && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.expiry_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Certificate File{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        (Optional
                        {isEditMode && editCert?.file_path
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
                            onClick={() => setDocumentFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="cert-file"
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
                            id="cert-file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-red-600 text-sm mt-1">{fileError}</p>
                    )}
                    {isEditMode && editCert?.file_path && !documentFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current file attached. Upload a new file to replace it.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving
                        ? "Saving..."
                        : isEditMode
                        ? "Update Certificate"
                        : "Add Certificate"}
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
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
