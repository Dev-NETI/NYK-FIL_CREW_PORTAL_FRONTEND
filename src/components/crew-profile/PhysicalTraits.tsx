"use client";

import { User } from "@/types/api";
import { TextField } from "@mui/material";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

interface PhysicalTraitsProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
  validationErrors?: Record<string, string[]>;
}

export default function PhysicalTraits({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
  validationErrors = {},
}: PhysicalTraitsProps) {
  // Use validation hook for cleaner validation logic
  const { getValidationError, hasValidationError } = useValidation({ validationErrors });

  // Utility function to get edited nested field value
  const getEditedNestedFieldValue = (parent: string, field: string): string => {
    return (
      ((editedProfile?.[parent as keyof User] as Record<string, unknown>)?.[
        field
      ] as string) || ""
    );
  };

  // Component for displaying field with label and value (copied from BasicInformation)
  const DisplayField = ({
    label,
    value,
    className = "",
  }: {
    label: string;
    value: string | null | undefined;
    className?: string;
  }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
        {value || "Not specified"}
      </p>
    </div>
  );


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
        <div>
          {isEditing ? (
            <div>
              <TextField
                label="Height (cm)"
                type="number"
                value={getEditedNestedFieldValue("physicalTraits", "height")}
                onChange={(e) => onNestedInputChange("physicalTraits", "height", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter height in cm"
                error={hasValidationError("physicalTraits.height")}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 300,
                  },
                }}
              />
              <ValidationError errors={getValidationError("physicalTraits.height")} />
            </div>
          ) : (
            <DisplayField
              label="Height (cm)"
              value={
                profile.physical_traits?.height
                  ? `${profile.physical_traits?.height} cm`
                  : undefined
              }
            />
          )}
        </div>

        <div>
          {isEditing ? (
            <div>
              <TextField
                label="Weight (kg)"
                type="number"
                value={getEditedNestedFieldValue("physicalTraits", "weight")}
                onChange={(e) => onNestedInputChange("physicalTraits", "weight", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter weight in kg"
                error={hasValidationError("physicalTraits.weight")}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 500,
                  },
                }}
              />
              <ValidationError errors={getValidationError("physicalTraits.weight")} />
            </div>
          ) : (
            <DisplayField
              label="Weight (kg)"
              value={
                profile.physical_traits?.weight
                  ? `${profile.physical_traits?.weight} kg`
                  : undefined
              }
            />
          )}
        </div>

        <div>
          {isEditing ? (
            <div>
              <TextField
                label="Eye Color"
                value={getEditedNestedFieldValue("physicalTraits", "eye_color")}
                onChange={(e) => onNestedInputChange("physicalTraits", "eye_color", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter eye color"
                error={hasValidationError("physicalTraits.eye_color")}
              />
              <ValidationError errors={getValidationError("physicalTraits.eye_color")} />
            </div>
          ) : (
            <DisplayField
              label="Eye Color"
              value={profile.physical_traits?.eye_color}
            />
          )}
        </div>

        <div>
          {isEditing ? (
            <div>
              <TextField
                label="Hair Color"
                value={getEditedNestedFieldValue("physicalTraits", "hair_color")}
                onChange={(e) => onNestedInputChange("physicalTraits", "hair_color", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter hair color"
                error={hasValidationError("physicalTraits.hair_color")}
              />
              <ValidationError errors={getValidationError("physicalTraits.hair_color")} />
            </div>
          ) : (
            <DisplayField
              label="Hair Color"
              value={profile.physical_traits?.hair_color}
            />
          )}
        </div>
      </div>
    </div>
  );
}
