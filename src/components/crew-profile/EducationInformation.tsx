"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/api";
import { UserService } from "@/services/user";
import toast from "react-hot-toast";
import { TextField, Box, Typography, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface EducationInformationProps {
  profile: User;
  onProfileUpdate: (updatedProfile: User) => void;
  canEdit?: boolean;
}

export default function EducationInformation({
  profile,
  onProfileUpdate,
  canEdit = true,
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

  // ── Sub-components ────────────────────────────────────────────────────────

  const LevelCard = ({
    level,
    title,
    subtitle,
    icon,
    gradientFrom,
    gradientTo,
    accentBg,
    accentText,
    showDegree,
  }: {
    level: "high_school" | "college" | "higher_education";
    title: string;
    subtitle: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    accentBg: string;
    accentText: string;
    showDegree: boolean;
  }) => {
    const data = educationData[level];
    const hasData = !!data.school_name;

    return (
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {/* Card header */}
        <div
          className="flex items-center gap-4 px-5 py-4"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <i className={`bi ${icon} text-white text-xl`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight">{title}</p>
            <p className="text-white/70 text-xs">{subtitle}</p>
          </div>
          {!isEditing && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                hasData ? "bg-white/20 text-white" : "bg-black/20 text-white/60"
              }`}
            >
              {hasData ? "Filled" : "Empty"}
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-5">
          {isEditing ? (
            <div className="space-y-4">
              {renderField("School / Institution Name", level, "school_name", level === "high_school")}
              {showDegree && renderField("Degree / Program", level, "degree", false, level === "college" ? "e.g., BS Marine Engineering" : "e.g., Master of Science")}
              {renderDateField("Graduation Date", level)}
            </div>
          ) : (
            hasData ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accentBg}`}>
                    <i className="bi bi-building text-sm" style={{ color: accentText }}></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5">School / Institution</p>
                    <p className="text-sm font-bold text-gray-900">{data.school_name}</p>
                  </div>
                </div>
                {showDegree && data.degree && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accentBg}`}>
                      <i className="bi bi-mortarboard text-sm" style={{ color: accentText }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5">Degree / Program</p>
                      <p className="text-sm font-bold text-gray-900">{data.degree}</p>
                    </div>
                  </div>
                )}
                {data.date_graduated && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accentBg}`}>
                      <i className="bi bi-calendar-check text-sm" style={{ color: accentText }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5">Graduated</p>
                      <p className="text-sm font-bold text-gray-900">{data.date_graduated.format("MMMM YYYY")}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-300 font-semibold text-center py-2">No information provided</p>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <i className="bi bi-mortarboard-fill text-amber-600"></i>
              Education
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Academic qualifications and background</p>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              disabled={!canEdit}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canEdit
                  ? "bg-slate-900 text-white hover:bg-slate-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <i className="bi bi-pencil-fill text-xs"></i>
              Edit Education
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
              >
                <i className="bi bi-x-lg text-xs"></i>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                {saving ? (
                  <><i className="bi bi-arrow-clockwise animate-spin text-xs"></i>Saving…</>
                ) : (
                  <><i className="bi bi-check-lg text-xs"></i>Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Education level cards ── */}
        <div className="space-y-4">
          <LevelCard
            level="high_school"
            title="High School"
            subtitle="Secondary education"
            icon="bi-building"
            gradientFrom="#16a34a"
            gradientTo="#22c55e"
            accentBg="bg-green-100"
            accentText="#16a34a"
            showDegree={false}
          />
          <LevelCard
            level="college"
            title="College / University"
            subtitle="Bachelor's degree"
            icon="bi-mortarboard-fill"
            gradientFrom="#2563eb"
            gradientTo="#3b82f6"
            accentBg="bg-blue-100"
            accentText="#2563eb"
            showDegree={true}
          />
          <LevelCard
            level="higher_education"
            title="Higher Education"
            subtitle="Post-graduate / advanced degree"
            icon="bi-award-fill"
            gradientFrom="#7c3aed"
            gradientTo="#8b5cf6"
            accentBg="bg-violet-100"
            accentText="#7c3aed"
            showDegree={true}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}
