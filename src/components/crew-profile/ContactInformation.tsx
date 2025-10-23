"use client";

import { User, Region, Province, City, Barangay } from "@/types/api";
import { GeographyService, AddressService } from "@/services";
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
}: ContactInformationProps) {
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

    // Save current address
    if (sameAsPermanent) {
      // Use the same address as permanent
      currentAddressId = permanentAddressId;
    } else {
      // Save separate current address if we have the required data
      const currRegion =
        editedProfile?.current_region || profile.current_region;
      const currProvince =
        editedProfile?.current_province || profile.current_province;
      const currCity = editedProfile?.current_city || profile.current_city;
      const currBarangay =
        editedProfile?.current_barangay || profile.current_barangay;

      if (currRegion && currProvince && currCity && currBarangay) {
        try {
          const currentAddressData = {
            user_id: profile.id,
            street_address:
              editedProfile?.current_street || profile.current_street || "",
            region_code: currRegion,
            province_code: currProvince,
            city_code: currCity,
            barangay_code: currBarangay,
            zip_code:
              editedProfile?.current_postal_code ||
              profile.current_postal_code ||
              "",
          };

          const currentResponse =
            await AddressService.createOrUpdateFromGeography(
              currentAddressData,
              profile.contacts?.current_address_id
            );

          if (currentResponse.success) {
            currentAddressId = currentResponse.data.id;
          }
        } catch (error) {
          throw error;
        }
      }
    }

    // Update the profile with address IDs
    if (editedProfile) {
      editedProfile.contacts = {
        ...editedProfile.contacts,
        permanent_address_id: permanentAddressId,
        current_address_id: sameAsPermanent
          ? permanentAddressId
          : currentAddressId,
      };
    }

    // Also call the onAddressSave callback if it exists (for additional processing)
    if (onAddressSave && (permanentAddressId || currentAddressId)) {
      try {
        await onAddressSave(
          permanentAddressId,
          sameAsPermanent ? permanentAddressId : currentAddressId
        );
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
      "email_personal",
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

    return (
      <Box>
        {isEditing ? (
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
                {value || "Not provided"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="bi bi-geo-alt text-blue-600 mr-3"></i>
            Contact Information
          </h2>
          <p className="text-gray-600 mt-1">
            Address details and contact methods
          </p>
        </div>

        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg flex items-center space-x-2 ${
                canEdit
                  ? "hover:from-green-700 hover:to-green-800 hover:shadow-xl"
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
                onClick={async () => {
                  try {
                    // Save addresses first to get the address IDs
                    const addressResult = await handleSaveAddresses();

                    // Call onSave to save other profile changes
                    onSave();

                    // Log success with address ID for debugging
                    console.log("Address saved successfully:", {
                      permanentAddressId: addressResult.permanentAddressId,
                      currentAddressId: addressResult.currentAddressId,
                    });

                    toast.success("Contact information saved successfully!");
                  } catch (error) {
                    // Address saving failed
                    console.error("Address saving failed:", error);
                    toast.error("Failed to save address information");
                  }
                }}
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
                />
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
                />
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

          <Grid size={12}>
            {renderField(
              "Personal Email Address",
              profile.contacts?.email_personal ||
                (profile as any).email_personal ||
                "Not provided",
              "email_personal"
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
                <TextField
                  label="Emergency Contact Name"
                  type="text"
                  value={editedProfile?.contacts?.emergency_contact_name || ""}
                  onChange={(e) =>
                    onInputChange("emergency_contact_name", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  placeholder="Enter emergency contact name"
                />
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Emergency Contact Name
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
                    <Typography variant="body1" color="text.primary">
                      {profile.contacts?.emergency_contact_name}
                    </Typography>
                  </Box>
                </Box>
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
