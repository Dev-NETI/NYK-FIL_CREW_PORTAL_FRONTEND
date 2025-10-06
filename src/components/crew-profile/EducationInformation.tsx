"use client";

import { User } from "@/types/api";

interface EducationInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
}

export default function EducationInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
}: EducationInformationProps) {
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
            <i className="bi bi-mortarboard text-blue-600 mr-3"></i>
            Educational Background
          </h2>
          <p className="text-gray-600 mt-1">Academic qualifications and certifications</p>
        </div>
        
        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
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

      {/* Educational Background Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
          College
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField(
            "School Name",
            profile.college_name || "Not provided",
            "college_name"
          )}

          {renderField(
            "Degree Earned",
            profile.college_degree || "Not provided",
            "college_degree"
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              Date Graduated
            </label>
            {isEditing ? (
              <input
                type="date"
                value={
                  editedProfile?.college_graduation_date || ""
                }
                onChange={(e) =>
                  onInputChange(
                    "college_graduation_date",
                    e.target.value
                  )
                }
                className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
              />
            ) : (
              <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
                <p className="text-gray-900 font-medium">
                  {profile.college_graduation_date
                    ? new Date(
                        profile.college_graduation_date
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}