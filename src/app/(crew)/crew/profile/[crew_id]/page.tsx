"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightFromLine,
  HelpCircle,
  KeyRound,
  MailIcon,
} from "lucide-react";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { UserService } from "@/services";
import { AuthService } from "@/services";
import { User } from "@/types/api";
import toast from "react-hot-toast";

interface ProfilePageProps {
  params: Promise<{
    crew_id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();
  const resolvedParams = use(params);
  const crewId = resolvedParams.crew_id;

  // Sample employment data
  const sampleEmploymentData = [
    {
      id: 1,
      program: "NTMA_CADETSHIP",
      programDisplay: "NTMA CADETSHIP",
      batch: "BATCH 2025",
      dateJoined: "2024-01-15",
      status: "Active",
    },
    {
      id: 2,
      program: "OJT_PROGRAM",
      programDisplay: "OJT Program",
      batch: "BATCH 2024",
      dateJoined: "2023-06-10",
      status: "Completed",
    },
  ];

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
        const currentUserCrewId =
          currentUserData.profile?.crew_id || currentUserData.crew_id;
        const canAccess =
          currentUserCrewId === crewId || currentUserData.is_crew === 0; // Admin or own profile
        if (!canAccess) {
          toast.error("You are not authorized to view this profile");
          router.push("/crew/home");
          return;
        }

        // Load profile data
        const profileResponse = await UserService.getUserProfile(crewId);
        if (profileResponse.success && profileResponse.user) {
          setProfile(profileResponse.user);
        } else {
          toast.error(profileResponse.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    initializePage();
  }, [crewId, router]);

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
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
                      {profile.profile?.full_name || profile.name
                        ? (profile.profile?.full_name || profile.name)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : profile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="lg:flex-1 text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                    {profile.profile?.full_name ||
                      profile.name ||
                      profile.email}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 mb-2 sm:mb-3">
                    {profile.employment?.rank_name ||
                      profile.rank_name ||
                      "Not assigned"}
                  </p>
                  <p className="text-lg sm:text-xl text-blue-200 mb-4 sm:mb-6">
                    {profile.profile?.crew_id || profile.crew_id
                      ? `Crew ID: ${
                          profile.profile?.crew_id || profile.crew_id
                        }`
                      : "No crew assignment"}
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-blue-100">
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
          ></div>

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
                    className="flex space-x-8 px-6 sm:px-8"
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
                      Educational Background
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 sm:p-8">
                  {/* Basic Information Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Basic Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.last_name ||
                              profile.last_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.first_name ||
                              profile.first_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Middle Name
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.middle_name ||
                              profile.middle_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Suffix
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.suffix ||
                              profile.suffix ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nationality
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.nationality || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.gender ||
                              profile.gender ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Civil Status
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.civil_status || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Birth Date
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.profile?.date_of_birth ||
                            profile.birth_date ||
                            profile.date_of_birth
                              ? new Date(
                                  profile.profile?.date_of_birth ||
                                    profile.birth_date ||
                                    profile.date_of_birth
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Birth Place
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.birth_place || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Blood Type
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.physical_traits?.blood_type ||
                              profile.blood_type ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Religion
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.religion || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Physical Traits Tab */}
                  {activeTab === "physical" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Physical Traits
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Height (cm)
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.physical_traits?.height || profile.height
                              ? `${
                                  profile.physical_traits?.height ||
                                  profile.height
                                } cm`
                              : "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.physical_traits?.weight || profile.weight
                              ? `${
                                  profile.physical_traits?.weight ||
                                  profile.weight
                                } kg`
                              : "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Eyes (Color)
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.physical_traits?.eye_color ||
                              profile.eye_color ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Hair (Color)
                          </label>
                          <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            {profile.physical_traits?.hair_color ||
                              profile.hair_color ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Tab */}
                  {activeTab === "contact" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Contact Information
                      </h2>

                      {/* Mailing/Permanent Address Section */}
                      <div className="bg-blue-50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Mailing Address / Permanent Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Region
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_region || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Province
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_province || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City/Municipality
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_city || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Subdivision/Barangay
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_barangay || "Not provided"}
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Building Name, Floor, Unit Number, Street Name
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_street || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Postal Code
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.permanent_postal_code || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Address Section */}
                      <div className="bg-green-50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Region
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_region || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Province
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_province || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City/Municipality
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_city || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Subdivision/Barangay
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_barangay || "Not provided"}
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Building Name, Floor, Unit Number, Street Name
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_street || "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Postal Code
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contact_postal_code || "Not provided"}
                            </p>
                          </div>
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
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.email}
                              {profile.email_verified_at && (
                                <span className="ml-2 text-green-600 text-sm">
                                  ✓ Verified
                                </span>
                              )}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mobile No.
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {profile.contacts?.mobile_number ||
                                profile.mobile_number ||
                                "Not provided"}
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Emergency Contact (Mobile No., Relation to
                              Seafarer)
                            </label>
                            <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                              {(profile.contacts?.emergency_contact_phone ||
                                profile.emergency_contact_number) &&
                              (profile.contacts
                                ?.emergency_contact_relationship ||
                                profile.emergency_contact_relation)
                                ? `${
                                    profile.contacts?.emergency_contact_phone ||
                                    profile.emergency_contact_number
                                  } (${
                                    profile.contacts
                                      ?.emergency_contact_relationship ||
                                    profile.emergency_contact_relation
                                  })`
                                : profile.contacts?.emergency_contact_name
                                ? `${
                                    profile.contacts.emergency_contact_name
                                  } - ${
                                    profile.contacts.emergency_contact_phone ||
                                    "No phone"
                                  }`
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employment Information Tab */}
                  {activeTab === "employment" && (
                    <div>
                      {profile.employment ? (
                        <div className="space-y-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Employment Information
                          </h2>

                          {/* Current Employment Details */}
                          <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Current Employment
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Fleet
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.fleet_name ||
                                    "Not assigned"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Rank
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.rank_name ||
                                    "Not assigned"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Crew Status
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      profile.employment.crew_status ===
                                      "on_board"
                                        ? "bg-green-100 text-green-800"
                                        : profile.employment.crew_status ===
                                          "on_vacation"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {profile.employment.crew_status
                                      ?.replace("_", " ")
                                      .toUpperCase() || "Not assigned"}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Hire Status
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.hire_status
                                    ?.replace("_", " ")
                                    .toUpperCase() || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Hire Date
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.hire_date
                                    ? new Date(
                                        profile.employment.hire_date
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Basic Salary
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.basic_salary
                                    ? `$${profile.employment.basic_salary.toLocaleString()}`
                                    : "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="bg-green-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Travel Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Passport Number
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.passport_number ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Passport Expiry
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.passport_expiry
                                    ? new Date(
                                        profile.employment.passport_expiry
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Seaman Book Number
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.seaman_book_number ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Seaman Book Expiry
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.employment.seaman_book_expiry
                                    ? new Date(
                                        profile.employment.seaman_book_expiry
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {profile.employment.employment_notes && (
                            <div className="bg-yellow-50 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Notes
                              </h3>
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.employment.employment_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Fallback to old employment structure */
                        <div className="space-y-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Employment Information
                          </h2>

                          <div className="bg-purple-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Employment History
                            </h3>

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
                                      Date Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {sampleEmploymentData.map((employment) => (
                                    <tr
                                      key={employment.id}
                                      className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-3 w-3 bg-blue-600 rounded-full mr-3"></div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {employment.programDisplay}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {employment.batch}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(
                                          employment.dateJoined
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            employment.status === "Active"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {employment.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Available Programs
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  NTMA CADETSHIP
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  NYK-PMMA Cadetship
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  OJT Program
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Maritime Ratings Program (MRP)
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  ETO Development Program (EDP)
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Deck Cadet Program
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Engine Cadet Program
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Galley Rating Program
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Able Seaman Program
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                              <p>
                                💡 <strong>Note:</strong> This shows sample
                                employment data. In a real application, this
                                would be fetched from the database.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Educational Background Tab - Updated */}
                  {activeTab === "education" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Educational Background
                      </h2>

                      {/* New Education Structure */}
                      {profile.education && (
                        <div className="bg-blue-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                            Primary Education
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Degree
                              </label>
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.education.degree || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Field of Study
                              </label>
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.education.field_of_study ||
                                  "Not provided"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date Graduated
                              </label>
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.education.date_graduated
                                  ? new Date(
                                      profile.education.date_graduated
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                    })
                                  : "Not provided"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Education Level
                              </label>
                              <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                {profile.education.education_level
                                  ?.replace("_", " ")
                                  .toUpperCase() || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {profile.education?.certifications && (
                        <div className="bg-green-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                            Certifications
                          </h3>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-gray-900 whitespace-pre-line">
                              {profile.education.certifications}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Additional Training */}
                      {profile.education?.additional_training && (
                        <div className="bg-purple-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                            Additional Training
                          </h3>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-gray-900">
                              {profile.education.additional_training}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Fallback to old structure if new structure doesn't exist */}
                      {!profile.education && (
                        <div className="space-y-6">
                          {/* High School Section */}
                          <div className="bg-green-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                              High School
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  School Name
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.highschool_name || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Date Graduated
                                </label>
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
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  School Name
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.college_name || "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Degree Earned
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.college_degree || "Not provided"}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Date Graduated
                                </label>
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
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  School Name
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.higher_education_name ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Degree Earned
                                </label>
                                <p className="text-gray-900 py-3 px-4 bg-white rounded-xl border border-gray-200">
                                  {profile.higher_education_degree ||
                                    "Not provided"}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Date Graduated
                                </label>
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
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-blue-600 mt-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  Educational Timeline
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  This section shows the educational progression
                                  from high school through higher education.
                                  Each level builds upon the previous one to
                                  create a comprehensive academic profile.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-green-600 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Data Structure Updated
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              This page now displays data from the new
                              normalized database structure, providing better
                              organization and security for user information.
                            </p>
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
              {/* Quick Actions */}
              <div
                className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-1000 delay-400 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Crew Services
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-file-earmark-medical mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-green-600"></i>
                    <span className="font-medium">Medical Records</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-award mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-purple-600"></i>
                    <span className="font-medium">Certificates</span>
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-headset mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-orange-600"></i>
                    <span className="font-medium">Crew Support</span>
                  </button>
                  <button className="md:hidden w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group gap-3">
                    <ArrowRightFromLine className="text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>

              <div
                className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-1000 delay-400 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Support
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group gap-3">
                    <HelpCircle className="text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Inquiry</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <FeedbackDialog />
                </div>
              </div>

              <div
                className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-1000 delay-400 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Settings
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group gap-3">
                    <KeyRound className="text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Change Password</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group gap-3">
                    <MailIcon className="text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Change Email</span>
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
  );
}
