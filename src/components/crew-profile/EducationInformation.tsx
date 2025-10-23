"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/api";
import { UserService } from "@/services/user";
import toast from "react-hot-toast";
import {
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface EducationInformationProps {
  profile: User;
  onProfileUpdate: (updatedProfile: User) => void;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
}

export default function EducationInformation({
  profile,
  onProfileUpdate,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onInputChange,
}: EducationInformationProps) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [educationData, setEducationData] = useState({
    high_school: {
      school_name: "",
      date_graduated: null as Dayjs | null,
      degree: "",
    },
    college: {
      school_name: "",
      date_graduated: null as Dayjs | null,
      degree: "",
    },
    higher_education: {
      school_name: "",
      date_graduated: null as Dayjs | null,
      degree: "",
    },
  });

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile.education && Array.isArray(profile.education)) {
      const highSchool = profile.education.find(
        (edu) =>
          edu.education_level === "High School" ||
          edu.education_level === "high_school"
      );
      const college = profile.education.find(
        (edu) =>
          edu.education_level === "College" || edu.education_level === "college"
      );
      const higherEducation = profile.education.find(
        (edu) =>
          edu.education_level === "Higher Education" ||
          edu.education_level === "higher_educational"
      );

      setEducationData({
        high_school: {
          school_name: highSchool?.school_name || "",
          date_graduated: highSchool?.date_graduated
            ? dayjs(highSchool.date_graduated)
            : null,
          degree: highSchool?.degree || "",
        },
        college: {
          school_name: college?.school_name || "",
          date_graduated: college?.date_graduated
            ? dayjs(college.date_graduated)
            : null,
          degree: college?.degree || "",
        },
        higher_education: {
          school_name: higherEducation?.school_name || "",
          date_graduated: higherEducation?.date_graduated
            ? dayjs(higherEducation.date_graduated)
            : null,
          degree: higherEducation?.degree || "",
        },
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    const highSchool = profile.education?.find(
      (edu) =>
        edu.education_level === "High School" ||
        edu.education_level === "high_school"
    );
    const college = profile.education?.find(
      (edu) =>
        edu.education_level === "College" || edu.education_level === "college"
    );
    const higherEducation = profile.education?.find(
      (edu) =>
        edu.education_level === "higher_educational" ||
        edu.education_level === "higher_educational"
    );

    setEducationData({
      high_school: {
        school_name: highSchool?.school_name || "",
        date_graduated: highSchool?.date_graduated
          ? dayjs(highSchool.date_graduated)
          : null,
        degree: highSchool?.degree || "",
      },
      college: {
        school_name: college?.school_name || "",
        date_graduated: college?.date_graduated
          ? dayjs(college.date_graduated)
          : null,
        degree: college?.degree || "",
      },
      higher_education: {
        school_name: higherEducation?.school_name || "",
        date_graduated: higherEducation?.date_graduated
          ? dayjs(higherEducation.date_graduated)
          : null,
        degree: higherEducation?.degree || "",
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare data for submission - only include sections with data
      const submitData: any = {};

      // Check if high school has any data
      if (educationData.high_school.school_name.trim()) {
        submitData.high_school = {
          school_name: educationData.high_school.school_name.trim(),
          date_graduated:
            educationData.high_school.date_graduated?.format("YYYY-MM-DD") ||
            null,
          degree: educationData.high_school.degree.trim() || null,
        };
      }

      // Check if college has any data
      if (educationData.college.school_name.trim()) {
        submitData.college = {
          school_name: educationData.college.school_name.trim(),
          date_graduated:
            educationData.college.date_graduated?.format("YYYY-MM-DD") || null,
          degree: educationData.college.degree.trim() || null,
        };
      }

      // Check if higher education has any data
      if (educationData.higher_education.school_name.trim()) {
        submitData.higher_education = {
          school_name: educationData.higher_education.school_name.trim(),
          date_graduated:
            educationData.higher_education.date_graduated?.format(
              "YYYY-MM-DD"
            ) || null,
          degree: educationData.higher_education.degree.trim() || null,
        };
      }

      // Check if there's any existing education data to determine update vs store
      const hasExistingEducation =
        profile.education &&
        Array.isArray(profile.education) &&
        profile.education.length > 0;

      let response;
      if (hasExistingEducation) {
        response = await UserService.updateEducationInformation(
          profile.id.toString(),
          submitData
        );
      } else {
        response = await UserService.storeEducationInformation(
          profile.id.toString(),
          submitData
        );
      }

      if (response.success) {
        // Refresh the profile data to get updated education information
        const updatedProfileResponse = await UserService.getCrewProfile(
          profile.id.toString()
        );
        if (updatedProfileResponse.success && updatedProfileResponse.user) {
          onProfileUpdate(updatedProfileResponse.user);
        }

        setIsEditing(false);
        toast.success("Education information saved successfully!");
      } else {
        throw new Error(
          response.message || "Failed to save education information"
        );
      }
    } catch (error: any) {
      console.error("Error saving education information:", error);

      // Handle specific validation errors
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        toast.error(`Validation Error: ${errorMessages.join(", ")}`);
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save education information";
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    level: "high_school" | "college" | "higher_education",
    field: string,
    value: string | Dayjs | null
  ) => {
    setEducationData((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value,
      },
    }));
  };

  // Helper function to get appropriate icon for education level
  const getEducationIcon = (
    level: "high_school" | "college" | "higher_education"
  ) => {
    switch (level) {
      case "high_school":
        return "bi-building";
      case "college":
        return "bi-mortarboard-fill";
      case "higher_education":
        return "bi-award-fill";
      default:
        return "bi-book";
    }
  };

  const renderField = (
    label: string,
    level: "high_school" | "college" | "higher_education",
    field: string,
    required: boolean = false,
    helpText?: string
  ) => {
    const value =
      educationData[level][field as keyof (typeof educationData)[typeof level]];

    const getPlaceholder = () => {
      switch (field) {
        case "school_name":
          return level === "higher_education"
            ? "e.g., Harvard University, MIT"
            : level === "college"
            ? "e.g., University of the Philippines"
            : "e.g., Manila Science High School";
        case "degree":
          return level === "higher_education"
            ? "e.g., Master of Science, Ph.D."
            : level === "college"
            ? "e.g., Bachelor of Science in Marine Engineering"
            : "High School Diploma";
        default:
          return `Enter ${label.toLowerCase()}`;
      }
    };

    return (
      <Box sx={{ mb: 2 }}>
        {isEditing ? (
          <TextField
            fullWidth
            label={label}
            value={value || ""}
            onChange={(e) => handleInputChange(level, field, e.target.value)}
            required={required}
            variant="outlined"
            size="medium"
            placeholder={getPlaceholder()}
            helperText={helpText}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "white",
                "&:hover": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
              "& .MuiFormLabel-root": {
                fontWeight: 500,
              },
            }}
          />
        ) : (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500, display: "block", mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography
              variant="body1"
              color={value ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: value ? 500 : 400 }}
            >
              {(typeof value === "string" ? value : value?.toString()) ||
                "Not provided"}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderDateField = (
    label: string,
    level: "high_school" | "college" | "higher_education",
    helpText?: string
  ) => {
    const value = educationData[level].date_graduated;

    return (
      <Box sx={{ mb: 2 }}>
        {isEditing ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={label}
              value={value}
              onChange={(newValue) =>
                handleInputChange(level, "date_graduated", newValue)
              }
              views={["year", "month"]}
              openTo="year"
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  helperText: helpText || "Select graduation month and year",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    },
                    "& .MuiFormLabel-root": {
                      fontWeight: 500,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        ) : (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500, display: "block", mb: 0.5 }}
        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              disabled={!canEdit}
              className={`bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg flex items-center space-x-2 ${
                canEdit
                  ? "hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl"
                  : "opacity-50 cursor-not-allowed"
              }`}
              title={!canEdit ? "You don't have permission to edit this section" : ""}
            >
              {label}
            </Typography>
            <Typography
              variant="body1"
              color={value ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: value ? 500 : 400 }}
            >
              {value ? value.format("MMMM YYYY") : "Not provided"}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="bi bi-mortarboard-fill text-blue-600 mr-3"></i>
              Education Information
            </h2>
            <p className="text-gray-600 mt-1">
              Academic qualifications and educational background
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center"
              >
                <i className="bi bi-pencil-fill mr-2"></i>
                Edit Information
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                  ) : (
                    <i className="bi bi-check-lg mr-2"></i>
                  )}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <Box sx={{ px: 1 }}>
          {/* High School Section */}
          <Card
            elevation={2}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {/* Green gradient header for High School */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                p: 3,
                color: "white",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha("#ffffff", 0.2),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <i
                      className={getEducationIcon("high_school")}
                      style={{
                        fontSize: "1.5rem",
                        color: "#ffffff",
                      }}
                    ></i>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      High School Education
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Secondary education foundation
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  {renderField(
                    "School Name",
                    "high_school",
                    "school_name",
                    true,
                    "Enter the full name of your high school"
                  )}
                </Grid>
                <Grid size={12}>
                  {renderDateField(
                    "Graduation Date",
                    "high_school",
                    "Month and year of graduation"
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* College Section */}
          <Card
            elevation={2}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {/* Blue gradient header for College */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                p: 3,
                color: "white",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha("#ffffff", 0.2),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <i
                      className={getEducationIcon("college")}
                      style={{
                        fontSize: "1.5rem",
                        color: "#ffffff",
                      }}
                    ></i>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      College Education
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Higher education and bachelor's degree
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  {renderField(
                    "University/College Name",
                    "college",
                    "school_name",
                    false,
                    "Name of the university or college attended"
                  )}
                </Grid>
                <Grid size={6}>
                  {renderField(
                    "Degree Earned",
                    "college",
                    "degree",
                    false,
                    "e.g., Bachelor of Science in Marine Engineering"
                  )}
                </Grid>
                <Grid size={6}>
                  {renderDateField(
                    "Graduation Date",
                    "college",
                    "Month and year of graduation"
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Higher Education Section */}
          <Card
            elevation={2}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {/* Purple gradient header for Higher Education */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                p: 3,
                color: "white",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha("#ffffff", 0.2),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <i
                      className={getEducationIcon("higher_education")}
                      style={{
                        fontSize: "1.5rem",
                        color: "#ffffff",
                      }}
                    ></i>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Higher Education
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Post-graduate studies and advanced degrees
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  {renderField(
                    "Institution Name",
                    "higher_education",
                    "school_name",
                    false,
                    "Graduate school or university name"
                  )}
                </Grid>
                <Grid size={6}>
                  {renderField(
                    "Degree/Program",
                    "higher_education",
                    "degree",
                    false,
                    "e.g., Master of Science, Ph.D., Professional Certificate"
                  )}
                </Grid>
                <Grid size={6}>
                  {renderDateField(
                    "Graduation Date",
                    "higher_education",
                    "Month and year of graduation or completion"
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </div>
    </LocalizationProvider>
  );
}
