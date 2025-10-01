"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services";
import { User } from "@/types/api";
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
  const router = useRouter();
  const resolvedParams = use(params);
  const crewId = resolvedParams.id;

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
    const loadCrewProfile = async () => {
      try {
        setLoading(true);

        // Try admin endpoint first
        try {
          const profileResponse = await UserService.getCrewProfile(crewId);
          if (profileResponse.success && profileResponse.user) {
            setProfile(profileResponse.user);
            return;
          }
        } catch (adminError) {
          console.warn(
            "Admin endpoint failed, trying alternative approach:",
            adminError
          );
        }

        // Fallback: Try the crew profile endpoint
        try {
          const profileResponse = await UserService.getUserProfile(crewId);
          if (profileResponse.success && profileResponse.user) {
            setProfile(profileResponse.user);
            return;
          }
        } catch (crewError) {
          console.warn("Crew profile endpoint failed:", crewError);
        }

        // If both fail, try to get crew from the crew list
        try {
          const crewListResponse = await UserService.getAllCrew();
          if (crewListResponse.success && crewListResponse.crew) {
            const crewMember = crewListResponse.crew.find(
              (c) => c.id.toString() === crewId
            );
            if (crewMember) {
              setProfile(crewMember);
              return;
            }
          }
        } catch (listError) {
          console.warn("Crew list endpoint failed:", listError);
        }

        toast.error("Failed to load crew profile");
      } catch (error) {
        console.error("Error loading crew profile:", error);
        toast.error("Failed to load crew profile data");
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    loadCrewProfile();
  }, [crewId]);

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
                {profile.employment?.hire_date || profile.hire_date
                  ? new Date(
                      profile.employment?.hire_date || profile.hire_date
                    ).getFullYear()
                  : "N/A"}
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
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                          <i className="bi bi-pencil mr-2"></i>
                          Edit Profile
                        </button>
                      </div>
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
                            profile.date_of_birth ||
                            profile.birth_date
                              ? new Date(
                                  profile.profile?.date_of_birth ||
                                    profile.date_of_birth ||
                                    profile.birth_date
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
                            {profile.blood_type || "Not provided"}
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
                              {profile.emergency_contact_number &&
                              profile.emergency_contact_relation
                                ? `${profile.emergency_contact_number} (${profile.emergency_contact_relation})`
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employment Information Tab */}
                  {activeTab === "employment" && (
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

                        <div className="mt-4 text-xs text-gray-500">
                          <p>
                            💡 <strong>Note:</strong> This shows sample
                            employment data. In a real application, this would
                            be fetched from the database.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Educational Background Tab */}
                  {activeTab === "education" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Educational Background
                      </h2>

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
                              {profile.higher_education_name || "Not provided"}
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
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group">
                    <i className="bi bi-pencil-square mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-blue-600"></i>
                    <span className="font-medium">Edit Profile</span>
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
