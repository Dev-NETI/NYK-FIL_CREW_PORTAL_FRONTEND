"use client";

import React from "react";
import { User } from "@/types/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Nationality } from "@/services/nationality";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface BasicInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
  nationalities: Nationality[];
}

// Field option configurations
const GENDER_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
];
const BLOOD_TYPE_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BasicInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
  nationalities,
}: BasicInformationProps) {
  // Utility function to get edited nested field value
  const getEditedNestedFieldValue = (parent: string, field: string): string => {
    return (
      ((editedProfile?.[parent as keyof User] as Record<string, unknown>)?.[
        field
      ] as string) || ""
    );
  };

  // Utility function to format date from ISO to yyyy-MM-dd
  const formatDateForInput = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
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
          <p className="text-gray-600 mt-1">
            Personal details and identification
          </p>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please ensure all information is accurate and up to date
          </Typography>
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
      <div className="space-y-8">
        {/* Personal Name Fields - All in one row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Last Name */}
          <div>
            {isEditing ? (
              <TextField
                label="Last Name *"
                value={getEditedNestedFieldValue("profile", "last_name")}
                onChange={(e) =>
                  onNestedInputChange("profile", "last_name", e.target.value)
                }
                fullWidth
                variant="outlined"
                required
              />
            ) : (
              <TextField
                label="Last Name *"
                value={(profile.profile?.last_name as string) || ""}
                fullWidth
                variant="outlined"
                disabled
                required
              />
            )}
          </div>

          {/* First Name */}
          <div>
            {isEditing ? (
              <TextField
                label="First Name"
                value={getEditedNestedFieldValue("profile", "first_name")}
                onChange={(e) =>
                  onNestedInputChange("profile", "first_name", e.target.value)
                }
                fullWidth
                variant="outlined"
                required
              />
            ) : (
              <TextField
                label="First Name"
                value={(profile.profile?.first_name as string) || ""}
                fullWidth
                variant="outlined"
                disabled
                required
              />
            )}
          </div>

          {/* Middle Name */}
          <div>
            {isEditing ? (
              <TextField
                label="Middle Name"
                value={getEditedNestedFieldValue("profile", "middle_name")}
                onChange={(e) =>
                  onNestedInputChange("profile", "middle_name", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            ) : (
              <TextField
                label="Middle Name"
                value={(profile.profile?.middle_name as string) || ""}
                fullWidth
                variant="outlined"
                disabled
              />
            )}
          </div>

          {/* Suffix */}
          <div>
            {isEditing ? (
              <TextField
                label="Suffix"
                value={getEditedNestedFieldValue("profile", "suffix")}
                onChange={(e) =>
                  onNestedInputChange("profile", "suffix", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            ) : (
              <TextField
                label="Suffix"
                value={(profile.profile?.suffix as string) || ""}
                fullWidth
                variant="outlined"
                disabled
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nationality */}
          <div>
            {isEditing ? (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={getEditedNestedFieldValue("profile", "nationality")}
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
            ) : (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={(profile.profile?.nationality as string) || ""}
                  displayEmpty
                  disabled
                  renderValue={(value) => {
                    if (!value) return "Not specified";
                    const nationality = nationalities.find(
                      (n) => n.nationality === value
                    );
                    return nationality ? nationality.nationality : value;
                  }}
                >
                  <MenuItem value="">Not specified</MenuItem>
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
            )}
          </div>

          {/* Gender */}
          <div>
            {isEditing ? (
              <FormControl fullWidth variant="outlined">
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
            ) : (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={(profile.profile?.gender as string) || ""}
                  displayEmpty
                  disabled
                  renderValue={(value) => value || "Not specified"}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>

          {/* Civil Status */}
          <div>
            {isEditing ? (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={getEditedNestedFieldValue("profile", "civil_status")}
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
            ) : (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={(profile.profile?.civil_status as string) || ""}
                  displayEmpty
                  disabled
                  renderValue={(value) => value || "Not specified"}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  {CIVIL_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>

        {/* Basic Information Fields - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Birth Date */}
          <div>
            {isEditing ? (
              <DatePicker
                label="Birth Date"
                value={(() => {
                  const dateValue =
                    getEditedNestedFieldValue("profile", "birth_date") ||
                    profile.profile?.birth_date;
                  if (!dateValue) return null;
                  try {
                    return dayjs(dateValue).isValid() ? dayjs(dateValue) : null;
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
                    onNestedInputChange("profile", "birth_date", dateString);
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
            ) : (
              <TextField
                label="Birth Date"
                type="date"
                value={formatDateForInput(
                  profile.profile?.birth_date as string
                )}
                fullWidth
                variant="outlined"
                disabled
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
          </div>

          {/* Birth Place */}
          <div>
            {isEditing ? (
              <TextField
                label="Birth Place"
                value={getEditedNestedFieldValue("profile", "birth_place")}
                onChange={(e) =>
                  onNestedInputChange("profile", "birth_place", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            ) : (
              <TextField
                label="Birth Place"
                value={(profile.profile?.birth_place as string) || ""}
                fullWidth
                variant="outlined"
                disabled
              />
            )}
          </div>

          {/* Blood Type */}
          <div>
            {isEditing ? (
              <FormControl fullWidth variant="outlined">
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
            ) : (
              <FormControl fullWidth variant="outlined">
                <Select
                  value={(profile.physical_traits?.blood_type as string) || ""}
                  displayEmpty
                  disabled
                  renderValue={(value) => value || "Not specified"}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  {BLOOD_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>

          {/* Religion */}
          <div>
            {isEditing ? (
              <TextField
                label="Religion"
                value={getEditedNestedFieldValue("profile", "religion")}
                onChange={(e) =>
                  onNestedInputChange("profile", "religion", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            ) : (
              <TextField
                label="Religion"
                value={(profile.profile?.religion as string) || ""}
                fullWidth
                variant="outlined"
                disabled
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
