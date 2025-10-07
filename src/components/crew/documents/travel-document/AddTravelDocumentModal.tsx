import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TravelDocumentService } from "@/services/travel-document";

interface AddTravelDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentType: string;
  documentTypeId: number;
  crewId: string;
  icon: string;
}

// Yup validation schemas
const idNoSchema = Yup.string()
  .required("ID Number is required")
  .min(3, "ID Number must be at least 3 characters")
  .max(50, "ID Number must not exceed 50 characters")
  .trim();

const placeOfIssueSchema = Yup.string()
  .required("Place of Issue is required")
  .trim();

const dateSchema = Yup.date().required("This field is required");

const remainingPagesSchema = Yup.number()
  .required("Remaining pages is required")
  .min(1, "Must be at least 1 page")
  .max(100, "Cannot exceed 100 pages");

export default function AddTravelDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  documentType,
  documentTypeId,
  crewId,
  icon,
}: AddTravelDocumentModalProps) {
  const [formData, setFormData] = useState({
    id_no: "",
    place_of_issue: "",
    date_of_issue: "",
    expiration_date: "",
    remaining_pages: "",
    visa_type: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isSIRB = documentTypeId === 2;
  const isUSVISA = documentTypeId === 4;

  const validateField = async (
    fieldName: string,
    value: any
  ): Promise<boolean> => {
    try {
      let schema;
      switch (fieldName) {
        case "id_no":
          schema = idNoSchema;
          break;
        case "place_of_issue":
          schema = placeOfIssueSchema;
          break;
        case "date_of_issue":
        case "expiration_date":
          schema = dateSchema;
          break;
        case "remaining_pages":
          schema = remainingPagesSchema;
          break;
        default:
          return true;
      }

      await schema.validate(value);
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
      }
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateForm = async (): Promise<boolean> => {
    const validations = await Promise.all([
      validateField("id_no", formData.id_no),
      validateField("place_of_issue", formData.place_of_issue),
      validateField("date_of_issue", formData.date_of_issue),
      validateField("expiration_date", formData.expiration_date),
      isSIRB
        ? validateField("remaining_pages", formData.remaining_pages)
        : true,
    ]);

    if (isUSVISA && !formData.visa_type) {
      setErrors((prev) => ({ ...prev, visa_type: "Visa type is required" }));
      return false;
    }

    return validations.every((v) => v);
  };

  const handleSave = async () => {
    const isValid = await validateForm();

    if (!isValid) {
      toast.error("Please fix all validation errors");
      return;
    }

    setIsSaving(true);

    try {
      const travelDocData = {
        crew_id: parseInt(crewId),
        travel_document_type_id: documentTypeId,
        id_no: formData.id_no.trim(),
        place_of_issue: formData.place_of_issue.trim(),
        date_of_issue: formData.date_of_issue,
        expiration_date: formData.expiration_date,
        ...(isSIRB && { remaining_pages: parseInt(formData.remaining_pages) }),
        ...(isUSVISA
          ? { visa_type: formData.visa_type, is_US_VISA: true }
          : { is_US_VISA: false }),
      };

      const response = await TravelDocumentService.saveTravelDocument(
        travelDocData
      );

      toast.success(response.message);

      // Reset form and close modal
      setFormData({
        id_no: "",
        place_of_issue: "",
        date_of_issue: "",
        expiration_date: "",
        remaining_pages: "",
        visa_type: "",
      });
      setErrors({});
      onClose();

      // Reload the list
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to save travel document";
      toast.error(errorMessage);
      console.error("Error saving travel document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      id_no: "",
      place_of_issue: "",
      date_of_issue: "",
      expiration_date: "",
      remaining_pages: "",
      visa_type: "",
    });
    setErrors({});
    onClose();
  };

  const getColorClasses = () => {
    const colorMap: Record<
      string,
      { bg: string; hover: string; ring: string }
    > = {
      Passport: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        ring: "focus:ring-blue-500",
      },
      "Seafarer's Identification and Record Book (SIRB)": {
        bg: "bg-purple-600",
        hover: "hover:bg-purple-700",
        ring: "focus:ring-purple-500",
      },
      "Seafarer's Identity Document (SID)": {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                      Enter travel document details
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
                      value={formData.id_no}
                      onChange={(e) =>
                        handleInputChange("id_no", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.id_no
                          ? "border-red-500 focus:ring-red-500"
                          : `border-gray-300 ${colors.ring} focus:border-transparent`
                      }`}
                      placeholder="Enter ID number"
                    />
                    {errors.id_no && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.id_no}
                      </p>
                    )}
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
                      value={formData.place_of_issue}
                      onChange={(e) =>
                        handleInputChange("place_of_issue", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.place_of_issue
                          ? "border-red-500 focus:ring-red-500"
                          : `border-gray-300 ${colors.ring} focus:border-transparent`
                      }`}
                      placeholder="Enter place of issue"
                    />
                    {errors.place_of_issue && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {errors.place_of_issue}
                      </p>
                    )}
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
                        value={formData.date_of_issue}
                        onChange={(e) =>
                          handleInputChange("date_of_issue", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.date_of_issue
                            ? "border-red-500 focus:ring-red-500"
                            : `border-gray-300 ${colors.ring} focus:border-transparent`
                        }`}
                      />
                      {errors.date_of_issue && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.date_of_issue}
                        </p>
                      )}
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
                        value={formData.expiration_date}
                        onChange={(e) =>
                          handleInputChange("expiration_date", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.expiration_date
                            ? "border-red-500 focus:ring-red-500"
                            : `border-gray-300 ${colors.ring} focus:border-transparent`
                        }`}
                      />
                      {errors.expiration_date && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.expiration_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remaining Pages - Only for SIRB */}
                  {isSIRB && (
                    <div>
                      <label
                        htmlFor="remaining_pages"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Remaining Pages <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="remaining_pages"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.remaining_pages}
                        onChange={(e) =>
                          handleInputChange("remaining_pages", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.remaining_pages
                            ? "border-red-500 focus:ring-red-500"
                            : `border-gray-300 ${colors.ring} focus:border-transparent`
                        }`}
                        placeholder="Enter remaining pages"
                      />
                      {errors.remaining_pages && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.remaining_pages}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Visa Type - Only for US VISA */}
                  {isUSVISA && (
                    <div>
                      <label
                        htmlFor="visa_type"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Visa Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="visa_type"
                        value={formData.visa_type}
                        onChange={(e) =>
                          handleInputChange("visa_type", e.target.value)
                        }
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.visa_type
                            ? "border-red-500 focus:ring-red-500"
                            : `border-gray-300 ${colors.ring} focus:border-transparent`
                        }`}
                      >
                        <option value="">Select visa type</option>
                        <option value="C1/D">C1/D</option>
                      </select>
                      {errors.visa_type && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {errors.visa_type}
                        </p>
                      )}
                    </div>
                  )}
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
