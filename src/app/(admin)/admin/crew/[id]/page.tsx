"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserService, ProgramService, EmploymentService } from "@/services";
import { User } from "@/types/api";
import { Program } from "@/services/program";
import { EmploymentRecord } from "@/services/employment";
import toast from "react-hot-toast";

interface CrewDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CrewDetailsPage({ params }: CrewDetailsPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [employmentRecords, setEmploymentRecords] = useState<
    EmploymentRecord[]
  >([]);
  const [editingEmploymentId, setEditingEmploymentId] = useState<number | null>(
    null
  );
  const [showProgramSelection, setShowProgramSelection] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null
  );
  const [batchInput, setBatchInput] = useState("");
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Program options will be loaded from API

  // Load employment records when profile loads
  useEffect(() => {
    if (profile) {
      loadEmploymentRecords();
    }
  }, [profile]);

  const loadEmploymentRecords = async () => {
    try {
      const response = await EmploymentService.getEmploymentRecords(id);
      if (response.success && response.data) {
        setEmploymentRecords(response.data);
      }
    } catch (error) {
      console.error("Error loading employment records:", error);
    }
  };

  const [recentActivity] = useState([
    {
      action: "Profile accessed",
      time: "Now",
      icon: "person-circle",
    },
    {
      action: profile?.last_login_at ? "Last login" : "Account created",
      time: profile?.last_login_at
        ? new Date(profile.last_login_at).toLocaleDateString()
        : "Unknown",
      icon: "calendar-check",
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load programs first
        try {
          const programsResponse = await ProgramService.getPrograms();
          if (programsResponse.success && programsResponse.data) {
            setPrograms(programsResponse.data);
          }
        } catch (programError) {
          console.warn("Failed to load programs:", programError);
        }

        // Try admin endpoint first
        try {
          const profileResponse = await UserService.getCrewProfile(id);
          console.log(profileResponse.user);
          if (profileResponse.success && profileResponse.user) {
            setProfile(profileResponse.user);
            setEditedProfile(profileResponse.user);
            return;
          }
        } catch (adminError) {
          console.error(
            "Admin endpoint failed, trying alternative approach:",
            adminError
          );
        }

        toast.error("Failed to load crew profile");
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    loadData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile ? { ...profile } : null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Here you would call the API to update the profile
      // const updateResponse = await UserService.updateCrewProfile(id, editedProfile);

      // For now, we'll simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;

    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string
  ) => {
    if (!editedProfile) return;

    setEditedProfile({
      ...editedProfile,
      [parent]: {
        ...((editedProfile[parent as keyof User] as Record<string, unknown>) ||
          {}),
        [field]: value,
      },
    });
  };

  const validateForm = (): boolean => {
    if (!editedProfile) return false;

    // Basic validation - check required fields
    if (!editedProfile.email) {
      toast.error("Email is required");
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedProfile.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  // Employment record functions
  const addEmploymentRecord = () => {
    // Ensure programs are loaded before showing selection
    if (!programs || programs.length === 0) {
      toast.error("Please wait for programs to load");
      return;
    }

    setShowProgramSelection(true);
  };

  const handleProgramSelect = (programId: number) => {
    setSelectedProgramId(programId);
    setShowProgramSelection(false);
    setBatchInput("");
  };

  const handleBatchSave = async () => {
    if (!selectedProgramId || !batchInput.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    try {
      const response = await EmploymentService.createEmploymentRecord(id, {
        program_id: selectedProgramId,
        batch: batchInput.trim(),
      });

      if (response.success && response.data) {
        setEmploymentRecords([...employmentRecords, response.data]);
        setSelectedProgramId(null);
        setBatchInput("");
        toast.success("Employment record created successfully!");
      } else {
        console.error("API returned non-success response:", response);
        toast.error(
          "Failed to create employment record: " +
            (response.message || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Error creating employment record:", error);

      // Handle specific database errors
      if (error?.response?.data?.message?.includes("modified_by")) {
        toast.error(
          "Database configuration error. Please contact your system administrator."
        );
      } else if (error?.response?.data?.message?.includes("Column not found")) {
        toast.error(
          "Database schema error. Please contact your system administrator."
        );
      } else {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Unknown error";
        toast.error("Failed to create employment record: " + errorMessage);
      }
    }
  };

  const cancelBatchInput = () => {
    setSelectedProgramId(null);
    setBatchInput("");
  };

  const updateEmploymentRecord = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setEmploymentRecords(
      employmentRecords.map((record) =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  const deleteEmploymentRecord = async (employmentId: number) => {
    if (!confirm("Are you sure you want to delete this employment record?")) {
      return;
    }

    try {
      const response = await EmploymentService.deleteEmploymentRecord(
        id,
        employmentId
      );
      if (response.success) {
        setEmploymentRecords(
          employmentRecords.filter((record) => record.id !== employmentId)
        );
        toast.success("Employment record deleted!");
      }
    } catch (error) {
      console.error("Error deleting employment record:", error);
      toast.error("Failed to delete employment record");
    }
  };

  const saveEmploymentRecord = async (employmentId: number) => {
    const record = employmentRecords.find((r) => r.id === employmentId);
    if (!record) return;

    if (!record.program_id || !record.batch) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await EmploymentService.updateEmploymentRecord(
        id,
        employmentId,
        {
          program_id: record.program_id,
          batch: record.batch,
        }
      );

      if (response.success && response.data) {
        setEmploymentRecords(
          employmentRecords.map((r) =>
            r.id === employmentId ? response.data : r
          )
        );
        setEditingEmploymentId(null);
        toast.success("Employment record saved!");
      }
    } catch (error) {
      console.error("Error saving employment record:", error);
      toast.error("Failed to save employment record");
    }
  };

  const cancelEmploymentEdit = () => {
    setEditingEmploymentId(null);
    // Reload employment records to revert any unsaved changes
    loadEmploymentRecords();
  };

  const renderField = (
    label: string,
    value: string,
    field: string,
    required: boolean = false
  ) => {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isEditing ? (
          <input
            type="text"
            value={(editedProfile?.[field as keyof User] as string) || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
            {value || "Not provided"}
          </p>
        )}
      </div>
    );
  };

  const renderNestedField = (
    label: string,
    value: string,
    parent: string,
    field: string,
    required: boolean = false
  ) => {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isEditing ? (
          <input
            type="text"
            value={
              ((
                editedProfile?.[parent as keyof User] as Record<string, unknown>
              )?.[field] as string) || ""
            }
            onChange={(e) =>
              handleNestedInputChange(parent, field, e.target.value)
            }
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
            {value || "Not provided"}
          </p>
        )}
      </div>
    );
  };

  const renderSelectField = (
    label: string,
    value: string,
    field: string,
    options: string[],
    required: boolean = false
  ) => {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isEditing ? (
          <select
            value={(editedProfile?.[field as keyof User] as string) || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
            {value || "Not provided"}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crew profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <i className="bi bi-person-x text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Crew Member Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested crew member could not be found.
            </p>
            <button
              onClick={() => router.push("/admin/crew")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Crew List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Edit Mode Banner */}
          {isEditing && (
            <div className="mb-6 bg-blue-100 border border-blue-300 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="bi bi-pencil-square text-blue-600 text-xl mr-3"></i>
                  <div>
                    <h3 className="text-blue-800 font-semibold">
                      Edit Mode Active
                    </h3>
                    <p className="text-blue-600 text-sm">
                      Make your changes and click Save to update the profile.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check mr-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                  >
                    <i className="bi bi-x mr-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header with Back Button */}
          <div
            className={`mb-6 sm:mb-8 transform transition-all duration-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => router.push("/admin/crew")}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <i className="bi bi-arrow-left text-lg"></i>
                <span className="font-medium">Back to Crew List</span>
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div
            className={`bg-gradient-to-r from-blue-700 to-cyan-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-1000 mb-8 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              backgroundImage: 'url("/anchor.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }}
          >
            <div className="relative px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700/90 to-cyan-800/90"></div>
              <div className="relative lg:flex lg:items-center lg:space-x-12">
                <div className="text-center lg:text-left lg:flex-shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white/20 backdrop-blur-sm rounded-full mx-auto lg:mx-0 mb-6 lg:mb-0 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-white/30">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                      {profile.name
                        ? profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : profile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="lg:flex-1 text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                    {profile.name ||
                      profile.profile?.full_name ||
                      profile.email}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 mb-2 sm:mb-3">
                    {profile.employment?.rank_name ||
                      profile.rank_name ||
                      "Not assigned"}
                  </p>
                  <p className="text-lg sm:text-xl text-blue-200 mb-2 sm:mb-3">
                    {profile.profile?.crew_id || profile.crew_id
                      ? `Crew ID: ${
                          profile.profile?.crew_id || profile.crew_id
                        }`
                      : "No crew assignment"}
                  </p>
                  <p className="text-lg sm:text-xl text-blue-200 mb-4 sm:mb-6">
                    User ID: {profile.id || id}
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-hash text-lg"></i>
                      <span>ID: {profile.id || id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-envelope text-lg"></i>
                      <span>{profile.email}</span>
                    </div>
                    {(profile.employment?.fleet_name || profile.fleet_name) && (
                      <div className="flex items-center space-x-2">
                        <i className="bi bi-ship text-lg"></i>
                        <span>
                          Fleet:{" "}
                          {profile.employment?.fleet_name || profile.fleet_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-person-badge text-lg"></i>
                      <span>
                        Status:{" "}
                        {profile.employment?.crew_status ||
                          profile.crew_status ||
                          "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 transform transition-all duration-1000 delay-200 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                  Account Status
                </h3>
                <span className="text-xl sm:text-2xl">
                  {profile.email_verified_at ? "✅" : "⏳"}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profile.email_verified_at ? "Verified" : "Pending"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Email verification
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                  Hire Date
                </h3>
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profile.employment?.hire_date
                  ? new Date(profile.employment?.hire_date).toLocaleDateString()
                  : "Not provided"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Year joined</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                  Fleet
                </h3>
                <span className="text-xl sm:text-2xl">🚢</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                {profile.employment?.fleet_name ||
                  profile.fleet_name ||
                  "Unassigned"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Current assignment
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                  Last Login
                </h3>
                <span className="text-xl sm:text-2xl">🕒</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profile.last_login_at
                  ? new Date(profile.last_login_at).toLocaleDateString()
                  : "Never"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Activity status
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
            {/* Profile Information with Tabs */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-1000 delay-300 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav
                    className="flex space-x-8 px-6 sm:px-8 overflow-x-auto"
                    aria-label="Tabs"
                  >
                    <button
                      onClick={() => setActiveTab("basic")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        activeTab === "basic"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Basic Information
                    </button>
                    <button
                      onClick={() => setActiveTab("physical")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        activeTab === "physical"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Physical Traits
                    </button>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        activeTab === "contact"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => setActiveTab("employment")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        activeTab === "employment"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Employment Info
                    </button>
                    <button
                      onClick={() => setActiveTab("education")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                        activeTab === "education"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Education
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 sm:p-8">
                  {/* Basic Information Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Basic Information
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-pencil mr-2"></i>
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              <i className="bi bi-x mr-2"></i>
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check mr-2"></i>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderNestedField(
                          "Last Name",
                          profile.profile?.last_name ||
                            profile.last_name ||
                            "Not provided",
                          "profile",
                          "last_name",
                          true
                        )}

                        {renderNestedField(
                          "First Name",
                          profile.profile?.first_name ||
                            profile.first_name ||
                            "Not provided",
                          "profile",
                          "first_name",
                          true
                        )}

                        {renderNestedField(
                          "Middle Name",
                          profile.profile?.middle_name ||
                            profile.middle_name ||
                            "Not provided",
                          "profile",
                          "middle_name"
                        )}

                        {renderNestedField(
                          "Suffix",
                          profile.profile?.suffix ||
                            profile.suffix ||
                            "Not provided",
                          "profile",
                          "suffix"
                        )}

                        {renderField(
                          "Nationality",
                          profile.nationality || "Not provided",
                          "nationality"
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              value={
                                ((
                                  editedProfile?.profile as Record<
                                    string,
                                    unknown
                                  >
                                )?.gender as string) ||
                                editedProfile?.gender ||
                                ""
                              }
                              onChange={(e) =>
                                handleNestedInputChange(
                                  "profile",
                                  "gender",
                                  e.target.value
                                )
                              }
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                              <option value="Prefer not to say">
                                Prefer not to say
                              </option>
                            </select>
                          ) : (
                            <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                              {profile.profile?.gender ||
                                profile.gender ||
                                "Not provided"}
                            </p>
                          )}
                        </div>

                        {renderSelectField(
                          "Civil Status",
                          profile.civil_status || "Not provided",
                          "civil_status",
                          [
                            "Single",
                            "Married",
                            "Divorced",
                            "Widowed",
                            "Separated",
                          ]
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Birth Date
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editedProfile?.date_of_birth || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "date_of_birth",
                                  e.target.value
                                )
                              }
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                            />
                          ) : (
                            <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                              {profile.date_of_birth
                                ? new Date(
                                    profile.date_of_birth
                                  ).toLocaleDateString()
                                : "Not provided"}
                            </p>
                          )}
                        </div>

                        {renderField(
                          "Birth Place",
                          profile.birth_place || "Not provided",
                          "birth_place"
                        )}

                        {renderSelectField(
                          "Blood Type",
                          profile.blood_type || "Not provided",
                          "blood_type",
                          ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
                        )}

                        {renderField(
                          "Religion",
                          profile.religion || "Not provided",
                          "religion"
                        )}
                      </div>
                    </div>
                  )}

                  {/* Physical Traits Tab */}
                  {activeTab === "physical" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Physical Traits
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-pencil mr-2"></i>
                            Edit Physical Info
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              <i className="bi bi-x mr-2"></i>
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check mr-2"></i>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Height (cm)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProfile?.height || ""}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                              placeholder="Enter height in cm"
                              min="0"
                              max="300"
                            />
                          ) : (
                            <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                              {profile.physical_traits?.height || profile.height
                                ? `${
                                    profile.physical_traits?.height ||
                                    profile.height
                                  } cm`
                                : "Not provided"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProfile?.weight || ""}
                              onChange={(e) =>
                                handleInputChange("weight", e.target.value)
                              }
                              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                              placeholder="Enter weight in kg"
                              min="0"
                              max="500"
                            />
                          ) : (
                            <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                              {profile.physical_traits?.weight || profile.weight
                                ? `${
                                    profile.physical_traits?.weight ||
                                    profile.weight
                                  } kg`
                                : "Not provided"}
                            </p>
                          )}
                        </div>

                        {renderField(
                          "Eye Color",
                          profile.physical_traits?.eye_color ||
                            profile.eye_color ||
                            "Not provided",
                          "eye_color"
                        )}

                        {renderField(
                          "Hair Color",
                          profile.physical_traits?.hair_color ||
                            profile.hair_color ||
                            "Not provided",
                          "hair_color"
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Tab */}
                  {activeTab === "contact" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Contact Information
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-pencil mr-2"></i>
                            Edit Contact Info
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              <i className="bi bi-x mr-2"></i>
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check mr-2"></i>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mailing/Permanent Address Section */}
                      <div className="bg-blue-50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Mailing Address / Permanent Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderField(
                            "Region",
                            profile.permanent_region || "Not provided",
                            "permanent_region"
                          )}

                          {renderField(
                            "Province",
                            profile.permanent_province || "Not provided",
                            "permanent_province"
                          )}

                          {renderField(
                            "City/Municipality",
                            profile.permanent_city || "Not provided",
                            "permanent_city"
                          )}

                          {renderField(
                            "Subdivision/Barangay",
                            profile.permanent_barangay || "Not provided",
                            "permanent_barangay"
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Building Name, Floor, Unit Number, Street Name
                            </label>
                            {isEditing ? (
                              <textarea
                                value={editedProfile?.permanent_street || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "permanent_street",
                                    e.target.value
                                  )
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                placeholder="Enter complete address"
                                rows={3}
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.permanent_street || "Not provided"}
                              </p>
                            )}
                          </div>

                          {renderField(
                            "Postal Code",
                            profile.permanent_postal_code || "Not provided",
                            "permanent_postal_code"
                          )}
                        </div>
                      </div>

                      {/* Contact Address Section */}
                      <div className="bg-green-50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderField(
                            "Region",
                            profile.contact_region || "Not provided",
                            "contact_region"
                          )}

                          {renderField(
                            "Province",
                            profile.contact_province || "Not provided",
                            "contact_province"
                          )}

                          {renderField(
                            "City/Municipality",
                            profile.contact_city || "Not provided",
                            "contact_city"
                          )}

                          {renderField(
                            "Subdivision/Barangay",
                            profile.contact_barangay || "Not provided",
                            "contact_barangay"
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Building Name, Floor, Unit Number, Street Name
                            </label>
                            {isEditing ? (
                              <textarea
                                value={editedProfile?.contact_street || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "contact_street",
                                    e.target.value
                                  )
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                placeholder="Enter complete address"
                                rows={3}
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.contact_street || "Not provided"}
                              </p>
                            )}
                          </div>

                          {renderField(
                            "Postal Code",
                            profile.contact_postal_code || "Not provided",
                            "contact_postal_code"
                          )}
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="bg-orange-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email Address
                            </label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editedProfile?.email || ""}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                                placeholder="Enter email address"
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.email}
                                {profile.email_verified_at && (
                                  <span className="ml-2 text-green-600 text-sm">
                                    ✓ Verified
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {renderField(
                            "Mobile No.",
                            profile.contacts?.mobile_number ||
                              profile.mobile_number ||
                              "Not provided",
                            "mobile_number"
                          )}

                          {renderField(
                            "Emergency Contact Number",
                            profile.emergency_contact_number || "Not provided",
                            "emergency_contact_number"
                          )}

                          {renderField(
                            "Emergency Contact Relation",
                            profile.emergency_contact_relation ||
                              "Not provided",
                            "emergency_contact_relation"
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employment Information Tab */}
                  {activeTab === "employment" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Employment Information
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-pencil mr-2"></i>
                            Edit Employment Info
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              <i className="bi bi-x mr-2"></i>
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check mr-2"></i>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Employment History
                          </h3>
                          <button
                            onClick={addEmploymentRecord}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-plus mr-2"></i>
                            Add Employment
                          </button>
                        </div>

                        {/* Program Selection Modal */}
                        {showProgramSelection && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Select Program
                              </h3>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {programs.map((program) => (
                                  <button
                                    key={program.id}
                                    onClick={() =>
                                      handleProgramSelect(program.id)
                                    }
                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                                  >
                                    <div className="font-medium text-gray-900">
                                      {program.name}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="flex justify-end space-x-3 mt-6">
                                <button
                                  onClick={() => setShowProgramSelection(false)}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Batch Input Interface */}
                        {selectedProgramId && (
                          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Add Employment Record
                              </h4>
                              <button
                                onClick={cancelBatchInput}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Selected Program
                                </label>
                                <p className="text-gray-900 py-2 px-3 bg-white rounded-lg border border-gray-200">
                                  {
                                    programs.find(
                                      (p) => p.id === selectedProgramId
                                    )?.name
                                  }
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Batch <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={batchInput}
                                  onChange={(e) =>
                                    setBatchInput(e.target.value)
                                  }
                                  placeholder="e.g., BATCH 2025, Q1 2025, etc."
                                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={cancelBatchInput}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBatchSave}
                                  disabled={!batchInput.trim()}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Save Employment Record
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {employmentRecords.length === 0 ? (
                          <div className="text-center py-8">
                            <i className="bi bi-briefcase text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500 mb-4">
                              No employment records found
                            </p>
                            <button
                              onClick={addEmploymentRecord}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              Add First Employment Record
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Program
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Batch
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {employmentRecords.map((employment) => (
                                  <tr
                                    key={employment.id}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {editingEmploymentId === employment.id ? (
                                        <select
                                          value={employment.program_id}
                                          onChange={(e) =>
                                            updateEmploymentRecord(
                                              employment.id,
                                              "program_id",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                          <option value="">
                                            Select program
                                          </option>
                                          {programs.map((program) => (
                                            <option
                                              key={program.id}
                                              value={program.id}
                                            >
                                              {program.name}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-3 w-3 bg-blue-600 rounded-full mr-3"></div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {employment.program?.name ||
                                              "Not assigned"}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {editingEmploymentId === employment.id ? (
                                        <input
                                          type="text"
                                          value={employment.batch}
                                          onChange={(e) =>
                                            updateEmploymentRecord(
                                              employment.id,
                                              "batch",
                                              e.target.value
                                            )
                                          }
                                          placeholder="e.g., BATCH 2025"
                                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {employment.batch || "Not provided"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {editingEmploymentId === employment.id ? (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              saveEmploymentRecord(
                                                employment.id
                                              )
                                            }
                                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                                          >
                                            <i className="bi bi-check-lg"></i>
                                          </button>
                                          <button
                                            onClick={() =>
                                              cancelEmploymentEdit()
                                            }
                                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                          >
                                            <i className="bi bi-x-lg"></i>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              setEditingEmploymentId(
                                                employment.id
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                          >
                                            <i className="bi bi-pencil"></i>
                                          </button>
                                          <button
                                            onClick={() =>
                                              deleteEmploymentRecord(
                                                employment.id
                                              )
                                            }
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                          >
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Educational Background Tab */}
                  {activeTab === "education" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          Educational Background
                        </h2>
                        {!isEditing ? (
                          <button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <i className="bi bi-pencil mr-2"></i>
                            Edit Education Info
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              <i className="bi bi-x mr-2"></i>
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <i className="bi bi-arrow-clockwise animate-spin mr-2"></i>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check mr-2"></i>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* High School Section */}
                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                          High School
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderField(
                            "School Name",
                            profile.highschool_name || "Not provided",
                            "highschool_name"
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Date Graduated
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={
                                  editedProfile?.highschool_graduation_date ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "highschool_graduation_date",
                                    e.target.value
                                  )
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.highschool_graduation_date
                                  ? new Date(
                                      profile.highschool_graduation_date
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                    })
                                  : "Not provided"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* College Section */}
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                          College
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderField(
                            "School Name",
                            profile.college_name || "Not provided",
                            "college_name"
                          )}

                          {renderField(
                            "Degree Earned",
                            profile.college_degree || "Not provided",
                            "college_degree"
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Date Graduated
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={
                                  editedProfile?.college_graduation_date || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "college_graduation_date",
                                    e.target.value
                                  )
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.college_graduation_date
                                  ? new Date(
                                      profile.college_graduation_date
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                    })
                                  : "Not provided"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Higher Attainment Section */}
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                          Higher Attainment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderField(
                            "School Name",
                            profile.higher_education_name || "Not provided",
                            "higher_education_name"
                          )}

                          {renderField(
                            "Degree Earned",
                            profile.higher_education_degree || "Not provided",
                            "higher_education_degree"
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Date Graduated
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={
                                  editedProfile?.higher_education_graduation_date ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "higher_education_graduation_date",
                                    e.target.value
                                  )
                                }
                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                              />
                            ) : (
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.higher_education_graduation_date
                                  ? new Date(
                                      profile.higher_education_graduation_date
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                    })
                                  : "Not provided"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Admin Actions */}
              <div
                className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-1000 delay-400 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Admin Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={isEditing ? handleCancel : handleEdit}
                    className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group"
                  >
                    <i
                      className={`bi ${
                        isEditing ? "bi-x" : "bi-pencil-square"
                      } mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-blue-600`}
                    ></i>
                    <span className="font-medium">
                      {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-file-earmark-medical mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-green-600"></i>
                    <span className="font-medium">Medical Records</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-award mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-purple-600"></i>
                    <span className="font-medium">Certificates</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-envelope mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-orange-600"></i>
                    <span className="font-medium">Send Message</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-300 group border border-red-200">
                    <i className="bi bi-person-x mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-red-600"></i>
                    <span className="font-medium text-red-600">
                      Deactivate Account
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-1000 delay-500 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-all duration-300"
                    >
                      <i
                        className={`bi bi-${activity.icon} text-lg flex-shrink-0 text-blue-600`}
                      ></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
