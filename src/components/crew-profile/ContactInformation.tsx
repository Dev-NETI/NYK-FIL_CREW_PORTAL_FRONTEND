"use client";

import { User, Region, Province, City, Barangay } from "@/types/api";
import { GeographyService, AddressService } from "@/services";
import { AuthService } from "@/services/auth";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

interface ContactInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
  onAddressSave?: (
    permanentAddressId?: number,
    contactAddressId?: number
  ) => Promise<void> | void;
  validationErrors?: Record<string, string[]>;
}

export default function ContactInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
  onAddressSave,
  validationErrors = {},
}: ContactInformationProps) {
  // Use validation hook for cleaner validation logic
  const { getValidationError, hasValidationError } = useValidation({
    validationErrors,
  });
  // Geography data state
  const [regions, setRegions] = useState<Region[]>([]);
  const [permanentProvinces, setPermanentProvinces] = useState<Province[]>([]);
  const [permanentCities, setPermanentCities] = useState<City[]>([]);
  const [permanentBarangays, setPermanentBarangays] = useState<Barangay[]>([]);
  const [currentProvinces, setCurrentProvinces] = useState<Province[]>([]);
  const [currentCities, setCurrentCities] = useState<City[]>([]);
  const [currentBarangays, setCurrentBarangays] = useState<Barangay[]>([]);
  const [loadingGeography, setLoadingGeography] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoadingGeography(true);
        const response = await GeographyService.getRegions();
        if (response.success) {
          setRegions(response.data);
        }
      } catch (error) {
        console.error("Error loading regions:", error);
      } finally {
        setLoadingGeography(false);
      }
    };

    loadRegions();
  }, []);

  // Clear geography arrays when not editing to avoid stale data
  useEffect(() => {
    if (!isEditing) {
      setPermanentProvinces([]);
      setPermanentCities([]);
      setPermanentBarangays([]);
      setCurrentProvinces([]);
      setCurrentCities([]);
      setCurrentBarangays([]);
    }
  }, [isEditing]);

  // Load provinces when permanent region changes
  useEffect(() => {
    const loadPermanentProvinces = async () => {
      const regionCode =
        editedProfile?.permanent_region || profile.permanent_region;

      if (regionCode) {
        try {
          const response = await GeographyService.getProvincesByRegion(
            regionCode
          );

          if (response.success) {
            setPermanentProvinces(response.data);
            // Reset dependent dropdowns when region changes
            setPermanentCities([]);
            setPermanentBarangays([]);
            // Clear dependent fields in editedProfile
            if (editedProfile) {
              onInputChange("permanent_province", "");
              onInputChange("permanent_city", "");
              onInputChange("permanent_barangay", "");
            }
          }
        } catch (error) {
          console.error("Error loading permanent provinces:", error);
        }
      } else {
        setPermanentProvinces([]);
        setPermanentCities([]);
        setPermanentBarangays([]);
      }
    };

    loadPermanentProvinces();
  }, [editedProfile?.permanent_region, profile.permanent_region]);

  // Load cities when permanent province changes
  useEffect(() => {
    const loadPermanentCities = async () => {
      const provinceCode =
        editedProfile?.permanent_province || profile.permanent_province;

      if (provinceCode) {
        try {
          const response = await GeographyService.getCitiesByProvince(
            provinceCode
          );

          if (response.success) {
            setPermanentCities(response.data);
            // Reset dependent dropdowns when province changes
            setPermanentBarangays([]);
            // Clear dependent fields in editedProfile
            if (editedProfile) {
              onInputChange("permanent_city", "");
              onInputChange("permanent_barangay", "");
            }
          }
        } catch (error) {
          console.error("Error loading permanent cities:", error);
        }
      } else {
        setPermanentCities([]);
        setPermanentBarangays([]);
      }
    };

    loadPermanentCities();
  }, [editedProfile?.permanent_province, profile.permanent_province]);

  // Load barangays when permanent city changes
  useEffect(() => {
    const loadPermanentBarangays = async () => {
      const cityCode = editedProfile?.permanent_city || profile.permanent_city;

      if (cityCode) {
        try {
          const response = await GeographyService.getBarangaysByCity(cityCode);

          if (response.success) {
            setPermanentBarangays(response.data);
            // Clear dependent fields in editedProfile
            if (editedProfile) {
              onInputChange("permanent_barangay", "");
            }
          }
        } catch (error) {
          console.error("Error loading permanent barangays:", error);
        }
      } else {
        setPermanentBarangays([]);
      }
    };

    loadPermanentBarangays();
  }, [editedProfile?.permanent_city, profile.permanent_city]);

  // Load provinces when current region changes
  useEffect(() => {
    const loadCurrentProvinces = async () => {
      const regionCode =
        editedProfile?.current_region || profile.current_region;
      if (regionCode && !sameAsPermanent) {
        try {
          const response = await GeographyService.getProvincesByRegion(
            regionCode
          );
          if (response.success) {
            setCurrentProvinces(response.data);
          }
        } catch (error) {
          console.error("Error loading current provinces:", error);
        }
      } else {
        setCurrentProvinces([]);
        setCurrentCities([]);
        setCurrentBarangays([]);
      }
    };

    loadCurrentProvinces();
  }, [editedProfile?.current_region, profile.current_region, sameAsPermanent]);

  // Load cities when current province changes
  useEffect(() => {
    const loadCurrentCities = async () => {
      const provinceCode =
        editedProfile?.current_province || profile.current_province;
      if (provinceCode && !sameAsPermanent) {
        try {
          const response = await GeographyService.getCitiesByProvince(
            provinceCode
          );
          if (response.success) {
            setCurrentCities(response.data);
          }
        } catch (error) {
          console.error("Error loading current cities:", error);
        }
      } else {
        setCurrentCities([]);
        setCurrentBarangays([]);
      }
    };

    loadCurrentCities();
  }, [
    editedProfile?.current_province,
    profile.current_province,
    sameAsPermanent,
  ]);

  // Load barangays when current city changes
  useEffect(() => {
    const loadCurrentBarangays = async () => {
      const cityCode = editedProfile?.current_city || profile.current_city;
      if (cityCode && !sameAsPermanent) {
        try {
          const response = await GeographyService.getBarangaysByCity(cityCode);
          if (response.success) {
            setCurrentBarangays(response.data);
          }
        } catch (error) {
          console.error("Error loading current barangays:", error);
        }
      } else {
        setCurrentBarangays([]);
      }
    };

    loadCurrentBarangays();
  }, [editedProfile?.current_city, profile.current_city, sameAsPermanent]);

  // Helper function to get display text for geography fields
  const getGeographyDisplayText = (
    code: string | undefined,
    options: { code: string; desc: string }[]
  ) => {
    if (!code) return "Not provided";
    const item = options.find((option) => option.code === code);
    return item ? item.desc : code;
  };

  // Helper function to get geography description by code
  const getGeographyDesc = (
    code: string | undefined,
    options: { code: string; desc: string }[]
  ): string | undefined => {
    if (!code) return undefined;
    const item = options.find((option) => option.code === code);
    return item?.desc;
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

  // Handle "same as permanent address" checkbox
  const handleSameAsPermanentChange = (checked: boolean) => {
    setSameAsPermanent(checked);

    if (checked && editedProfile) {
      // Copy permanent address to current address
      onInputChange("current_region", editedProfile.permanent_region || "");
      onInputChange("current_province", editedProfile.permanent_province || "");
      onInputChange("current_city", editedProfile.permanent_city || "");
      onInputChange("current_barangay", editedProfile.permanent_barangay || "");
      onInputChange("current_street", editedProfile.permanent_street || "");
      onInputChange(
        "current_postal_code",
        editedProfile.permanent_postal_code || ""
      );
    } else if (!checked && editedProfile) {
      // Clear current address fields
      onInputChange("current_region", "");
      onInputChange("current_province", "");
      onInputChange("current_city", "");
      onInputChange("current_barangay", "");
      onInputChange("current_street", "");
      onInputChange("current_postal_code", "");
    }
  };

  // Function to save addresses and update user contacts
  const handleSaveAddresses = async () => {
    let permanentAddressId: number | undefined;
    let currentAddressId: number | undefined;

    // Save permanent address if we have the required data
    const permRegion =
      editedProfile?.permanent_region || profile.permanent_region;
    const permProvince =
      editedProfile?.permanent_province || profile.permanent_province;
    const permCity = editedProfile?.permanent_city || profile.permanent_city;
    const permBarangay =
      editedProfile?.permanent_barangay || profile.permanent_barangay;

    if (permRegion && permProvince && permCity && permBarangay) {
      try {
        const addressData = {
          user_id: profile.id,
          street_address:
            editedProfile?.permanent_street || profile.permanent_street || "",
          region_code: permRegion,
          province_code: permProvince,
          city_code: permCity,
          barangay_code: permBarangay,
          zip_code:
            editedProfile?.permanent_postal_code ||
            profile.permanent_postal_code ||
            "",
          type: "permanent" as const,
          // Add descriptive names for full address generation
          region_desc: getGeographyDesc(
            permRegion,
            regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc }))
          ),
          province_desc: getGeographyDesc(
            permProvince,
            permanentProvinces.map((p) => ({
              code: p.prov_code,
              desc: p.prov_desc,
            }))
          ),
          city_desc: getGeographyDesc(
            permCity,
            permanentCities.map((c) => ({
              code: c.citymun_code,
              desc: c.citymun_desc,
            }))
          ),
          barangay_desc: getGeographyDesc(
            permBarangay,
            permanentBarangays.map((b) => ({
              code: b.brgy_code,
              desc: b.brgy_desc,
            }))
          ),
        };

        const response = await AddressService.createOrUpdateFromGeography(
          addressData,
          profile.contacts?.permanent_address_id
        );

        if (response.success) {
          permanentAddressId = response.data.id;
        }
      } catch (error) {
        throw error;
      }
    }

    // Save current address - always create separate record
    let currRegion,
      currProvince,
      currCity,
      currBarangay,
      currStreet,
      currPostalCode;

    if (sameAsPermanent) {
      // Use permanent address data but create a separate record
      currRegion = permRegion;
      currProvince = permProvince;
      currCity = permCity;
      currBarangay = permBarangay;
      currStreet =
        editedProfile?.permanent_street || profile.permanent_street || "";
      currPostalCode =
        editedProfile?.permanent_postal_code ||
        profile.permanent_postal_code ||
        "";
    } else {
      // Use current address data
      currRegion = editedProfile?.current_region || profile.current_region;
      currProvince =
        editedProfile?.current_province || profile.current_province;
      currCity = editedProfile?.current_city || profile.current_city;
      currBarangay =
        editedProfile?.current_barangay || profile.current_barangay;
      currStreet =
        editedProfile?.current_street || profile.current_street || "";
      currPostalCode =
        editedProfile?.current_postal_code || profile.current_postal_code || "";
    }

    // Always create/update a separate current address record
    if (currRegion && currProvince && currCity && currBarangay) {
      try {
        const currentAddressData = {
          user_id: profile.id,
          street_address: currStreet,
          region_code: currRegion,
          province_code: currProvince,
          city_code: currCity,
          barangay_code: currBarangay,
          zip_code: currPostalCode,
          type: "current" as const,
          // Add descriptive names for full address generation
          region_desc: getGeographyDesc(
            currRegion,
            regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc }))
          ),
          province_desc: getGeographyDesc(
            currProvince,
            sameAsPermanent
              ? permanentProvinces.map((p) => ({
                  code: p.prov_code,
                  desc: p.prov_desc,
                }))
              : currentProvinces.map((p) => ({
                  code: p.prov_code,
                  desc: p.prov_desc,
                }))
          ),
          city_desc: getGeographyDesc(
            currCity,
            sameAsPermanent
              ? permanentCities.map((c) => ({
                  code: c.citymun_code,
                  desc: c.citymun_desc,
                }))
              : currentCities.map((c) => ({
                  code: c.citymun_code,
                  desc: c.citymun_desc,
                }))
          ),
          barangay_desc: getGeographyDesc(
            currBarangay,
            sameAsPermanent
              ? permanentBarangays.map((b) => ({
                  code: b.brgy_code,
                  desc: b.brgy_desc,
                }))
              : currentBarangays.map((b) => ({
                  code: b.brgy_code,
                  desc: b.brgy_desc,
                }))
          ),
        };

        const currentResponse =
          await AddressService.createOrUpdateFromGeography(
            currentAddressData,
            sameAsPermanent ? undefined : profile.contacts?.current_address_id
          );

        if (currentResponse.success) {
          currentAddressId = currentResponse.data.id;
        }
      } catch (error) {
        throw error;
      }
    }

    // Update the profile with address IDs - always use separate IDs
    if (editedProfile) {
      editedProfile.contacts = {
        ...editedProfile.contacts,
        permanent_address_id: permanentAddressId,
        current_address_id: currentAddressId,
      };
    }

    // Also call the onAddressSave callback if it exists (for additional processing)
    if (onAddressSave && (permanentAddressId || currentAddressId)) {
      try {
        await onAddressSave(permanentAddressId, currentAddressId);
      } catch (error) {}
    }

    return { permanentAddressId, currentAddressId };
  };

  // Render geography select field with Material UI
  const renderGeographyField = (
    label: string,
    field: string,
    options: { code: string; desc: string }[],
    value: string | undefined,
    placeholder: string,
    required: boolean = false,
    loading: boolean = false,
    disabled: boolean = false
  ) => {
    const currentOption =
      options.find((option) => option.code === value) || null;

    return (
      <Box>
        {isEditing ? (
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.desc}
            value={currentOption}
            onChange={(_, newValue) => {
              onInputChange(field, newValue?.code || "");
            }}
            loading={loading}
            disabled={loading || disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                required={required}
                variant="outlined"
                fullWidth
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box component="li" key={key} {...otherProps}>
                  {option.desc}
                </Box>
              );
            }}
            noOptionsText={loading ? "Loading..." : "No options"}
          />
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              {label} {required && <span style={{ color: "red" }}>*</span>}
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                minHeight: "56px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                color={value ? "text.primary" : "text.secondary"}
              >
                {getGeographyDisplayText(value, options) || "Not provided"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  };
  const renderField = (
    label: string,
    value: string,
    field: string,
    required: boolean = false,
    type: string = "text",
    disabled: boolean = false
  ) => {
    // Handle contact fields that are nested in the contacts object
    const contactFields = [
      "mobile_number",
      "alternate_phone",
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",
    ];

    const getFieldValue = () => {
      if (contactFields.includes(field)) {
        return (
          (editedProfile?.contacts?.[
            field as keyof typeof editedProfile.contacts
          ] as string) || ""
        );
      }
      return (editedProfile?.[field as keyof User] as string) || "";
    };

    // Get validation error path - contact fields have contacts. prefix
    const validationField = contactFields.includes(field)
      ? `contacts.${field}`
      : field;

    return (
      <Box>
        {isEditing ? (
          <div>
            <TextField
              label={label}
              type={type}
              value={getFieldValue()}
              onChange={(e) => onInputChange(field, e.target.value)}
              required={required}
              variant="outlined"
              fullWidth
              placeholder={`Enter ${label.toLowerCase()}`}
              disabled={disabled}
              error={hasValidationError(validationField)}
            />
            <ValidationError errors={getValidationError(validationField)} />
          </div>
        ) : (
          <DisplayField
            label={label + (required ? " *" : "")}
            value={value !== "Not provided" ? value : undefined}
          />
        )}
      </Box>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-6 border-b border-gray-200 space-y-3 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <i className="bi bi-geo-alt text-blue-600 mr-2 sm:mr-3 text-lg sm:text-xl"></i>
            <span className="leading-tight">Contact Information</span>
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Address details and contact methods
          </p>
        </div>

        {/* Edit Controls - Mobile App Style */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium text-base flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation active:scale-[0.98] ${
                canEdit
                  ? "hover:bg-green-700 active:bg-green-800 shadow-sm active:shadow-none"
                  : "opacity-50 cursor-not-allowed"
              }`}
              title={
                !canEdit ? "You don't have permission to edit this section" : ""
              }
            >
              <i className="bi bi-pencil text-base"></i>
              <span>Edit Contact</span>
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
                onClick={async () => {
                  try {
                    // Check user role to determine save behavior
                    const currentUser = AuthService.getStoredUser();
                    const isAdmin = currentUser?.is_crew === 0;

                    if (isAdmin) {
                      // Admin can save addresses directly
                      const addressResult = await handleSaveAddresses();

                      // Call onSave to save other profile changes
                      onSave();

                      // Log success with address ID for debugging
                      console.log("Address saved successfully:", {
                        permanentAddressId: addressResult.permanentAddressId,
                        currentAddressId: addressResult.currentAddressId,
                      });
                    } else {
                      // Crew member: All changes go through pre-approval system
                      // Don't save addresses directly, let the main profile page handle the approval workflow
                      onSave();
                    }
                  } catch (error) {
                    // Address saving failed (for admin) or approval submission failed (for crew)
                    console.error("Save operation failed:", error);
                    const errorMessage =
                      AuthService.getStoredUser()?.is_crew === 0
                        ? "Failed to save address information"
                        : "Failed to submit update request";
                    toast.error(errorMessage);
                  }
                }}
                disabled={saving}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl transition-all duration-200 font-medium text-base flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation active:scale-[0.98] shadow-sm active:shadow-none"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin text-base"></i>
                    <span>
                      {(() => {
                        const currentUser = AuthService.getStoredUser();
                        const isAdmin = currentUser?.is_crew === 0;
                        return isAdmin ? "Saving..." : "Submitting...";
                      })()}
                    </span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg text-base"></i>
                    <span>
                      {(() => {
                        const currentUser = AuthService.getStoredUser();
                        const isAdmin = currentUser?.is_crew === 0;
                        return isAdmin ? "Save" : "Submit for Approval";
                      })()}
                    </span>
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
        <Grid container spacing={3}>
          {isEditing ? (
            <>
              <Grid size={12}>
                {renderGeographyField(
                  "Region",
                  "permanent_region",
                  regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc })),
                  editedProfile?.permanent_region || profile.permanent_region,
                  "Select region",
                  false,
                  loadingGeography
                )}
              </Grid>
              <Grid size={12}>
                {renderGeographyField(
                  "Province",
                  "permanent_province",
                  permanentProvinces.map((p) => ({
                    code: p.prov_code,
                    desc: p.prov_desc,
                  })),
                  editedProfile?.permanent_province ||
                    profile.permanent_province,
                  "Select province",
                  false,
                  false
                )}
              </Grid>

              <Grid size={12}>
                {renderGeographyField(
                  "City/Municipality",
                  "permanent_city",
                  permanentCities.map((c) => ({
                    code: c.citymun_code,
                    desc: c.citymun_desc,
                  })),
                  editedProfile?.permanent_city || profile.permanent_city,
                  "Select city/municipality",
                  false,
                  false
                )}
              </Grid>

              <Grid size={12}>
                {renderGeographyField(
                  "Subdivision/Barangay",
                  "permanent_barangay",
                  permanentBarangays.map((b) => ({
                    code: b.brgy_code,
                    desc: b.brgy_desc,
                  })),
                  editedProfile?.permanent_barangay ||
                    profile.permanent_barangay,
                  "Select barangay",
                  false,
                  false
                )}
              </Grid>

              <Grid size={12}>
                <div>
                  <TextField
                    label="Building Name, Floor, Unit Number, Street Name"
                    value={editedProfile?.permanent_street || ""}
                    onChange={(e) =>
                      onInputChange("permanent_street", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter complete address"
                    error={hasValidationError("permanent_street")}
                  />
                  <ValidationError
                    errors={getValidationError("permanent_street")}
                  />
                </div>
              </Grid>

              <Grid size={12}>
                {renderField(
                  "Postal Code",
                  profile.permanent_address?.zip_code || "Not provided",
                  "permanent_postal_code"
                )}
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Full Address
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                    minHeight: "80px",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="body1"
                    color={
                      profile?.permanent_address?.full_address
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {profile?.permanent_address?.full_address || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </div>

      {/* Current Address Section */}
      <div className="bg-green-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Address
        </h3>

        {isEditing && (
          <div className="mb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsPermanent}
                  onChange={(e) =>
                    handleSameAsPermanentChange(e.target.checked)
                  }
                  color="primary"
                />
              }
              label="Same as permanent address"
            />
          </div>
        )}

        <Grid container spacing={3}>
          {isEditing ? (
            <>
              <Grid size={12}>
                {renderGeographyField(
                  "Region",
                  "current_region",
                  regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc })),
                  editedProfile?.current_region || profile.current_region,
                  "Select region",
                  false,
                  loadingGeography,
                  sameAsPermanent
                )}
              </Grid>
              <Grid size={12}>
                {renderGeographyField(
                  "Province",
                  "current_province",
                  currentProvinces.map((p) => ({
                    code: p.prov_code,
                    desc: p.prov_desc,
                  })),
                  editedProfile?.current_province || profile.current_province,
                  "Select province",
                  false,
                  false,
                  sameAsPermanent
                )}
              </Grid>

              <Grid size={12}>
                {renderGeographyField(
                  "City/Municipality",
                  "current_city",
                  currentCities.map((c) => ({
                    code: c.citymun_code,
                    desc: c.citymun_desc,
                  })),
                  editedProfile?.current_city || profile.current_city,
                  "Select city/municipality",
                  false,
                  false,
                  sameAsPermanent
                )}
              </Grid>

              <Grid size={12}>
                {renderGeographyField(
                  "Subdivision/Barangay",
                  "current_barangay",
                  currentBarangays.map((b) => ({
                    code: b.brgy_code,
                    desc: b.brgy_desc,
                  })),
                  editedProfile?.current_barangay || profile.current_barangay,
                  "Select barangay",
                  false,
                  false,
                  sameAsPermanent
                )}
              </Grid>

              <Grid size={12}>
                <div>
                  <TextField
                    label="Building Name, Floor, Unit Number, Street Name"
                    value={editedProfile?.current_street || ""}
                    onChange={(e) =>
                      onInputChange("current_street", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter complete address"
                    disabled={sameAsPermanent}
                    error={hasValidationError("current_street")}
                  />
                  <ValidationError
                    errors={getValidationError("current_street")}
                  />
                </div>
              </Grid>

              <Grid size={12}>
                {renderField(
                  "Postal Code",
                  profile.current_address?.zip_code || "Not provided",
                  "current_postal_code",
                  false,
                  "text",
                  sameAsPermanent
                )}
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Full Address
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                    minHeight: "80px",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="body1"
                    color={
                      profile?.current_address?.full_address
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {profile?.current_address?.full_address || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </div>

      {/* My Contact Section */}
      <div className="bg-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          My Contact Information
        </h3>
        <Grid container spacing={3}>
          <Grid size={6}>
            {renderField(
              "Emergency Contact Number No.",
              profile.contacts?.mobile_number ||
                (profile as any).mobile_number ||
                "Not provided",
              "mobile_number",
              false,
              "tel"
            )}
          </Grid>
          <Grid size={6}>
            {renderField(
              "Alternate Mobile No.",
              profile.contacts?.alternate_phone ||
                (profile as any).alternate_phone ||
                "Not provided",
              "alternate_phone",
              false,
              "tel"
            )}
          </Grid>
        </Grid>
      </div>

      {/* Contact Information Section */}
      <div className="bg-red-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Emergency
        </h3>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box>
              {isEditing ? (
                <div>
                  <TextField
                    label="Emergency Contact Name"
                    type="text"
                    value={
                      editedProfile?.contacts?.emergency_contact_name || ""
                    }
                    onChange={(e) =>
                      onInputChange("emergency_contact_name", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                    placeholder="Enter emergency contact name"
                    error={hasValidationError(
                      "contacts.emergency_contact_name"
                    )}
                  />
                  <ValidationError
                    errors={getValidationError(
                      "contacts.emergency_contact_name"
                    )}
                  />
                </div>
              ) : (
                <DisplayField
                  label="Emergency Contact Name"
                  value={profile.contacts?.emergency_contact_name}
                />
              )}
            </Box>
          </Grid>

          <Grid size={12}>
            {renderField(
              "Emergency Contact Number No.",
              profile.contacts?.emergency_contact_phone ||
                (profile as any).emergency_contact_phone ||
                "Not provided",
              "emergency_contact_phone",
              false,
              "tel"
            )}
          </Grid>

          <Grid size={12}>
            {renderField(
              "Emergency Contact Relation",
              profile.contacts?.emergency_contact_relationship ||
                "Not provided",
              "emergency_contact_relationship"
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
