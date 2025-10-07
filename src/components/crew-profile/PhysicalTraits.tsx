"use client";

import { User } from "@/types/api";

interface PhysicalTraitsProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
}

export default function PhysicalTraits({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
}: PhysicalTraitsProps) {
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
            <i className="bi bi-body-text text-blue-600 mr-3"></i>
            Physical Traits
          </h2>
          <p className="text-gray-600 mt-1">Physical characteristics and measurements</p>
        </div>
        
        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
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
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            Height (cm)
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editedProfile?.height || ""}
              onChange={(e) =>
                onInputChange("height", e.target.value)
              }
              className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
              placeholder="Enter height in cm"
              min="0"
              max="300"
            />
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
              <p className="text-gray-900 font-medium">
                {profile.physical_traits?.height || profile.height
                  ? `${profile.physical_traits?.height || profile.height} cm`
                  : <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            Weight (kg)
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editedProfile?.weight || ""}
              onChange={(e) =>
                onInputChange("weight", e.target.value)
              }
              className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
              placeholder="Enter weight in kg"
              min="0"
              max="500"
            />
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
              <p className="text-gray-900 font-medium">
                {profile.physical_traits?.weight || profile.weight
                  ? `${profile.physical_traits?.weight || profile.weight} kg`
                  : <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          )}
        </div>

        {renderField(
          "Eye Color",
          profile.physical_traits?.eye_color ||
            profile.eye_color ||
            "Not provided",
          "eye_color"
        )}

        {renderField(
          "Hair Color",
          profile.physical_traits?.hair_color ||
            profile.hair_color ||
            "Not provided",
          "hair_color"
        )}
      </div>
    </div>
  );
}