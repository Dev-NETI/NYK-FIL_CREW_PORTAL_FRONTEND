"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserService, NationalityService } from "@/services";
import { AuthService } from "@/services";
import { ProfileUpdateRequestService } from "@/services/profile-update-request";
import { User } from "@/types/api";
import { Nationality } from "@/services/nationality";
import { Rank, RankService } from "@/services/rank";
import { Fleet, FleetService } from "@/services/fleet";
import { Company, CompanyService } from "@/services/company";
import toast from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AvatarUpload from "@/components/AvatarUpload";
import BasicInformation from "@/components/crew-profile/BasicInformation";
import ContactInformation from "@/components/crew-profile/ContactInformation";
import PhysicalTraits from "@/components/crew-profile/PhysicalTraits";
import EducationInformation from "@/components/crew-profile/EducationInformation";

interface ProfilePageProps {
  params: Promise<{ crew_id: string }>;
}

type ProfileSection = "basic" | "contact" | "physical" | "education";

const NAV_ITEMS: {
  key: ProfileSection;
  label: string;
  icon: string;
  color: string;
  iconBg: string;
}[] = [
  {
    key: "basic",
    label: "Basic Information",
    icon: "bi-person-lines-fill",
    color: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "physical",
    label: "Physical Traits",
    icon: "bi-body-text",
    color: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    key: "contact",
    label: "Contact & Address",
    icon: "bi-geo-alt-fill",
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    key: "education",
    label: "Education",
    icon: "bi-mortarboard-fill",
    color: "text-amber-600",
    iconBg: "bg-amber-100",
  },
];

export default function ProfilePage({ params }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [editedProfile, setEditedProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>("basic");
  const [editingSection, setEditingSection] = useState<ProfileSection | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [hasPendingImage, setHasPendingImage] = useState(false);

  const router = useRouter();
  const resolvedParams = use(params);
  const crewId = resolvedParams.crew_id;

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUserData = AuthService.getStoredUser();
        if (!currentUserData) {
          toast.error("Authentication required");
          router.push("/login");
          return;
        }
        setCurrentUser(currentUserData);

        const currentUserCrewId = currentUserData.profile?.crew_id;
        const canAccess =
          currentUserCrewId === crewId || currentUserData.is_crew === false;
        if (!canAccess) {
          toast.error("You are not authorized to view this profile");
          router.push("/crew/home");
          return;
        }

        const [
          profileResponse,
          nationalitiesResponse,
          rankRes,
          fleetRes,
          companyRes,
          updateRequestsRes,
        ] = await Promise.all([
          UserService.getUserProfile(crewId),
          NationalityService.getNationalities(),
          RankService.getRanks(),
          FleetService.getFleets(),
          CompanyService.getCompanies(),
          currentUserData.is_crew
            ? ProfileUpdateRequestService.getCrewRequests(crewId)
            : Promise.resolve({ success: false, data: [] }),
        ]);

        if (profileResponse.success && profileResponse.user) {
          setProfile(profileResponse.user);
        } else {
          toast.error(profileResponse.message || "Failed to load profile");
        }

        if (nationalitiesResponse.success)
          setNationalities(nationalitiesResponse.data);
        if (rankRes.success) setRanks(rankRes.data);
        if (fleetRes.success) setFleets(fleetRes.data);
        if (companyRes.success) setCompanies(companyRes.data);
        if (updateRequestsRes.success && updateRequestsRes.data) {
          setHasPendingImage(
            updateRequestsRes.data.some(
              (r) => r.section === "image" && r.status === "pending",
            ),
          );
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
    const newEditedProfile = { ...profile };

    if (section === "contact") {
      if (profile.permanent_address) {
        newEditedProfile.permanent_region = profile.permanent_address.region_id;
        newEditedProfile.permanent_province =
          profile.permanent_address.province_id;
        newEditedProfile.permanent_city = profile.permanent_address.city_id;
        newEditedProfile.permanent_barangay = profile.permanent_address.brgy_id;
        newEditedProfile.permanent_street =
          profile.permanent_address.street_address;
        newEditedProfile.permanent_postal_code =
          profile.permanent_address.zip_code;
      }
      if (profile.current_address) {
        newEditedProfile.current_region = profile.current_address.region_id;
        newEditedProfile.current_province = profile.current_address.province_id;
        newEditedProfile.current_city = profile.current_address.city_id;
        newEditedProfile.current_barangay = profile.current_address.brgy_id;
        newEditedProfile.current_street =
          profile.current_address.street_address;
        newEditedProfile.current_postal_code = profile.current_address.zip_code;
      }
    }

    setEditedProfile(newEditedProfile);
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
            email: editedProfile.email,
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
          requestedData = { physical_traits: editedProfile.physical_traits };
          break;
        case "education":
          requestedData = { education: editedProfile.education };
          break;
        default:
          throw new Error("Invalid section");
      }

      if (currentUser.is_crew === false) {
        const response = await UserService.updateUserProfile(
          editedProfile.id.toString(),
          requestedData,
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
        const response = await ProfileUpdateRequestService.submitUpdateRequest(
          editedProfile.id,
          editingSection,
          requestedData,
        );
        if (response.success) {
          setEditingSection(null);
          setEditedProfile(null);
          toast.success(
            "Profile update request submitted! Please wait for admin approval.",
          );
        } else {
          throw new Error(
            response.message || "Failed to submit update request",
          );
        }
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        toast.error("Please fix validation errors and try again");
      } else {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to save profile changes",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;
    setEditedProfile((prev) => ({ ...prev!, [field]: value }));
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string | number | null,
  ) => {
    if (!editedProfile) return;
    setEditedProfile((prev) => ({
      ...prev!,
      [parent]: { ...(prev![parent as keyof User] as any), [field]: value },
    }));
  };

  const handleProfileUpdate = (updatedProfile: User) =>
    setProfile(updatedProfile);

  const getImageUrl = (imagePath?: string | null): string | null => {
    if (!imagePath) return null;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${imagePath}`;
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!profile) return;
    if (currentUser?.is_crew === false) {
      const response = await UserService.uploadProfileImage(
        profile.id.toString(),
        file,
      );
      if (response.success && response.image_path) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                profile: {
                  ...(prev.profile ?? {}),
                  image_path: response.image_path,
                },
              }
            : prev,
        );
        toast.success("Profile image updated!");
      } else {
        throw new Error(response.message ?? "Upload failed");
      }
    } else {
      const response = await ProfileUpdateRequestService.submitImageRequest(
        profile.id,
        file,
      );
      if (response.success) {
        setHasPendingImage(true);
        toast.success(
          "Profile image request submitted. Waiting for admin approval.",
        );
      } else {
        throw new Error(response.message ?? "Failed to submit request");
      }
    }
  };

  const canEdit =
    currentUser?.is_crew === false || currentUser?.id === profile?.id;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-t-blue-400 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <i className="bi bi-person-circle text-blue-400 text-3xl"></i>
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-xl tracking-wide">
              Loading Crew Profile
            </p>
            <p className="text-blue-400 text-sm mt-1">Please wait…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-10">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-person-x-fill text-red-500 text-3xl"></i>
          </div>
          <p className="text-gray-800 font-bold text-xl">Profile Not Found</p>
          <p className="text-gray-400 text-sm mt-1">
            The requested crew profile could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16">
        {/* ════════════════════════════════════════════
            HERO BANNER
        ════════════════════════════════════════════ */}
        <div className="relative bg-[#0a1628] overflow-hidden">
          {/* Background texture */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'url("/home1.png")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
              {/* ── Avatar ───────────────────────────────────── */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                {/* Ring decoration */}
                <div className="absolute -inset-2 rounded-[22px] bg-gradient-to-br from-blue-400/30 via-cyan-400/20 to-transparent blur-sm"></div>
                <div className="relative rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl">
                  <AvatarUpload
                    displayName={
                      profile.profile?.full_name ||
                      profile.name ||
                      profile.email
                    }
                    imageUrl={getImageUrl(profile.profile?.image_path)}
                    onUpload={handleProfileImageUpload}
                    className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl"
                    readOnly={!canEdit}
                    pendingApproval={hasPendingImage}
                  />
                </div>
                {/* Status pill */}
                <div
                  className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg whitespace-nowrap border ${
                    hasPendingImage
                      ? "bg-amber-400 text-amber-900 border-amber-300"
                      : "bg-emerald-400 text-emerald-900 border-emerald-300"
                  }`}
                >
                  <i
                    className={`bi ${hasPendingImage ? "bi-hourglass-split" : "bi-shield-check"}`}
                  ></i>
                  {hasPendingImage ? "Photo Pending" : "Verified"}
                </div>
              </div>

              {/* ── Info ─────────────────────────────────────── */}
              <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                {/* Crew ID */}
                {profile.profile?.crew_id && (
                  <div className="inline-flex items-center gap-2 mb-3 bg-white/5 border border-white/10 rounded-full px-3.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-cyan-300 text-xs font-mono font-semibold tracking-widest">
                      CREW ID: {profile.profile.crew_id}
                    </span>
                  </div>
                )}

                {/* Name */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight mb-3">
                  {profile.profile?.full_name || profile.name || profile.email}
                </h1>

                {/* Badge row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/30 text-blue-200 text-sm font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                    <i className="bi bi-award-fill text-blue-300 text-xs"></i>
                    {profile.employment?.rank_name || "Rank not assigned"}
                  </span>
                  {profile.employment?.fleet_name && (
                    <span className="inline-flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-sm font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                      <i className="bi bi-ship text-cyan-300 text-xs"></i>
                      {profile.employment.fleet_name}
                    </span>
                  )}
                  {profile.profile?.company_name && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-500/20 border border-slate-400/20 text-slate-300 text-sm font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                      <i className="bi bi-building text-slate-400 text-xs"></i>
                      {profile.profile.company_name}
                    </span>
                  )}
                </div>

                {/* Quick info chips */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2">
                    <i className="bi bi-envelope-fill text-blue-400 text-xs"></i>
                    <span className="text-white/70 text-xs">
                      {profile.email}
                    </span>
                  </div>
                  {profile.profile?.nationality && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2">
                      <i className="bi bi-flag-fill text-emerald-400 text-xs"></i>
                      <span className="text-white/70 text-xs">
                        {profile.profile.nationality}
                      </span>
                    </div>
                  )}
                  {profile.profile?.civil_status && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2">
                      <i className="bi bi-heart-fill text-pink-400 text-xs"></i>
                      <span className="text-white/70 text-xs">
                        {profile.profile.civil_status}
                      </span>
                    </div>
                  )}
                  {profile.physical_traits?.blood_type && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2">
                      <i className="bi bi-droplet-fill text-red-400 text-xs"></i>
                      <span className="text-white/70 text-xs">
                        Blood Type: {profile.physical_traits.blood_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Tab Bar ───────────────────────────────────────────── */}
        <div className="sticky top-[92px] sm:top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-2 sm:px-6">
            <div className="flex">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-150 ${
                      isActive
                        ? `border-blue-600 ${item.color}`
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <i className={`bi ${item.icon} text-base sm:text-sm`}></i>
                    <span className="leading-none">
                      {item.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-28 md:pb-8">
          {/* Approval notice for crew */}
          {currentUser?.is_crew === true && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <i className="bi bi-shield-exclamation text-amber-500 flex-shrink-0"></i>
              <p className="text-amber-800 text-sm font-medium">
                Changes need admin approval before they take effect.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
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
                  ranks={ranks}
                  fleets={fleets}
                  companies={companies}
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
    </LocalizationProvider>
  );
}
