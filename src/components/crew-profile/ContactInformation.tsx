"use client";

import { User } from "@/types/api";

interface ContactInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
}

export default function ContactInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
}: ContactInformationProps) {
  const renderField = (
    label: string,
    value: string,
    field: string,
    required: boolean = false
  ) => {
    return (
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isEditing ? (
          <input
            type="text"
            value={(editedProfile?.[field as keyof User] as string) || ""}
            onChange={(e) => onInputChange(field, e.target.value)}
            className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
            <p className="text-gray-900 font-medium">
              {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="bi bi-geo-alt text-blue-600 mr-3"></i>
            Contact Information
          </h2>
          <p className="text-gray-600 mt-1">Address details and contact methods</p>
        </div>
        
        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <i className="bi bi-pencil text-sm"></i>
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 text-sm font-medium shadow-lg flex items-center space-x-2"
              >
                <i className="bi bi-x text-sm"></i>
                <span>Cancel</span>
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin text-sm"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check text-sm"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mailing/Permanent Address Section */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Mailing Address / Permanent Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField(
            "Region",
            profile.permanent_region || "Not provided",
            "permanent_region"
          )}

          {renderField(
            "Province",
            profile.permanent_province || "Not provided",
            "permanent_province"
          )}

          {renderField(
            "City/Municipality",
            profile.permanent_city || "Not provided",
            "permanent_city"
          )}

          {renderField(
            "Subdivision/Barangay",
            profile.permanent_barangay || "Not provided",
            "permanent_barangay"
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Building Name, Floor, Unit Number, Street Name
            </label>
            {isEditing ? (
              <textarea
                value={editedProfile?.permanent_street || ""}
                onChange={(e) =>
                  onInputChange(
                    "permanent_street",
                    e.target.value
                  )
                }
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                placeholder="Enter complete address"
                rows={3}
              />
            ) : (
              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                {profile.permanent_street || "Not provided"}
              </p>
            )}
          </div>

          {renderField(
            "Postal Code",
            profile.permanent_postal_code || "Not provided",
            "permanent_postal_code"
          )}
        </div>
      </div>

      {/* Contact Address Section */}
      <div className="bg-green-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField(
            "Region",
            profile.contact_region || "Not provided",
            "contact_region"
          )}

          {renderField(
            "Province",
            profile.contact_province || "Not provided",
            "contact_province"
          )}

          {renderField(
            "City/Municipality",
            profile.contact_city || "Not provided",
            "contact_city"
          )}

          {renderField(
            "Subdivision/Barangay",
            profile.contact_barangay || "Not provided",
            "contact_barangay"
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Building Name, Floor, Unit Number, Street Name
            </label>
            {isEditing ? (
              <textarea
                value={editedProfile?.contact_street || ""}
                onChange={(e) =>
                  onInputChange(
                    "contact_street",
                    e.target.value
                  )
                }
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                placeholder="Enter complete address"
                rows={3}
              />
            ) : (
              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                {profile.contact_street || "Not provided"}
              </p>
            )}
          </div>

          {renderField(
            "Postal Code",
            profile.contact_postal_code || "Not provided",
            "contact_postal_code"
          )}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedProfile?.email || ""}
                onChange={(e) =>
                  onInputChange("email", e.target.value)
                }
                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                placeholder="Enter email address"
              />
            ) : (
              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                {profile.email}
                {profile.email_verified_at && (
                  <span className="ml-2 text-green-600 text-sm">
                    ✓ Verified
                  </span>
                )}
              </p>
            )}
          </div>

          {renderField(
            "Mobile No.",
            profile.contacts?.mobile_number ||
              profile.mobile_number ||
              "Not provided",
            "mobile_number"
          )}

          {renderField(
            "Emergency Contact Number",
            profile.emergency_contact_number || "Not provided",
            "emergency_contact_number"
          )}

          {renderField(
            "Emergency Contact Relation",
            profile.emergency_contact_relation ||
              "Not provided",
            "emergency_contact_relation"
          )}
        </div>
      </div>
    </div>
  );
}