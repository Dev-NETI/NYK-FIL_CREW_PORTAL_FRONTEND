"use client";

import { User } from "@/types/api";
import { TextField } from "@mui/material";

interface PhysicalTraitsProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
}

export default function PhysicalTraits({
  profile,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
}: PhysicalTraitsProps) {
  // Utility function to get edited nested field value
  const getEditedNestedFieldValue = (parent: string, field: string): string => {
    return (
      ((editedProfile?.[parent as keyof User] as Record<string, unknown>)?.[
        field
      ] as string) || ""
    );
  };

  const renderField = (
    label: string,
    value: string,
    field: string,
    required: boolean = false
  ) => {
    return (
      <div>
        {isEditing ? (
          <TextField
            label={label}
            value={getEditedNestedFieldValue("physicalTraits", field)}
            onChange={(e) => onNestedInputChange("physicalTraits", field, e.target.value)}
            fullWidth
            variant="outlined"
            required={required}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <TextField
            label={label}
            value={value || "Not provided"}
            fullWidth
            variant="outlined"
            disabled
            required={required}
          />
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
          <p className="text-gray-600 mt-1">
            Physical characteristics and measurements
          </p>
        </div>

        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg flex items-center space-x-2 ${
                canEdit
                  ? "hover:from-purple-700 hover:to-purple-800 hover:shadow-xl"
                  : "opacity-50 cursor-not-allowed"
              }`}
              title={!canEdit ? "You don't have permission to edit this section" : ""}
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
        <div>
          {isEditing ? (
            <TextField
              label="Height (cm)"
              type="number"
              value={getEditedNestedFieldValue("physicalTraits", "height")}
              onChange={(e) => onNestedInputChange("physicalTraits", "height", e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter height in cm"
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 300,
                },
              }}
            />
          ) : (
            <TextField
              label="Height (cm)"
              value={
                profile.physical_traits?.height
                  ? `${profile.physical_traits?.height} cm`
                  : "Not provided"
              }
              fullWidth
              variant="outlined"
              disabled
            />
          )}
        </div>

        <div>
          {isEditing ? (
            <TextField
              label="Weight (kg)"
              type="number"
              value={getEditedNestedFieldValue("physicalTraits", "weight")}
              onChange={(e) => onNestedInputChange("physicalTraits", "weight", e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter weight in kg"
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 500,
                },
              }}
            />
          ) : (
            <TextField
              label="Weight (kg)"
              value={
                profile.physical_traits?.weight
                  ? `${profile.physical_traits?.weight} kg`
                  : "Not provided"
              }
              fullWidth
              variant="outlined"
              disabled
            />
          )}
        </div>

        {renderField(
          "Eye Color",
          profile.physical_traits?.eye_color || "Not provided",
          "eye_color"
        )}

        {renderField(
          "Hair Color",
          profile.physical_traits?.hair_color || "Not provided",
          "hair_color"
        )}
      </div>
    </div>
  );
}
