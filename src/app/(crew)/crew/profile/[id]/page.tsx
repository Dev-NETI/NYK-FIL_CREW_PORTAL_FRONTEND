"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
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
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const resolvedParams = use(params);
  const crewId = resolvedParams.id;

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
        const canAccess =
          currentUserData.crew_id === crewId || currentUserData.is_crew === 0; // Admin or own profile
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
    <div className="min-h-screen ">
      <Navigation currentPath="/profile" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div
            className={`bg-gradient-to-r from-blue-700 to-cyan-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-1000 mb-8 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
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
                    {profile.name || profile.email}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 mb-2 sm:mb-3">
                    {profile.rank_name || "Not assigned"}
                  </p>
                  <p className="text-lg sm:text-xl text-blue-200 mb-4 sm:mb-6">
                    {profile.crew_id
                      ? `Crew ID: ${profile.crew_id}`
                      : "No crew assignment"}
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-envelope text-lg"></i>
                      <span>{profile.email}</span>
                    </div>
                    {profile.fleet_name && (
                      <div className="flex items-center space-x-2">
                        <i className="bi bi-ship text-lg"></i>
                        <span>Fleet: {profile.fleet_name}</span>
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
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform transition-all duration-1000 delay-300 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Seafarer Profile
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.first_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.middle_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.last_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Crew ID
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.crew_id || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
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
                      User Role
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.is_crew === 1 ? "Crew Member" : "Administrator"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fleet ID
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.fleet_name || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rank
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.rank_name || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Login
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.last_login_at
                        ? new Date(profile.last_login_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Never"}
                    </p>
                  </div>
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
    </div>
  );
}
