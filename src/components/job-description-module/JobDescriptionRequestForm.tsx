"use client";

import { useState } from "react";

interface JobDescriptionRequest {
  purpose: string;
  visaType?: string;
  notes?: string;
}

interface JobDescriptionRequestFormProps {
  onSubmit: (data: JobDescriptionRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export default function JobDescriptionRequestForm({
  onSubmit,
  isSubmitting = false,
}: JobDescriptionRequestFormProps) {
  const [formData, setFormData] = useState<JobDescriptionRequest>({
    purpose: "",
    visaType: "",
    notes: "",
  });

  const purposeOptions = [
    { value: "SSS", label: "Social Security System (SSS)" },
    { value: "PAG_IBIG", label: "Pag-Ibig Fund" },
    { value: "PHILHEALTH", label: "PhilHealth" },
    { value: "VISA", label: "VISA Application" },
  ];

  const visaTypes = [
    { value: "TOURIST", label: "Tourist Visa" },
    { value: "BUSINESS", label: "Business Visa" },
    { value: "WORK", label: "Work Visa" },
    { value: "TRANSIT", label: "Transit Visa" },
    { value: "STUDENT", label: "Student Visa" },
    { value: "FAMILY", label: "Family/Dependent Visa" },
    { value: "SEAMAN", label: "Seaman's Visa" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "purpose" && value !== "VISA" && { visaType: "" }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      purpose: "",
      visaType: "",
      notes: "",
    });
  };

  const isFormValid =
    formData.purpose && (formData.purpose !== "VISA" || formData.visaType);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="purpose"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Purpose of Request <span className="text-red-500">*</span>
          </label>
          <select
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select purpose of request</option>
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {formData.purpose === "VISA" && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="visaType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              VISA Type <span className="text-red-500">*</span>
            </label>
            <select
              id="visaType"
              name="visaType"
              value={formData.visaType}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select VISA type</option>
              {visaTypes.map((visa) => (
                <option key={visa.value} value={visa.value}>
                  {visa.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            disabled={isSubmitting}
            placeholder="Add any additional information or special requirements..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="bi bi-exclamation-triangle text-yellow-600 text-lg mt-0.5 mr-3"></i>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Information:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  Your request will be reviewed by the Executive Assistant and
                  Vice President
                </li>
                <li>Processing typically takes 2-3 business days</li>
                <li>
                  You will receive email notifications about status updates
                </li>
                <li>Ensure all information is accurate before submitting</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            Reset Form
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send mr-2"></i>
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
