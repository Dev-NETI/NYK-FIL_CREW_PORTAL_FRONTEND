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
} from "@mui/material";

interface ContactInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
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
  const [loadingGeography, setLoadingGeography] = useState(false);

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

  // Helper function to get display text for geography fields
  const getGeographyDisplayText = (
    code: string | undefined,
    options: { code: string; desc: string }[]
  ) => {
    if (!code) return "Not provided";
    const item = options.find((option) => option.code === code);
    return item ? item.desc : code;
  };

  // Function to save addresses and update user contacts
  const handleSaveAddresses = async () => {
    let permanentAddressId: number | undefined;

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
          // Directly update the profile's permanent_address_id
          if (editedProfile) {
            editedProfile.contacts = {
              ...editedProfile.contacts,
              permanent_address_id: permanentAddressId,
              current_address_id: permanentAddressId, // Set both to the same address
            };
          }
        }
      } catch (error) {
        throw error;
      }
    }

    // Also call the onAddressSave callback if it exists (for additional processing)
    if (onAddressSave && permanentAddressId) {
      try {
        await onAddressSave(permanentAddressId, permanentAddressId);
      } catch (error) {}
    }

    return { permanentAddressId };
  };

  // Render geography select field with Material UI
  const renderGeographyField = (
    label: string,
    field: string,
    options: { code: string; desc: string }[],
    value: string | undefined,
    placeholder: string,
    required: boolean = false,
    loading: boolean = false
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
            disabled={loading}
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
    type: string = "text"
  ) => {
    return (
      <Box>
        {isEditing ? (
          <TextField
            label={label}
            type={type}
            value={(editedProfile?.[field as keyof User] as string) || ""}
            onChange={(e) => onInputChange(field, e.target.value)}
            required={required}
            variant="outlined"
            fullWidth
            placeholder={`Enter ${label.toLowerCase()}`}
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
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
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

      {/* Contact Information Section */}
      <div className="bg-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box>
              {isEditing ? (
                <TextField
                  label="Email Address"
                  type="email"
                  value={editedProfile?.email || ""}
                  onChange={(e) => onInputChange("email", e.target.value)}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter email address"
                />
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Email Address
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
                      {profile.email}
                      {profile.email_verified_at && (
                        <Typography
                          component="span"
                          sx={{ ml: 1, color: "green", fontSize: "0.875rem" }}
                        >
                          ✓ Verified
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={12}>
            {renderField(
              "Mobile No.",
              profile.contacts?.mobile_number ||
                (profile as any).mobile_number ||
                "Not provided",
              "mobile_number",
              false,
              "tel"
            )}
          </Grid>

          <Grid size={12}>
            {renderField(
              "Emergency Contact Number",
              profile.emergency_contact_number || "Not provided",
              "emergency_contact_number",
              false,
              "tel"
            )}
          </Grid>

          <Grid size={12}>
            {renderField(
              "Emergency Contact Relation",
              profile.emergency_contact_relation || "Not provided",
              "emergency_contact_relation"
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
