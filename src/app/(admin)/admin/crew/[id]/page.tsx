"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserService, ProgramService, EmploymentService } from "@/services";
import { User } from "@/types/api";
import { Program } from "@/services/program";
import { EmploymentRecord } from "@/services/employment";
import toast from "react-hot-toast";
import BasicInformation from "@/components/crew-profile/BasicInformation";
import PhysicalTraits from "@/components/crew-profile/PhysicalTraits";
import ContactInformation from "@/components/crew-profile/ContactInformation";
import EmploymentInformation from "@/components/crew-profile/EmploymentInformation";
import EducationInformation from "@/components/crew-profile/EducationInformation";
import { Nationality, NationalityService } from "@/services/nationality";
import { AdminRoleService, AdminRole } from "@/services/admin-role";
import { AuthService } from "@/services/auth";

interface CrewDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CrewDetailsPage({ params }: CrewDetailsPageProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  // Helper function to check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    return userRoles.some((adminRole) => adminRole.role.name === roleName);
  };

  // Program options will be loaded from API

  // Load employment records when profile loads
  useEffect(() => {
    if (profile) {
      loadEmploymentRecords();
    }

    loadNationality();
  }, [profile]);

  // Load current user's roles on mount
  useEffect(() => {
    const loadUserRoles = async () => {
      try {
        const currentUser = AuthService.getStoredUser();
        if (currentUser?.id) {
          const roles = await AdminRoleService.getByUserId(currentUser.id);
          setUserRoles(roles);
        }
      } catch (error) {
        console.error("Error loading user roles:", error);
      }
    };

    loadUserRoles();
  }, []);

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

  const loadNationality = async () => {
    try {
      const response = await NationalityService.getNationalities();
      if (response.success && response.data) {
        setNationalities(response.data);
      }
    } catch (error) {
      console.error("Error loading nationalities:", error);
    }
  };

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
          if (profileResponse.success && profileResponse.user) {
            const loadedProfile = profileResponse.user;
            // Ensure all nested objects are properly initialized
            const initializedProfile = {
              ...loadedProfile,
              profile: loadedProfile.profile || {},
              physicalTraits: loadedProfile.physical_traits || {},
              contacts: loadedProfile.contacts || {},
              employment: loadedProfile.employment || {},
              education: loadedProfile.education || [],
            };
            setProfile(initializedProfile);
            setEditedProfile(initializedProfile);
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
      }
    };

    loadData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({}); // Clear validation errors when starting edit
    if (profile) {
      // Ensure all nested objects are properly initialized
      const editableProfile = {
        ...profile,
        profile: profile.profile || {},
        physicalTraits: profile.physical_traits || {},
        contacts: profile.contacts || {},
        employment: profile.employment || {},
        education: profile.education || [],
      };
      setEditedProfile(editableProfile);
    } else {
      setEditedProfile(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors({}); // Clear validation errors when canceling edit
    if (profile) {
      // Ensure all nested objects are properly initialized when canceling
      const editableProfile = {
        ...profile,
        profile: profile.profile || {},
        physicalTraits: profile.physical_traits || {},
        contacts: profile.contacts || {},
        employment: profile.employment || {},
        education: profile.education || [],
      };
      setEditedProfile(editableProfile);
    } else {
      setEditedProfile(null);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setValidationErrors({}); // Clear previous validation errors

      // Call the API to update the profile with specific 422 error handling
      let updateResponse;
      try {
        updateResponse = await UserService.updateCrewProfile(id, editedProfile);
      } catch (apiError: any) {
        // Handle 422 validation errors specifically
        if (apiError?.response?.status === 422) {
          if (apiError?.response?.data?.errors) {
            const apiValidationErrors = apiError.response.data.errors;
            setValidationErrors(apiValidationErrors); // Store validation errors for display
          }
          // Don't show any toast for validation errors - field-level errors are enough
          return;
        }
        // Re-throw non-422 errors
        throw apiError;
      }

      if (updateResponse.success && updateResponse.user) {
        const updatedProfile = updateResponse.user;
        // Ensure all nested objects are properly initialized
        const initializedUpdatedProfile = {
          ...updatedProfile,
          profile: updatedProfile.profile || {},
          physicalTraits: updatedProfile.physical_traits || {},
          contacts: updatedProfile.contacts || {},
          employment: updatedProfile.employment || {},
          education: updatedProfile.education || [],
        };
        setProfile(initializedUpdatedProfile);
        setEditedProfile(initializedUpdatedProfile);
        setIsEditing(false);
        setValidationErrors({}); // Clear validation errors on success
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(updateResponse.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Only show toast error for non-validation errors
      let errorMessage = "Failed to update profile";

      // Check for specific error message from backend
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error?.message &&
        !error.message.includes("Request failed with status code")
      ) {
        // Only use the error message if it's not the generic axios error
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setValidationErrors({}); // Clear validation errors for non-validation errors
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermanentAddressId = async (
    permanentAddressId?: any,
    contactAddressId?: any
  ) => {
    if (!editedProfile) return;

    try {
      // Prepare the contacts update object
      const contactsUpdate: any = {
        ...editedProfile.contacts,
      };

      // Update permanent address ID if provided
      if (permanentAddressId) {
        contactsUpdate.permanent_address_id = permanentAddressId;
      }

      // Update contact address ID if provided
      if (contactAddressId) {
        contactsUpdate.current_address_id = contactAddressId;
      }

      // Update the edited profile with the new address IDs
      const updatedProfile = {
        ...editedProfile,
        contacts: contactsUpdate,
      };

      setEditedProfile(updatedProfile);

      // Call the API to update the profile with the new address IDs
      const updateResponse = await UserService.updateCrewProfile(id, {
        contacts: contactsUpdate,
      });

      if (updateResponse.success && updateResponse.user) {
        const initializedUpdatedProfile = {
          ...updateResponse.user,
          profile: updateResponse.user.profile || {},
          physicalTraits: updateResponse.user.physical_traits || {},
          contacts: updateResponse.user.contacts || {},
          employment: updateResponse.user.employment || {},
          education: updateResponse.user.education || [],
        };
        setProfile(initializedUpdatedProfile);
        setEditedProfile(initializedUpdatedProfile);
      } else {
        throw new Error(updateResponse.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Error saving address IDs:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save address IDs";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;

    // Handle nested contact fields
    const contactFields = [
      "mobile_number",
      "alternate_phone",
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",
      "email_personal",
    ];

    if (contactFields.includes(field)) {
      setEditedProfile({
        ...editedProfile,
        contacts: {
          ...editedProfile.contacts,
          [field]: value,
        },
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string
  ) => {
    if (!editedProfile) return;

    // Get the existing parent object or create an empty one
    const existingParentObject = editedProfile[parent as keyof User] as
      | Record<string, unknown>
      | undefined;

    setEditedProfile({
      ...editedProfile,
      [parent]: {
        ...(existingParentObject || {}),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Navigation */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 backdrop-blur-md border-b border-white/20 sticky top-0 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/admin/crew")}
              className="flex items-center space-x-2 text-white hover:text-gray-700 transition-colors duration-200 group"
            >
              <i className="bi bi-arrow-left text-lg group-hover:-translate-x-1 transition-transform duration-200"></i>
              <span className="font-medium">Back to Crew List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
              <div className="absolute inset-0 opacity-30">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "60px 60px",
                  }}
                ></div>
              </div>
            </div>

            <div className="relative px-8 py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
                {/* Avatar */}
                <div className="flex-shrink-0 mb-6 lg:mb-0">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                    <span className="text-4xl lg:text-5xl font-bold text-white">
                      {profile.name
                        ? profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : profile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {profile.name ||
                      profile.profile?.full_name ||
                      profile.email}
                  </h1>
                  <p className="text-xl text-blue-100 mb-4">
                    {profile.employment?.rank_name || "Not assigned"}
                  </p>

                  {/* Quick Info Tags */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center space-x-2">
                      <i className="bi bi-hash"></i>
                      <span>ID: {profile.id || id}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center space-x-2">
                      <i className="bi bi-envelope"></i>
                      <span className="truncate max-w-[200px]">
                        {profile.email}
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center space-x-2">
                      <i className="bi bi-person-badge"></i>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Tabs - Takes up 3 columns */}
          <div className="xl:col-span-3">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Enhanced Tab Navigation */}
              <div className="border-b border-gray-200/50 bg-gray-50/50">
                <nav
                  className="flex space-x-8 px-6 overflow-x-auto"
                  aria-label="Tabs"
                >
                  {[
                    { id: "basic", label: "Basic Info", icon: "bi-person" },
                    { id: "physical", label: "Physical", icon: "bi-body-text" },
                    { id: "contact", label: "Contact", icon: "bi-geo-alt" },
                    {
                      id: "employment",
                      label: "Employment",
                      icon: "bi-briefcase",
                    },
                    {
                      id: "education",
                      label: "Education",
                      icon: "bi-mortarboard",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600 bg-blue-50/50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <i className={`${tab.icon} text-base`}></i>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "basic" && (
                  <BasicInformation
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={isEditing}
                    saving={saving}
                    canEdit={hasRole("Manage Crew Basic Info")}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onNestedInputChange={handleNestedInputChange}
                    nationalities={nationalities}
                    validationErrors={validationErrors}
                  />
                )}

                {activeTab === "physical" && (
                  <PhysicalTraits
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={isEditing}
                    saving={saving}
                    canEdit={hasRole("Manage Crew Physical Info")}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onNestedInputChange={handleNestedInputChange}
                    validationErrors={validationErrors}
                  />
                )}

                {activeTab === "contact" && (
                  <ContactInformation
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={isEditing}
                    saving={saving}
                    canEdit={hasRole("Manage Crew Contact Info")}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onInputChange={handleInputChange}
                    onAddressSave={handleSavePermanentAddressId}
                    validationErrors={validationErrors}
                  />
                )}

                {activeTab === "employment" && (
                  <EmploymentInformation
                    profile={profile}
                    isEditing={isEditing}
                    saving={saving}
                    canEdit={hasRole("Manage Crew Employment Info")}
                    programs={programs}
                    employmentRecords={employmentRecords}
                    editingEmploymentId={editingEmploymentId}
                    showProgramSelection={showProgramSelection}
                    selectedProgramId={selectedProgramId}
                    batchInput={batchInput}
                    onAddEmploymentRecord={addEmploymentRecord}
                    onProgramSelect={handleProgramSelect}
                    onBatchSave={handleBatchSave}
                    onCancelBatchInput={cancelBatchInput}
                    onUpdateEmploymentRecord={updateEmploymentRecord}
                    onDeleteEmploymentRecord={deleteEmploymentRecord}
                    onSaveEmploymentRecord={saveEmploymentRecord}
                    onCancelEmploymentEdit={cancelEmploymentEdit}
                    onSetEditingEmploymentId={setEditingEmploymentId}
                    onSetShowProgramSelection={setShowProgramSelection}
                    onSetBatchInput={setBatchInput}
                  />
                )}

                {activeTab === "education" && (
                  <EducationInformation
                    profile={profile}
                    onProfileUpdate={(updatedProfile) => {
                      setProfile(updatedProfile);
                      setEditedProfile(updatedProfile);
                    }}
                    canEdit={hasRole("Manage Crew Education")}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i className="bi bi-lightning text-blue-600 mr-2"></i>
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "bi-file-earmark-medical",
                    label: "Medical Records",
                    color: "text-green-600 bg-green-50",
                  },
                  {
                    icon: "bi-award",
                    label: "Certificates",
                    color: "text-purple-600 bg-purple-50",
                  },
                  {
                    icon: "bi-envelope",
                    label: "Send Message",
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    icon: "bi-download",
                    label: "Export Profile",
                    color: "text-indigo-600 bg-indigo-50",
                  },
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  >
                    <div
                      className={`p-2 rounded-lg mr-3 ${action.color} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <i className={`${action.icon}`}></i>
                    </div>
                    <span className="font-medium text-gray-700">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/70 backdrop-blur-md rounded-2xl shadow-lg border border-red-200/20 p-6">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                <i className="bi bi-exclamation-triangle text-red-600 mr-2"></i>
                Danger Zone
              </h3>
              <button className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200">
                <i className="bi bi-person-x mr-2"></i>
                <span className="font-medium">Deactivate Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
