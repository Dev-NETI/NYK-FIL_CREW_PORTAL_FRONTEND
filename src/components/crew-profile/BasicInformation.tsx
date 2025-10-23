"use client";

import React from "react";
import { User } from "@/types/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { Nationality } from "@/services/nationality";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

interface BasicInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
  nationalities: Nationality[];
  validationErrors?: Record<string, string[]>;
}

// Field option configurations
const GENDER_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const BLOOD_TYPE_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BasicInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
  nationalities,
  validationErrors = {},
}: BasicInformationProps) {
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


  // Utility function to format date for display
  const formatDateForDisplay = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Not specified";
    }
  };


  // Component for displaying field with label and value
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
            <i className="bi bi-person-lines-fill text-blue-600 mr-3"></i>
            Basic Information
          </h2>
          <p className="text-gray-600 mt-1">
            Personal details and identification
          </p>
        </div>

        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg flex items-center space-x-2 ${
                canEdit
                  ? "hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
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
      <div className="space-y-8">
        {/* Personal Name Fields */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="bi bi-person-badge text-blue-600 mr-2"></i>
            Full Name
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isEditing ? (
              <>
                <div>
                  <TextField
                    label="Last Name"
                    value={getEditedNestedFieldValue("profile", "last_name")}
                    onChange={(e) =>
                      onNestedInputChange("profile", "last_name", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    required
                    error={hasValidationError("profile.last_name")}
                  />
                  <ValidationError errors={getValidationError("profile.last_name")} />
                </div>
                <div>
                  <TextField
                    label="First Name"
                    value={getEditedNestedFieldValue("profile", "first_name")}
                    onChange={(e) =>
                      onNestedInputChange("profile", "first_name", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    required
                    error={hasValidationError("profile.first_name")}
                  />
                  <ValidationError errors={getValidationError("profile.first_name")} />
                </div>
                <div>
                  <TextField
                    label="Middle Name"
                    value={getEditedNestedFieldValue("profile", "middle_name")}
                    onChange={(e) =>
                      onNestedInputChange(
                        "profile",
                        "middle_name",
                        e.target.value
                      )
                    }
                    fullWidth
                    variant="outlined"
                    error={hasValidationError("profile.middle_name")}
                  />
                  <ValidationError errors={getValidationError("profile.middle_name")} />
                </div>
                <div>
                  <TextField
                    label="Suffix"
                    value={getEditedNestedFieldValue("profile", "suffix")}
                    onChange={(e) =>
                      onNestedInputChange("profile", "suffix", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    error={hasValidationError("profile.suffix")}
                  />
                  <ValidationError errors={getValidationError("profile.suffix")} />
                </div>
              </>
            ) : (
              <>
                <DisplayField
                  label="Last Name *"
                  value={profile.profile?.last_name as string}
                />
                <DisplayField
                  label="First Name *"
                  value={profile.profile?.first_name as string}
                />
                <DisplayField
                  label="Middle Name"
                  value={profile.profile?.middle_name as string}
                />
                <DisplayField
                  label="Suffix"
                  value={profile.profile?.suffix as string}
                />
              </>
            )}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="bi bi-globe text-blue-600 mr-2"></i>
            Demographics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Nationality
                  </label>
                  <FormControl fullWidth variant="outlined" error={hasValidationError("profile.nationality")}>
                    <Select
                      value={getEditedNestedFieldValue(
                        "profile",
                        "nationality"
                      )}
                      onChange={(e: SelectChangeEvent) =>
                        onNestedInputChange(
                          "profile",
                          "nationality",
                          e.target.value
                        )
                      }
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) return "Select Nationality";
                        const nationality = nationalities.find(
                          (n) => n.nationality === value
                        );
                        return nationality ? nationality.nationality : value;
                      }}
                    >
                      <MenuItem value="">Select Nationality</MenuItem>
                      {nationalities.map((nationality) => (
                        <MenuItem
                          key={nationality.id}
                          value={nationality.nationality}
                        >
                          {nationality.nationality}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <ValidationError errors={getValidationError("profile.nationality")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Gender
                  </label>
                  <FormControl fullWidth variant="outlined" error={hasValidationError("profile.gender")}>
                    <Select
                      value={getEditedNestedFieldValue("profile", "gender")}
                      onChange={(e: SelectChangeEvent) =>
                        onNestedInputChange("profile", "gender", e.target.value)
                      }
                      displayEmpty
                      renderValue={(value) => value || "Select Gender"}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      {GENDER_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <ValidationError errors={getValidationError("profile.gender")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Civil Status
                  </label>
                  <FormControl fullWidth variant="outlined" error={hasValidationError("profile.civil_status")}>
                    <Select
                      value={getEditedNestedFieldValue(
                        "profile",
                        "civil_status"
                      )}
                      onChange={(e: SelectChangeEvent) =>
                        onNestedInputChange(
                          "profile",
                          "civil_status",
                          e.target.value
                        )
                      }
                      displayEmpty
                      renderValue={(value) => value || "Select Civil Status"}
                    >
                      <MenuItem value="">Select Civil Status</MenuItem>
                      {CIVIL_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <ValidationError errors={getValidationError("profile.civil_status")} />
                </div>
              </>
            ) : (
              <>
                <DisplayField
                  label="Nationality"
                  value={(() => {
                    const value = profile.profile?.nationality as string;
                    if (!value) return "Not specified";
                    const nationality = nationalities.find(
                      (n) => n.nationality === value
                    );
                    return nationality ? nationality.nationality : value;
                  })()}
                />
                <DisplayField
                  label="Gender"
                  value={profile.profile?.gender as string}
                />
                <DisplayField
                  label="Civil Status"
                  value={profile.profile?.civil_status as string}
                />
              </>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="bi bi-calendar-heart text-blue-600 mr-2"></i>
            Birth & Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Birth Date
                  </label>
                  <DatePicker
                    value={(() => {
                      const dateValue =
                        getEditedNestedFieldValue("profile", "birth_date") ||
                        profile.profile?.birth_date;
                      if (!dateValue) return null;
                      try {
                        return dayjs(dateValue).isValid()
                          ? dayjs(dateValue)
                          : null;
                      } catch {
                        return null;
                      }
                    })()}
                    onChange={(newValue) => {
                      try {
                        const dateString =
                          newValue && dayjs(newValue).isValid()
                            ? dayjs(newValue).format("YYYY-MM-DD")
                            : "";
                        onNestedInputChange(
                          "profile",
                          "birth_date",
                          dateString
                        );
                      } catch (error) {
                        console.error("Date picker error:", error);
                        onNestedInputChange("profile", "birth_date", "");
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Birth Place
                  </label>
                  <TextField
                    label="Birth Place"
                    value={getEditedNestedFieldValue("profile", "birth_place")}
                    onChange={(e) =>
                      onNestedInputChange(
                        "profile",
                        "birth_place",
                        e.target.value
                      )
                    }
                    fullWidth
                    variant="outlined"
                    error={hasValidationError("profile.birth_place")}
                  />
                  <ValidationError errors={getValidationError("profile.birth_place")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Blood Type
                  </label>
                  <FormControl fullWidth variant="outlined" error={hasValidationError("physicalTraits.blood_type")}>
                    <Select
                      value={getEditedNestedFieldValue(
                        "physicalTraits",
                        "blood_type"
                      )}
                      onChange={(e: SelectChangeEvent) =>
                        onNestedInputChange(
                          "physicalTraits",
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
                  <ValidationError errors={getValidationError("physicalTraits.blood_type")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Religion
                  </label>
                  <TextField
                    label="Religion"
                    value={getEditedNestedFieldValue("profile", "religion")}
                    onChange={(e) =>
                      onNestedInputChange("profile", "religion", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    error={hasValidationError("profile.religion")}
                  />
                  <ValidationError errors={getValidationError("profile.religion")} />
                </div>
              </>
            ) : (
              <>
                <DisplayField
                  label="Birth Date"
                  value={formatDateForDisplay(
                    profile.profile?.birth_date as string
                  )}
                />
                <DisplayField
                  label="Birth Place"
                  value={profile.profile?.birth_place as string}
                />
                <DisplayField
                  label="Blood Type"
                  value={profile.physical_traits?.blood_type as string}
                />
                <DisplayField
                  label="Religion"
                  value={profile.profile?.religion as string}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
