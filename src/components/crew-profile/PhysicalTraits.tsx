"use client";

import { User } from "@/types/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

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
  validationErrors?: Record<string, string[]>;
}

const BLOOD_TYPE_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
  validationErrors = {},
}: PhysicalTraitsProps) {
  // Use validation hook for cleaner validation logic
  const { getValidationError, hasValidationError } = useValidation({
    validationErrors,
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-6 border-b border-gray-200 space-y-3 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <i className="bi bi-body-text text-blue-600 mr-2 sm:mr-3 text-lg sm:text-xl"></i>
            <span className="leading-tight">Physical Traits</span>
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Physical characteristics and measurements
          </p>
        </div>

        {/* Edit Controls - Mobile App Style */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium text-base flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation active:scale-[0.98] ${
                canEdit
                  ? "hover:bg-purple-700 active:bg-purple-800 shadow-sm active:shadow-none"
                  : "opacity-50 cursor-not-allowed"
              }`}
              title={
                !canEdit ? "You don't have permission to edit this section" : ""
              }
            >
              <i className="bi bi-pencil text-base"></i>
              <span>Edit Physical</span>
            </button>
          ) : (
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={onCancel}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl transition-all duration-200 font-medium text-base flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation active:scale-[0.98] hover:bg-gray-200 active:bg-gray-300 border border-gray-200"
              >
                <i className="bi bi-x-lg text-base"></i>
                <span className="sm:inline">Cancel</span>
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl transition-all duration-200 font-medium text-base flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation active:scale-[0.98] shadow-sm active:shadow-none"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin text-base"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg text-base"></i>
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
                value={getEditedNestedFieldValue("physical_traits", "height")}
                onChange={(e) =>
                  onNestedInputChange(
                    "physical_traits",
                    "height",
                    e.target.value
                  )
                }
                fullWidth
                variant="outlined"
                placeholder="Enter height in cm"
                error={hasValidationError("physical_traits.height")}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 300,
                  },
                }}
              />
              <ValidationError
                errors={getValidationError("physical_traits.height")}
              />
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
                value={getEditedNestedFieldValue("physical_traits", "weight")}
                onChange={(e) =>
                  onNestedInputChange(
                    "physical_traits",
                    "weight",
                    e.target.value
                  )
                }
                fullWidth
                variant="outlined"
                placeholder="Enter weight in kg"
                error={hasValidationError("physical_traits.weight")}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 500,
                  },
                }}
              />
              <ValidationError
                errors={getValidationError("physical_traits.weight")}
              />
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
                value={getEditedNestedFieldValue(
                  "physical_traits",
                  "eye_color"
                )}
                onChange={(e) =>
                  onNestedInputChange(
                    "physical_traits",
                    "eye_color",
                    e.target.value
                  )
                }
                fullWidth
                variant="outlined"
                placeholder="Enter eye color"
                error={hasValidationError("physical_traits.eye_color")}
              />
              <ValidationError
                errors={getValidationError("physical_traits.eye_color")}
              />
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
                value={getEditedNestedFieldValue(
                  "physical_traits",
                  "hair_color"
                )}
                onChange={(e) =>
                  onNestedInputChange(
                    "physical_traits",
                    "hair_color",
                    e.target.value
                  )
                }
                fullWidth
                variant="outlined"
                placeholder="Enter hair color"
                error={hasValidationError("physical_traits.hair_color")}
              />
              <ValidationError
                errors={getValidationError("physical_traits.hair_color")}
              />
            </div>
          ) : (
            <DisplayField
              label="Hair Color"
              value={profile.physical_traits?.hair_color}
            />
          )}
        </div>

        <div>
          {isEditing ? (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Blood Type
              </label>
              <FormControl
                fullWidth
                variant="outlined"
                error={hasValidationError("physical_traits.blood_type")}
              >
                <Select
                  value={getEditedNestedFieldValue(
                    "physical_traits",
                    "blood_type"
                  )}
                  onChange={(e: SelectChangeEvent) =>
                    onNestedInputChange(
                      "physical_traits",
                      "blood_type",
                      e.target.value
                    )
                  }
                  displayEmpty
                  renderValue={(value) => value || "Select Blood Type"}
                >
                  <MenuItem value="">Select Blood Type</MenuItem>
                  {BLOOD_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ValidationError
                errors={getValidationError("physical_traits.blood_type")}
              />
            </div>
          ) : (
            <DisplayField
              label="Blood Type"
              value={profile.physical_traits?.blood_type}
            />
          )}
        </div>
      </div>
    </div>
  );
}
