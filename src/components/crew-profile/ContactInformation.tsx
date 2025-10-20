"use client";

import { User, Region, Province, City, Barangay, Address } from "@/types/api";
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
  ) => void;
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
  const [contactProvinces, setContactProvinces] = useState<Province[]>([]);
  const [contactCities, setContactCities] = useState<City[]>([]);
  const [contactBarangays, setContactBarangays] = useState<Barangay[]>([]);
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

  // Load provinces when contact region changes
  useEffect(() => {
    const loadContactProvinces = async () => {
      const regionCode =
        editedProfile?.contact_region || profile.contact_region;
      if (regionCode) {
        try {
          const response = await GeographyService.getProvincesByRegion(
            regionCode
          );
          if (response.success) {
            setContactProvinces(response.data);
          }
        } catch (error) {
          console.error("Error loading contact provinces:", error);
        }
      } else {
        setContactProvinces([]);
        setContactCities([]);
        setContactBarangays([]);
      }
    };

    loadContactProvinces();
  }, [editedProfile?.contact_region, profile.contact_region]);

  // Load cities when contact province changes
  useEffect(() => {
    const loadContactCities = async () => {
      const provinceCode =
        editedProfile?.contact_province || profile.contact_province;
      if (provinceCode) {
        try {
          const response = await GeographyService.getCitiesByProvince(
            provinceCode
          );
          if (response.success) {
            setContactCities(response.data);
          }
        } catch (error) {
          console.error("Error loading contact cities:", error);
        }
      } else {
        setContactCities([]);
        setContactBarangays([]);
      }
    };

    loadContactCities();
  }, [editedProfile?.contact_province, profile.contact_province]);

  // Load barangays when contact city changes
  useEffect(() => {
    const loadContactBarangays = async () => {
      const cityCode = editedProfile?.contact_city || profile.contact_city;
      if (cityCode) {
        try {
          const response = await GeographyService.getBarangaysByCity(cityCode);
          if (response.success) {
            setContactBarangays(response.data);
          }
        } catch (error) {
          console.error("Error loading contact barangays:", error);
        }
      } else {
        setContactBarangays([]);
      }
    };

    loadContactBarangays();
  }, [editedProfile?.contact_city, profile.contact_city]);

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
  const handleSaveAddresses = async (): Promise<{
    permanentAddressId?: number;
    contactAddressId?: number;
  }> => {
    const promises: Promise<any>[] = [];
    let permanentAddressId: number | undefined;
    let contactAddressId: number | undefined;

    // Save permanent address if we have the required data
    const permRegion =
      editedProfile?.permanent_region || profile.permanent_region;
    const permProvince =
      editedProfile?.permanent_province || profile.permanent_province;
    const permCity = editedProfile?.permanent_city || profile.permanent_city;
    const permBarangay =
      editedProfile?.permanent_barangay || profile.permanent_barangay;

    if (permRegion && permProvince && permCity && permBarangay) {
      const permanentAddressPromise =
        AddressService.createOrUpdateFromGeography(
          {
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
          },
          profile.contacts?.permanent_address_id
        ).then((response) => {
          if (response.success) {
            permanentAddressId = response.data.id;
            return response;
          }
          throw new Error(
            response.message || "Failed to save permanent address"
          );
        });

      promises.push(permanentAddressPromise);
    }

    // Save contact address if we have the required data
    const contRegion = editedProfile?.contact_region || profile.contact_region;
    const contProvince =
      editedProfile?.contact_province || profile.contact_province;
    const contCity = editedProfile?.contact_city || profile.contact_city;
    const contBarangay =
      editedProfile?.contact_barangay || profile.contact_barangay;

    if (contRegion && contProvince && contCity && contBarangay) {
      const contactAddressPromise = AddressService.createOrUpdateFromGeography(
        {
          user_id: profile.id,
          street_address:
            editedProfile?.contact_street || profile.contact_street || "",
          region_code: contRegion,
          province_code: contProvince,
          city_code: contCity,
          barangay_code: contBarangay,
          zip_code:
            editedProfile?.contact_postal_code ||
            profile.contact_postal_code ||
            "",
        },
        profile.contacts?.current_address_id
      ).then((response) => {
        if (response.success) {
          contactAddressId = response.data.id;
          return response;
        }
        throw new Error(response.message || "Failed to save contact address");
      });

      promises.push(contactAddressPromise);
    }

    try {
      await Promise.all(promises);

      if (onAddressSave) {
        onAddressSave(permanentAddressId, contactAddressId);
      }

      return { permanentAddressId, contactAddressId };
    } catch (error: any) {
      console.error("Error saving addresses:", error);
      toast.error(error.message || "Failed to save addresses");
      throw error;
    }
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
                    // First save addresses
                    await handleSaveAddresses();
                    // Then call the regular save function
                    onSave();
                  } catch (error) {
                    // Address saving failed, don't proceed with regular save
                    console.error("Address saving failed:", error);
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
              editedProfile?.permanent_province || profile.permanent_province,
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
              editedProfile?.permanent_barangay || profile.permanent_barangay,
              "Select barangay",
              false,
              false
            )}
          </Grid>

          <Grid size={12}>
            {isEditing ? (
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
            ) : (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Building Name, Floor, Unit Number, Street Name
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
                      profile.permanent_street
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {profile.permanent_street || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          <Grid size={12}>
            {renderField(
              "Postal Code",
              profile.permanent_postal_code || "Not provided",
              "permanent_postal_code"
            )}
          </Grid>
        </Grid>
      </div>

      {/* Contact Address Section */}
      <div className="bg-green-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Address
        </h3>
        <Grid container spacing={3}>
          <Grid size={12}>
            {renderGeographyField(
              "Region",
              "contact_region",
              regions.map((r) => ({ code: r.reg_code, desc: r.reg_desc })),
              editedProfile?.contact_region || profile.contact_region,
              "Select region",
              false,
              loadingGeography
            )}
          </Grid>

          <Grid size={12}>
            {renderGeographyField(
              "Province",
              "contact_province",
              contactProvinces.map((p) => ({
                code: p.prov_code,
                desc: p.prov_desc,
              })),
              editedProfile?.contact_province || profile.contact_province,
              "Select province",
              false,
              false
            )}
          </Grid>

          <Grid size={12}>
            {renderGeographyField(
              "City/Municipality",
              "contact_city",
              contactCities.map((c) => ({
                code: c.citymun_code,
                desc: c.citymun_desc,
              })),
              editedProfile?.contact_city || profile.contact_city,
              "Select city/municipality",
              false,
              false
            )}
          </Grid>

          <Grid size={12}>
            {renderGeographyField(
              "Subdivision/Barangay",
              "contact_barangay",
              contactBarangays.map((b) => ({
                code: b.brgy_code,
                desc: b.brgy_desc,
              })),
              editedProfile?.contact_barangay || profile.contact_barangay,
              "Select barangay",
              false,
              false
            )}
          </Grid>

          <Grid size={12}>
            {isEditing ? (
              <TextField
                label="Building Name, Floor, Unit Number, Street Name"
                value={editedProfile?.contact_street || ""}
                onChange={(e) =>
                  onInputChange("contact_street", e.target.value)
                }
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                placeholder="Enter complete address"
              />
            ) : (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Building Name, Floor, Unit Number, Street Name
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
                      profile.contact_street ? "text.primary" : "text.secondary"
                    }
                  >
                    {profile.contact_street || "Not provided"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>

          <Grid size={12}>
            {renderField(
              "Postal Code",
              profile.contact_postal_code || "Not provided",
              "contact_postal_code"
            )}
          </Grid>
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
