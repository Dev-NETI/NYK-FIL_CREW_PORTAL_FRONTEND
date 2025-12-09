"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserService, NationalityService } from "@/services";
import { AuthService } from "@/services";
import { ProfileUpdateRequestService } from "@/services/profile-update-request";
import { User } from "@/types/api";
import { Nationality } from "@/services/nationality";
import toast from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Import modular components
import BasicInformation from "@/components/crew-profile/BasicInformation";
import ContactInformation from "@/components/crew-profile/ContactInformation";
import PhysicalTraits from "@/components/crew-profile/PhysicalTraits";
import EducationInformation from "@/components/crew-profile/EducationInformation";

interface ProfilePageProps {
  params: Promise<{
    crew_id: string;
  }>;
}

type ProfileSection = "basic" | "contact" | "physical" | "education";

export default function ProfilePage({ params }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [editedProfile, setEditedProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>("basic");
  const [editingSection, setEditingSection] = useState<ProfileSection | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const router = useRouter();
  const resolvedParams = use(params);
  const crewId = resolvedParams.crew_id;

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get current user to check permissions
        const currentUserData = AuthService.getStoredUser();
        if (!currentUserData) {
          toast.error("Authentication required");
          router.push("/login");
          return;
        }
        setCurrentUser(currentUserData);

        // Check if user can view this profile
        const currentUserCrewId = currentUserData.profile?.crew_id;
        const canAccess =
          currentUserCrewId === crewId || currentUserData.is_crew === 0;
        if (!canAccess) {
          toast.error("You are not authorized to view this profile");
          router.push("/crew/home");
          return;
        }

        // Load profile data and nationalities
        const [profileResponse, nationalitiesResponse] = await Promise.all([
          UserService.getUserProfile(crewId),
          NationalityService.getNationalities(),
        ]);

        if (profileResponse.success && profileResponse.user) {
          setProfile(profileResponse.user);
        } else {
          toast.error(profileResponse.message || "Failed to load profile");
        }

        if (nationalitiesResponse.success) {
          setNationalities(nationalitiesResponse.data);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [crewId, router]);

  const handleEdit = (section: ProfileSection) => {
    if (!profile) return;

    setEditingSection(section);
    setEditedProfile({ ...profile });
    setValidationErrors({});
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedProfile(null);
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!editedProfile || !editingSection || !currentUser) return;

    try {
      setSaving(true);
      setValidationErrors({});

      let requestedData;
      switch (editingSection) {
        case "basic":
          requestedData = {
            profile: editedProfile.profile,
            physical_traits: editedProfile.physical_traits,
          };
          break;
        case "contact":
          requestedData = {
            contacts: editedProfile.contacts,
            permanent_region: editedProfile.permanent_region,
            permanent_province: editedProfile.permanent_province,
            permanent_city: editedProfile.permanent_city,
            permanent_barangay: editedProfile.permanent_barangay,
            permanent_street: editedProfile.permanent_street,
            permanent_postal_code: editedProfile.permanent_postal_code,
            current_region: editedProfile.current_region,
            current_province: editedProfile.current_province,
            current_city: editedProfile.current_city,
            current_barangay: editedProfile.current_barangay,
            current_street: editedProfile.current_street,
            current_postal_code: editedProfile.current_postal_code,
          };
          break;
        case "physical":
          requestedData = {
            physical_traits: editedProfile.physical_traits,
          };
          break;
        case "education":
          requestedData = {
            education: editedProfile.education,
          };
          break;
        default:
          throw new Error("Invalid section");
      }

      // Check if user is admin - if so, allow direct update
      if (currentUser.is_crew === 0) {
        // Admin can update directly - keep original logic
        const response = await UserService.updateUserProfile(
          editedProfile.id.toString(),
          requestedData
        );

        if (response.success && response.user) {
          setProfile(response.user);
          setEditingSection(null);
          setEditedProfile(null);
          toast.success("Profile updated successfully!");
        } else {
          throw new Error(response.message || "Failed to update profile");
        }
      } else {
        // Crew member - submit update request for approval
        const response = await ProfileUpdateRequestService.submitUpdateRequest(
          editedProfile.id,
          editingSection,
          requestedData
        );

        if (response.success) {
          setEditingSection(null);
          setEditedProfile(null);
          toast.success(
            "Profile update request submitted! Please wait for admin approval."
          );
        } else {
          throw new Error(
            response.message || "Failed to submit update request"
          );
        }
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);

      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error("Please fix validation errors and try again");
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save profile changes";
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;

    setEditedProfile((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string
  ) => {
    if (!editedProfile) return;

    setEditedProfile((prev) => ({
      ...prev!,
      [parent]: {
        ...(prev![parent as keyof User] as any),
        [field]: value,
      },
    }));
  };

  const handleProfileUpdate = (updatedProfile: User) => {
    setProfile(updatedProfile);
  };

  const canEdit = currentUser?.is_crew === 0 || currentUser?.id === profile?.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 pt-5">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background with better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("/anchor.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          {/* Content with improved readability */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12">
                {/* Avatar with better styling */}
                <div className="flex-shrink-0 text-center lg:text-left mb-8 lg:mb-0">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto lg:mx-0 flex items-center justify-center shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                        {profile.profile?.full_name || profile.name
                          ? (profile.profile?.full_name || profile.name)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : profile.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <i className="bi bi-check text-white text-sm font-bold"></i>
                    </div>
                  </div>
                </div>

                {/* Profile Info with better contrast */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                      {profile.profile?.full_name ||
                        profile.name ||
                        profile.email}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                      <div className="bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30">
                        <p className="text-sm sm:text-base text-blue-100 font-semibold">
                          {profile.employment?.rank_name || "Not assigned"}
                        </p>
                      </div>
                      {profile.profile?.crew_id && (
                        <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30">
                          <p className="text-sm sm:text-base text-emerald-100 font-semibold">
                            Crew ID: {profile.profile?.crew_id}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/90">
                      <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <i className="bi bi-envelope text-blue-300"></i>
                          </div>
                          <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wide">
                              Email
                            </p>
                            <p className="text-sm font-medium truncate">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {profile.employment?.fleet_name && (
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                              <i className="bi bi-ship text-cyan-300"></i>
                            </div>
                            <div>
                              <p className="text-xs text-cyan-200 uppercase tracking-wide">
                                Fleet
                              </p>
                              <p className="text-sm font-medium">
                                {profile.employment?.fleet_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Navigation Tabs - Mobile Responsive */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
                {[
                  {
                    key: "basic",
                    label: "Basic Info",
                    icon: "bi-person-lines-fill",
                  },
                  { key: "physical", label: "Physical", icon: "bi-body-text" },
                  { key: "contact", label: "Contact", icon: "bi-geo-alt" },
                  {
                    key: "education",
                    label: "Education",
                    icon: "bi-mortarboard-fill",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key as ProfileSection)}
                    className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeSection === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <i className={tab.icon}></i>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Render the appropriate component based on active section */}
                {activeSection === "basic" && (
                  <BasicInformation
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={editingSection === "basic"}
                    saving={saving}
                    canEdit={canEdit}
                    onEdit={() => handleEdit("basic")}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onNestedInputChange={handleNestedInputChange}
                    nationalities={nationalities}
                    validationErrors={validationErrors}
                  />
                )}

                {activeSection === "physical" && (
                  <PhysicalTraits
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={editingSection === "physical"}
                    saving={saving}
                    canEdit={canEdit}
                    onEdit={() => handleEdit("physical")}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onNestedInputChange={handleNestedInputChange}
                    validationErrors={validationErrors}
                  />
                )}

                {activeSection === "contact" && (
                  <ContactInformation
                    profile={profile}
                    editedProfile={editedProfile}
                    isEditing={editingSection === "contact"}
                    saving={saving}
                    canEdit={canEdit}
                    onEdit={() => handleEdit("contact")}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onInputChange={handleInputChange}
                    validationErrors={validationErrors}
                  />
                )}

                {activeSection === "education" && (
                  <EducationInformation
                    profile={profile}
                    onProfileUpdate={handleProfileUpdate}
                    canEdit={canEdit}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}
