import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { CrewCertificateService } from "@/services/crew-certificate";
import {
  CertificateTypeService,
  CertificateType,
} from "@/services/certificate-type";
import { CertificateService, Certificate } from "@/services/certificate";
import { X, Upload, FileText } from "lucide-react";

interface CrewCertificateFormComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  crewId: string;
}

// Yup validation schema - will be created dynamically based on selected certificate
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

    // Grade is required only if certificate.stcw_type === "COC"
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

    // Rank permitted is required only if certificate.certificate_type_id === 6
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

// File validation schema
const fileValidationSchema = Yup.mixed<File>()
  .nullable()
  .test("fileSize", "File size must not exceed 5MB", (value) => {
    if (!value) return true; // File is optional
    return value.size <= 5 * 1024 * 1024; // 5MB
  })
  .test("fileType", "Only PDF and image files are allowed", (value) => {
    if (!value) return true; // File is optional
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    return ALLOWED_TYPES.includes(value.type);
  });

export default function CrewCertificateFormComponent({
  isOpen,
  onClose,
  onSuccess,
  crewId,
}: CrewCertificateFormComponentProps) {
  // Form data state
  const [formData, setFormData] = useState({
    certificate_id: "",
    certificate_no: "",
    issued_by: "",
    date_issued: "",
    expiry_date: "",
    grade: "",
    rank_permitted: "",
  });

  // Dropdown data
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    []
  );
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [selectedCertificateTypeId, setSelectedCertificateTypeId] =
    useState<string>("");
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);

  // Load certificate types on mount
  useEffect(() => {
    const loadCertificateTypes = async () => {
      try {
        const types = await CertificateTypeService.getCertificateTypes();
        setCertificateTypes(types);
      } catch (error) {
        toast.error("Failed to load certificate types");
      }
    };
    loadCertificateTypes();
  }, []);

  // Load certificates when certificate type is selected
  useEffect(() => {
    const loadCertificates = async () => {
      if (selectedCertificateTypeId) {
        setIsLoadingCertificates(true);
        try {
          const certs = await CertificateService.getCertificateByCertTypeId(
            parseInt(selectedCertificateTypeId)
          );
          setCertificates(certs);
          setFilteredCertificates(certs);
        } catch (error) {
          toast.error("Failed to load certificates");
        } finally {
          setIsLoadingCertificates(false);
        }
      } else {
        setCertificates([]);
        setFilteredCertificates([]);
        setFormData((prev) => ({ ...prev, certificate_id: "" }));
      }
    };
    loadCertificates();
  }, [selectedCertificateTypeId]);

  // Handle file selection with Yup validation
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
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setFileError(error.message);
      }
      setDocumentFile(null);
      e.target.value = "";
    }
  };

  // Field validation
  const validateField = async (
    fieldName: string,
    value: any
  ): Promise<boolean> => {
    try {
      const schema = createValidationSchema(selectedCertificate);
      await schema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
      }
      return false;
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update selected certificate when certificate_id changes
    if (field === "certificate_id") {
      const cert = filteredCertificates.find((c) => c.id === parseInt(value));
      setSelectedCertificate(cert || null);
      // Clear grade and rank_permitted when changing certificate
      setFormData((prev) => ({ ...prev, grade: "", rank_permitted: "" }));
      setErrors((prev) => ({ ...prev, grade: "", rank_permitted: "" }));
    }

    validateField(field, value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate all fields using the schema
      const schema = createValidationSchema(selectedCertificate);
      await schema.validate(formData, { abortEarly: false });

      // Validate file if present
      if (documentFile) {
        await fileValidationSchema.validate(documentFile);
      }

      // Clear any existing errors
      setErrors({});
      setFileError("");

      // Prepare form data
      const submitData = new FormData();
      submitData.append("crew_id", crewId);
      submitData.append("certificate_id", formData.certificate_id);

      if (formData.certificate_no) {
        submitData.append("certificate_no", formData.certificate_no);
      }
      if (formData.issued_by) {
        submitData.append("issued_by", formData.issued_by);
      }
      if (formData.date_issued) {
        submitData.append("date_issued", formData.date_issued);
      }
      if (formData.expiry_date) {
        submitData.append("expiry_date", formData.expiry_date);
      }
      if (formData.grade) {
        submitData.append("grade", formData.grade);
      }
      if (formData.rank_permitted) {
        submitData.append("rank_permitted", formData.rank_permitted);
      }
      if (documentFile) {
        submitData.append("file", documentFile);
      }

      // Debug: Log FormData contents
      //   console.log("=== FormData Contents ===");
      //   for (const [key, value] of submitData.entries()) {
      //     if (value instanceof File) {
      //       console.log(`${key}:`, {
      //         name: value.name,
      //         size: value.size,
      //         type: value.type,
      //       });
      //     } else {
      //       console.log(`${key}:`, value);
      //     }
      //   }
      //   console.log("========================");
      console.log(Object.fromEntries(submitData.entries()));

      // Submit to API
      //   await CrewCertificateService.createCrewCertificate(submitData);

      toast.success("Certificate added successfully!");
      handleClose();
      onSuccess();
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        // Handle validation errors
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        toast.error("Please fix validation errors");
      } else {
        // Handle API errors
        console.error("Error adding certificate:", error);
        toast.error(
          error?.response?.data?.message || "Failed to add certificate"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form and close
  const handleClose = () => {
    setFormData({
      certificate_id: "",
      certificate_no: "",
      issued_by: "",
      date_issued: "",
      expiry_date: "",
      grade: "",
      rank_permitted: "",
    });
    setSelectedCertificateTypeId("");
    setSelectedCertificate(null);
    setDocumentFile(null);
    setFileError("");
    setErrors({});
    setIsSaving(false);
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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Add Crew Certificate
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Certificate Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCertificateTypeId}
                      onChange={(e) =>
                        setSelectedCertificateTypeId(e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Certificate Type</option>
                      {certificateTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certificate Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.certificate_id}
                      onChange={(e) =>
                        handleInputChange("certificate_id", e.target.value)
                      }
                      disabled={
                        !selectedCertificateTypeId || isLoadingCertificates
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.certificate_id
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        !selectedCertificateTypeId || isLoadingCertificates
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">
                        {isLoadingCertificates
                          ? "Loading certificates..."
                          : "Select Certificate"}
                      </option>
                      {filteredCertificates.map((cert) => (
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate/License Number
                    </label>
                    <input
                      type="text"
                      value={formData.certificate_no}
                      onChange={(e) =>
                        handleInputChange("certificate_no", e.target.value)
                      }
                      placeholder="Enter certificate no. / license no."
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.certificate_no
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.certificate_no && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.certificate_no}
                      </p>
                    )}
                  </div>

                  {/* Grade (for COC) - Only show if certificate.stcw_type === "COC" */}
                  {selectedCertificate?.stcw_type === "COC" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) =>
                          handleInputChange("grade", e.target.value)
                        }
                        placeholder="e.g., Master Mariner"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

                  {/* Rank Permitted - Only show if certificate.certificate_type_id === 6 */}
                  {selectedCertificate?.certificate_type_id === 6 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rank Permitted <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.rank_permitted}
                        onChange={(e) =>
                          handleInputChange("rank_permitted", e.target.value)
                        }
                        placeholder="e.g., Chief Engineer"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issuing Authority / Training Center
                    </label>
                    <input
                      type="text"
                      value={formData.issued_by}
                      onChange={(e) =>
                        handleInputChange("issued_by", e.target.value)
                      }
                      placeholder="e.g., MARINA, TESDA"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Issued
                      </label>
                      <input
                        type="date"
                        value={formData.date_issued}
                        onChange={(e) =>
                          handleInputChange("date_issued", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.date_issued
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.date_issued && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.date_issued}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          handleInputChange("expiry_date", e.target.value)
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expiry_date
                            ? "border-red-500"
                            : "border-gray-300"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Certificate File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      {documentFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {documentFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(documentFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDocumentFile(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Click to upload
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF or Image (Max 5MB)
                          </p>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-red-600 text-sm mt-1">{fileError}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Saving..." : "Add Certificate"}
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
