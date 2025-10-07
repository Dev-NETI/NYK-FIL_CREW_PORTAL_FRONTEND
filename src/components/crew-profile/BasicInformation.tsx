"use client";

import { User } from "@/types/api";

// Extended User interface to handle backward compatibility
interface ExtendedUser extends User {
  // Direct field access for backward compatibility
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  nationality?: string;
  gender?: string;
  civil_status?: string;
  date_of_birth?: string;
  birth_place?: string;
  blood_type?: string;
  religion?: string;
}

interface BasicInformationProps {
  profile: ExtendedUser;
  editedProfile: ExtendedUser | null;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
}

// Field option configurations
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
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
  onInputChange,
  onNestedInputChange,
}: BasicInformationProps) {
  // Utility function to get field value with fallback
  const getFieldValue = (field: keyof ExtendedUser): string => {
    return (
      (profile.profile?.[field as keyof typeof profile.profile] as string) ||
      (profile[field] as string) ||
      "Not provided"
    );
  };

  // Utility function to get edited field value
  const getEditedFieldValue = (field: keyof ExtendedUser): string => {
    return (editedProfile?.[field] as string) || "";
  };

  // Utility function to get edited nested field value
  const getEditedNestedFieldValue = (parent: string, field: string): string => {
    return (
      ((
        editedProfile?.[parent as keyof ExtendedUser] as Record<string, unknown>
      )?.[field] as string) || ""
    );
  };

  // Base field component
  const FieldContainer = ({
    children,
    label,
    required = false,
  }: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
  }) => (
    <div className="group">
      <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );

  // Display component for non-editing state
  const DisplayField = ({ value }: { value: string }) => (
    <div className="py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:shadow-md transition-all duration-200">
      <p className="text-gray-900 font-medium">
        {value && value !== "Not provided" ? (
          value
        ) : (
          <span className="text-gray-400 italic">Not provided</span>
        )}
      </p>
    </div>
  );

  // Text input component
  const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
  }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
      placeholder={placeholder}
    />
  );

  // Select input component
  const SelectInput = ({
    value,
    onChange,
    options,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full py-4 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 hover:border-gray-300"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  // Standard field renderer
  const renderField = (
    label: string,
    field: keyof ExtendedUser,
    required: boolean = false,
    type: string = "text"
  ) => {
    const value = getFieldValue(field);
    const editedValue = getEditedFieldValue(field);

    return (
      <FieldContainer label={label} required={required}>
        {isEditing ? (
          <TextInput
            value={editedValue}
            onChange={(val) => onInputChange(field as string, val)}
            placeholder={`Enter ${label.toLowerCase()}`}
            type={type}
          />
        ) : (
          <DisplayField value={value} />
        )}
      </FieldContainer>
    );
  };

  // Nested field renderer
  const renderNestedField = (
    label: string,
    parent: string,
    field: string,
    required: boolean = false
  ) => {
    const value =
      (profile.profile?.[field as keyof typeof profile.profile] as string) ||
      (profile[field as keyof ExtendedUser] as string) ||
      "Not provided";
    const editedValue = getEditedNestedFieldValue(parent, field);

    return (
      <FieldContainer label={label} required={required}>
        {isEditing ? (
          <TextInput
            value={editedValue}
            onChange={(val) => onNestedInputChange(parent, field, val)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <DisplayField value={value} />
        )}
      </FieldContainer>
    );
  };

  // Select field renderer
  const renderSelectField = (
    label: string,
    field: keyof ExtendedUser,
    options: string[],
    required: boolean = false
  ) => {
    const value = getFieldValue(field);
    const editedValue = getEditedFieldValue(field);

    return (
      <FieldContainer label={label} required={required}>
        {isEditing ? (
          <SelectInput
            value={editedValue}
            onChange={(val) => onInputChange(field as string, val)}
            options={options}
            placeholder={`Select ${label.toLowerCase()}`}
          />
        ) : (
          <DisplayField value={value} />
        )}
      </FieldContainer>
    );
  };

  // Special date field renderer
  const renderDateField = (
    label: string,
    field: keyof ExtendedUser,
    required: boolean = false
  ) => {
    const rawValue = getFieldValue(field);
    const displayValue =
      rawValue && rawValue !== "Not provided"
        ? new Date(rawValue).toLocaleDateString()
        : "Not provided";
    const editedValue = getEditedFieldValue(field);

    return (
      <FieldContainer label={label} required={required}>
        {isEditing ? (
          <TextInput
            value={editedValue}
            onChange={(val) => onInputChange(field as string, val)}
            placeholder={`Enter ${label.toLowerCase()}`}
            type="date"
          />
        ) : (
          <DisplayField value={displayValue} />
        )}
      </FieldContainer>
    );
  };

  // Special gender field with nested handling
  const renderGenderField = () => {
    const value =
      (profile.profile?.gender as string) ||
      (profile.gender as string) ||
      "Not provided";
    const editedValue =
      getEditedNestedFieldValue("profile", "gender") ||
      getEditedFieldValue("gender");

    return (
      <FieldContainer label="Gender">
        {isEditing ? (
          <SelectInput
            value={editedValue}
            onChange={(val) => onNestedInputChange("profile", "gender", val)}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
          />
        ) : (
          <DisplayField value={value} />
        )}
      </FieldContainer>
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
          <p className="text-gray-600 mt-1">
            Personal details and identification
          </p>
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
          {renderNestedField("Last Name", "profile", "last_name", true)}
          {renderNestedField("First Name", "profile", "first_name", true)}
          {renderNestedField("Middle Name", "profile", "middle_name")}
          {renderNestedField("Suffix", "profile", "suffix")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderField("Nationality", "nationality")}
          {renderGenderField()}
          {renderSelectField(
            "Civil Status",
            "civil_status",
            CIVIL_STATUS_OPTIONS
          )}
        </div>

        {/* Basic Information Fields - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderDateField("Birth Date", "date_of_birth")}
          {renderField("Birth Place", "birth_place")}
          {renderSelectField("Blood Type", "blood_type", BLOOD_TYPE_OPTIONS)}
          {renderField("Religion", "religion")}
        </div>
      </div>
    </div>
  );
}
