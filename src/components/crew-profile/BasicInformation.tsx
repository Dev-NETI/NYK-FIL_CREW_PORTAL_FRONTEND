"use client";

import { User } from "@/types/api";

interface BasicInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
}

export default function BasicInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
  onNestedInputChange,
}: BasicInformationProps) {
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

  const renderNestedField = (
    label: string,
    value: string,
    parent: string,
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
            value={
              ((
                editedProfile?.[parent as keyof User] as Record<string, unknown>
              )?.[field] as string) || ""
            }
            onChange={(e) =>
              onNestedInputChange(parent, field, e.target.value)
            }
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

  const renderSelectField = (
    label: string,
    value: string,
    field: string,
    options: string[],
    required: boolean = false
  ) => {
    return (
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isEditing ? (
          <select
            value={(editedProfile?.[field as keyof User] as string) || ""}
            onChange={(e) => onInputChange(field, e.target.value)}
            className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            <i className="bi bi-person-lines-fill text-blue-600 mr-3"></i>
            Basic Information
          </h2>
          <p className="text-gray-600 mt-1">Personal details and identification</p>
        </div>
        
        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
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

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderNestedField(
          "Last Name",
          profile.profile?.last_name ||
            profile.last_name ||
            "Not provided",
          "profile",
          "last_name",
          true
        )}

        {renderNestedField(
          "First Name",
          profile.profile?.first_name ||
            profile.first_name ||
            "Not provided",
          "profile",
          "first_name",
          true
        )}

        {renderNestedField(
          "Middle Name",
          profile.profile?.middle_name ||
            profile.middle_name ||
            "Not provided",
          "profile",
          "middle_name"
        )}

        {renderNestedField(
          "Suffix",
          profile.profile?.suffix ||
            profile.suffix ||
            "Not provided",
          "profile",
          "suffix"
        )}

        {renderField(
          "Nationality",
          profile.nationality || "Not provided",
          "nationality"
        )}

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            Gender
          </label>
          {isEditing ? (
            <select
              value={
                ((
                  editedProfile?.profile as Record<
                    string,
                    unknown
                  >
                )?.gender as string) ||
                editedProfile?.gender ||
                ""
              }
              onChange={(e) =>
                onNestedInputChange(
                  "profile",
                  "gender",
                  e.target.value
                )
              }
              className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
              <p className="text-gray-900 font-medium">
                {profile.profile?.gender ||
                  profile.gender ||
                  <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          )}
        </div>

        {renderSelectField(
          "Civil Status",
          profile.civil_status || "Not provided",
          "civil_status",
          [
            "Single",
            "Married",
            "Divorced",
            "Widowed",
            "Separated",
          ]
        )}

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            Birth Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={editedProfile?.date_of_birth || ""}
              onChange={(e) =>
                onInputChange(
                  "date_of_birth",
                  e.target.value
                )
              }
              className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
            />
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
              <p className="text-gray-900 font-medium">
                {profile.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString()
                  : <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          )}
        </div>

        {renderField(
          "Birth Place",
          profile.birth_place || "Not provided",
          "birth_place"
        )}

        {renderSelectField(
          "Blood Type",
          profile.blood_type || "Not provided",
          "blood_type",
          ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        )}

        {renderField(
          "Religion",
          profile.religion || "Not provided",
          "religion"
        )}
      </div>
    </div>
  );
}