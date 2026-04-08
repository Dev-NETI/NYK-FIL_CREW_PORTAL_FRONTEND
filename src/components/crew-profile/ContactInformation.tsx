"use client";

import React from "react";
import { User, Region, Province, City, Barangay } from "@/types/api";
import { GeographyService, AddressService } from "@/services";
import { AuthService } from "@/services/auth";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  TextField,
  Autocomplete,
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
  // Track if we're initializing edit mode to prevent clearing existing data
  const [isInitializing, setIsInitializing] = useState(false);

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
      setIsInitializing(false);
    } else {
      setIsInitializing(true);
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

  // Reset initialization flag after all geography data is loaded
  useEffect(() => {
    if (isInitializing && isEditing) {
      const hasRegion =
        editedProfile?.permanent_region || profile.permanent_region;
      const hasProvince =
        editedProfile?.permanent_province || profile.permanent_province;
      const hasCity = editedProfile?.permanent_city || profile.permanent_city;

      // If we have all the geography data loaded that we need, stop initializing
      if (
        hasRegion &&
        permanentProvinces.length > 0 &&
        (!hasProvince || (hasProvince && permanentCities.length > 0)) &&
        (!hasCity || (hasCity && permanentBarangays.length > 0))
      ) {
        const timer = setTimeout(() => setIsInitializing(false), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [
    isInitializing,
    isEditing,
    permanentProvinces,
    permanentCities,
    permanentBarangays,
    editedProfile,
    profile,
  ]);

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

  // Save button content component for cleaner rendering
  const SaveButtonContent = ({ loading }: { loading: boolean }) => {
    const currentUser = AuthService.getStoredUser();
    const isAdmin = currentUser?.is_crew === false;

    if (loading) {
      return (
        <>
          <i className="bi bi-arrow-clockwise animate-spin text-base"></i>
          <span>{isAdmin ? "Saving..." : "Submitting..."}</span>
        </>
      );
    }

    return (
      <>
        <i className="bi bi-check-lg text-base"></i>
        <span>{isAdmin ? "Save Contact Info" : "Submit for Approval"}</span>
      </>
    );
  };

  // Handle save button click - supports both admin and crew workflows
  const handleSaveClick = async () => {
    try {
      const currentUser = AuthService.getStoredUser();
      const isAdmin = currentUser?.is_crew === false;

      if (isAdmin) {
        // ADMIN WORKFLOW: Save addresses directly to database
        console.log("Admin saving contact information directly...");
        await handleSaveAddresses();

        // Exit edit mode after successful save
        onSave();
      } else {
        // CREW WORKFLOW: Submit for approval via parent component
        console.log("Crew submitting contact information for approval...");
        onSave();
      }
    } catch (error) {
      console.error("Save operation failed:", error);

      // Show appropriate error message based on user role
      const currentUser = AuthService.getStoredUser();
      const isAdmin = currentUser?.is_crew === false;

      const errorMessage = isAdmin
        ? "Failed to save contact information. Please try again."
        : "Failed to submit update request. Please try again.";

      toast.error(errorMessage);
    }
  };

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

  /**
   * ADMIN ONLY: Save addresses directly to the database
   * This function handles permanent and current address creation/updates
   * and returns the address IDs for linking to the user's contact record
   */
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
        console.log("Saving permanent address with:", {
          permRegion,
          permProvince,
          permCity,
          permBarangay,
          existingId: profile.contacts?.permanent_address_id,
        });
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

        console.log("Sending address data:", addressData);
        const response = await AddressService.createOrUpdateFromGeography(
          addressData,
          profile.contacts?.permanent_address_id
        );
        console.log("Permanent address response:", response);

        if (response.success) {
          permanentAddressId = response.data.id;
          console.log("Permanent address saved with ID:", permanentAddressId);
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
        console.log("Saving current address with:", {
          currRegion,
          currProvince,
          currCity,
          currBarangay,
          existingId: profile.contacts?.current_address_id,
          sameAsPermanent,
        });
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

        console.log("Sending current address data:", currentAddressData);
        const currentResponse =
          await AddressService.createOrUpdateFromGeography(
            currentAddressData,
            sameAsPermanent ? undefined : profile.contacts?.current_address_id
          );
        console.log("Current address response:", currentResponse);

        if (currentResponse.success) {
          currentAddressId = currentResponse.data.id;
          console.log("Current address saved with ID:", currentAddressId);
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
      <div>
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
                <li key={key} {...otherProps}>
                  {option.desc}
                </li>
              );
            }}
            noOptionsText={loading ? "Loading..." : "No options"}
          />
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </p>
            <p className={`text-sm font-semibold px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 ${value ? "text-gray-800" : "text-gray-300"}`}>
              {getGeographyDisplayText(value, options) || "Not provided"}
            </p>
          </div>
        )}
      </div>
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
      <div>
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
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </p>
            <p className={`text-sm font-semibold px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 ${value && value !== "Not provided" ? "text-gray-800" : "text-gray-300"}`}>
              {value && value !== "Not provided" ? value : "Not specified"}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ── Reusable display row ──────────────────────────────────────────────────
  const ViewRow = ({
    icon,
    iconColor,
    label,
    value,
  }: {
    icon: string;
    iconColor: string;
    label: string;
    value: string | null | undefined;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <i className={`bi ${icon} ${iconColor} text-sm`}></i>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold leading-snug ${value ? "text-gray-800" : "text-gray-300"}`}>
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );

  // ── Section card wrapper ──────────────────────────────────────────────────
  const Card = ({
    icon,
    iconBg,
    iconColor,
    title,
    children,
  }: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`bi ${icon} ${iconColor} text-sm`}></i>
        </div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );

  // ── Edit section card ─────────────────────────────────────────────────────
  const EditCard = ({
    icon,
    iconBg,
    iconColor,
    title,
    children,
  }: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`bi ${icon} ${iconColor} text-sm`}></i>
        </div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <i className="bi bi-geo-alt-fill text-emerald-600"></i>
            Contact & Address
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Your addresses and contact details</p>
        </div>

        {!isEditing ? (
          <button
            onClick={onEdit}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              canEdit
                ? "bg-slate-900 text-white hover:bg-slate-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <i className="bi bi-pencil-fill text-xs"></i>
            Edit Contact
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
            >
              <i className="bi bi-x-lg text-xs"></i>
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {saving ? (
                <SaveButtonContent loading={true} />
              ) : (
                <SaveButtonContent loading={false} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════ VIEW MODE */}
      {!isEditing && (
        <div className="space-y-4">
          {/* My Contact Details */}
          <Card icon="bi-telephone-fill" iconBg="bg-blue-100" iconColor="text-blue-600" title="My Contact Details">
            <ViewRow icon="bi-envelope-fill" iconColor="text-blue-500" label="Email Address" value={profile.email} />
            <ViewRow icon="bi-phone-fill" iconColor="text-emerald-500" label="Mobile Number" value={profile.contacts?.mobile_number || (profile as any).mobile_number} />
            <ViewRow icon="bi-telephone" iconColor="text-teal-500" label="Alternate Number" value={profile.contacts?.alternate_phone || (profile as any).alternate_phone} />
          </Card>

          {/* Permanent Address */}
          <Card icon="bi-house-fill" iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Permanent / Mailing Address">
            <div className="py-4">
              {profile.permanent_address?.full_address ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="bi bi-geo-alt-fill text-indigo-600 text-sm"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {profile.permanent_address.full_address}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-300 font-semibold">Not specified</p>
              )}
            </div>
          </Card>

          {/* Current Address */}
          <Card icon="bi-pin-map-fill" iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Current Address">
            <div className="py-4">
              {profile.current_address?.full_address ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="bi bi-geo-alt-fill text-emerald-600 text-sm"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {profile.current_address.full_address}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-300 font-semibold">Not specified</p>
              )}
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card icon="bi-exclamation-triangle-fill" iconBg="bg-red-100" iconColor="text-red-600" title="Emergency Contact">
            <ViewRow icon="bi-person-fill" iconColor="text-red-500" label="Contact Name" value={profile.contacts?.emergency_contact_name} />
            <ViewRow icon="bi-telephone-fill" iconColor="text-orange-500" label="Contact Number" value={profile.contacts?.emergency_contact_phone || (profile as any).emergency_contact_phone} />
            <ViewRow icon="bi-people-fill" iconColor="text-amber-500" label="Relationship" value={profile.contacts?.emergency_contact_relationship} />
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════ EDIT MODE */}
      {isEditing && (
        <div className="space-y-5">
          {/* My Contact Details */}
          <EditCard icon="bi-telephone-fill" iconBg="bg-blue-100" iconColor="text-blue-600" title="My Contact Details">
            <Grid container spacing={2}>
              <Grid size={6}>
                {renderField("Mobile Number", profile.contacts?.mobile_number || (profile as any).mobile_number || "Not provided", "mobile_number", false, "tel")}
              </Grid>
              <Grid size={6}>
                {renderField("Alternate Number", profile.contacts?.alternate_phone || (profile as any).alternate_phone || "Not provided", "alternate_phone", false, "tel")}
              </Grid>
              <Grid size={12}>
                {renderField("Email Address", profile.email || "Not provided", "email", false, "email")}
              </Grid>
            </Grid>
          </EditCard>

          {/* Permanent Address */}
          <EditCard icon="bi-house-fill" iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Permanent / Mailing Address">
            <Grid container spacing={2}>
              <Grid size={12}>
                {renderGeographyField("Region", "permanent_region", regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc })), editedProfile?.permanent_region || profile.permanent_region, "Select region", false, loadingGeography)}
              </Grid>
              <Grid size={12}>
                {renderGeographyField("Province", "permanent_province", permanentProvinces.map((p) => ({ code: p.prov_code, desc: p.prov_desc })), editedProfile?.permanent_province || profile.permanent_province, "Select province", false, false)}
              </Grid>
              <Grid size={12}>
                {renderGeographyField("City / Municipality", "permanent_city", permanentCities.map((c) => ({ code: c.citymun_code, desc: c.citymun_desc })), editedProfile?.permanent_city || profile.permanent_city, "Select city/municipality", false, false)}
              </Grid>
              <Grid size={12}>
                {renderGeographyField("Barangay", "permanent_barangay", permanentBarangays.map((b) => ({ code: b.brgy_code, desc: b.brgy_desc })), editedProfile?.permanent_barangay || profile.permanent_barangay, "Select barangay", false, false)}
              </Grid>
              <Grid size={12}>
                <div>
                  <TextField
                    label="Street / Building / Unit"
                    value={editedProfile?.permanent_street || ""}
                    onChange={(e) => onInputChange("permanent_street", e.target.value)}
                    variant="outlined" fullWidth multiline rows={2}
                    placeholder="Building name, floor, unit number, street name"
                    error={hasValidationError("permanent_street")}
                  />
                  <ValidationError errors={getValidationError("permanent_street")} />
                </div>
              </Grid>
              <Grid size={12}>
                {renderField("Postal Code", profile.permanent_address?.zip_code || "Not provided", "permanent_postal_code")}
              </Grid>
            </Grid>
          </EditCard>

          {/* Current Address */}
          <EditCard icon="bi-pin-map-fill" iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Current Address">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <FormControlLabel
                control={<Checkbox checked={sameAsPermanent} onChange={(e) => handleSameAsPermanentChange(e.target.checked)} color="primary" size="small" />}
                label={<span className="text-sm font-semibold text-emerald-800">Same as permanent address</span>}
              />
            </div>
            {!sameAsPermanent && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  {renderGeographyField("Region", "current_region", regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc })), editedProfile?.current_region || profile.current_region, "Select region", false, loadingGeography, false)}
                </Grid>
                <Grid size={12}>
                  {renderGeographyField("Province", "current_province", currentProvinces.map((p) => ({ code: p.prov_code, desc: p.prov_desc })), editedProfile?.current_province || profile.current_province, "Select province", false, false, false)}
                </Grid>
                <Grid size={12}>
                  {renderGeographyField("City / Municipality", "current_city", currentCities.map((c) => ({ code: c.citymun_code, desc: c.citymun_desc })), editedProfile?.current_city || profile.current_city, "Select city/municipality", false, false, false)}
                </Grid>
                <Grid size={12}>
                  {renderGeographyField("Barangay", "current_barangay", currentBarangays.map((b) => ({ code: b.brgy_code, desc: b.brgy_desc })), editedProfile?.current_barangay || profile.current_barangay, "Select barangay", false, false, false)}
                </Grid>
                <Grid size={12}>
                  <div>
                    <TextField
                      label="Street / Building / Unit"
                      value={editedProfile?.current_street || ""}
                      onChange={(e) => onInputChange("current_street", e.target.value)}
                      variant="outlined" fullWidth multiline rows={2}
                      placeholder="Building name, floor, unit number, street name"
                      error={hasValidationError("current_street")}
                    />
                    <ValidationError errors={getValidationError("current_street")} />
                  </div>
                </Grid>
                <Grid size={12}>
                  {renderField("Postal Code", profile.current_address?.zip_code || "Not provided", "current_postal_code")}
                </Grid>
              </Grid>
            )}
          </EditCard>

          {/* Emergency Contact */}
          <EditCard icon="bi-exclamation-triangle-fill" iconBg="bg-red-100" iconColor="text-red-600" title="Emergency Contact">
            <Grid container spacing={2}>
              <Grid size={12}>
                <div>
                  <TextField
                    label="Emergency Contact Name"
                    type="text"
                    value={editedProfile?.contacts?.emergency_contact_name || ""}
                    onChange={(e) => onInputChange("emergency_contact_name", e.target.value)}
                    variant="outlined" fullWidth
                    placeholder="Full name of emergency contact"
                    error={hasValidationError("contacts.emergency_contact_name")}
                  />
                  <ValidationError errors={getValidationError("contacts.emergency_contact_name")} />
                </div>
              </Grid>
              <Grid size={6}>
                {renderField("Contact Number", profile.contacts?.emergency_contact_phone || (profile as any).emergency_contact_phone || "Not provided", "emergency_contact_phone", false, "tel")}
              </Grid>
              <Grid size={6}>
                {renderField("Relationship", profile.contacts?.emergency_contact_relationship || "Not provided", "emergency_contact_relationship")}
              </Grid>
            </Grid>
          </EditCard>
        </div>
      )}
    </div>
  );
}
