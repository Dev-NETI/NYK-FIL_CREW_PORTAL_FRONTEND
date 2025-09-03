"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState({
    name: "Juan Miguel Santos",
    email: "jm.santos@nykfil.com",
    phone: "+63 917 123 4567",
    rank: "Second Engineer",
    vesselType: "Container Vessel",
    seamanBookNo: "SB-001234567",
    licenseNo: "COE-98765432",
    joinDate: "2019-03-15",
    nationality: "Filipino",
    homePort: "Manila, Philippines",
    bio: "Experienced marine engineer with 8+ years sailing experience on container and bulk carrier vessels.",
  });

  const [stats] = useState({
    voyagesCompleted: 47,
    seaTimeMonths: 96,
    yearsExperience: 8,
    certificationsValid: 12,
  });

  const [recentActivity] = useState([
    {
      action: "Completed medical examination",
      time: "2 hours ago",
      icon: "medical-bag",
    },
    {
      action: "Updated emergency contact info",
      time: "1 day ago",
      icon: "person-badge",
    },
    { action: "Renewed STCW certificate", time: "3 days ago", icon: "award" },
    {
      action: "Completed safety drill training",
      time: "1 week ago",
      icon: "shield-check",
    },
  ]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

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
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="lg:flex-1 text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                    {profile.name}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 mb-2 sm:mb-3">
                    {profile.rank}
                  </p>
                  <p className="text-lg sm:text-xl text-blue-200 mb-4 sm:mb-6">
                    {profile.vesselType}
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-geo-alt text-lg"></i>
                      <span>{profile.homePort}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-person-badge text-lg"></i>
                      <span>SB: {profile.seamanBookNo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="bi bi-calendar-event text-lg"></i>
                      <span>
                        Since {new Date(profile.joinDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-blue-100 mt-4 sm:mt-6 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
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
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-3xl mb-3 text-blue-600">
                <i className="bi bi-ship"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.voyagesCompleted}
              </div>
              <div className="text-sm text-gray-600">Voyages Completed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-3xl mb-3 text-cyan-600">
                <i className="bi bi-water"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.seaTimeMonths}
              </div>
              <div className="text-sm text-gray-600">Sea Time (Months)</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-3xl mb-3 text-teal-600">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.yearsExperience}
              </div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <div className="text-3xl mb-3 text-green-600">
                <i className="bi bi-award"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.certificationsValid}
              </div>
              <div className="text-sm text-gray-600">Valid Certificates</div>
            </div>
          </div>

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
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isEditing
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <i className="bi bi-x-lg mr-2"></i>Cancel
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil mr-2"></i>Edit Profile
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        {profile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        {profile.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nationality
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.nationality}
                        onChange={(e) =>
                          handleChange("nationality", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        {profile.nationality}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Port
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.homePort}
                        onChange={(e) =>
                          handleChange("homePort", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400"
                      />
                    ) : (
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        {profile.homePort}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rank/Position
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.rank}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vessel Type
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.vesselType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seaman Book No.
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.seamanBookNo}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      COE License No.
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {profile.licenseNo}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Employment
                    </label>
                    <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                      {new Date(profile.joinDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {isEditing && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:border-gray-400 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  )}

                  {isEditing && (
                    <div className="md:col-span-2 pt-4">
                      <button
                        onClick={handleSave}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      >
                        <i className="bi bi-check-lg mr-2"></i>Save Changes
                      </button>
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
                    <i className="bi bi-key mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-blue-600"></i>
                    <span className="font-medium">Change Password</span>
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
                    <i className="bi bi-headset mr-3 text-xl group-hover:scale-110 transition-transform duration-300 text-orange-600"></i>
                    <span className="font-medium">Crew Support</span>
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
