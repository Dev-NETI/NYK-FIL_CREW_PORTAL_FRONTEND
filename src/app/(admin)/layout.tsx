"use client";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AuthService } from "@/services/auth";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading user data from localStorage:", error);
      }
    };

    loadUserData();
  }, []);

  // Get user initials for avatar
  const getUserInitials = (user: any) => {
    if (!user) return "A";

    if (user.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "A";
  };

  // Get user display name
  const getUserDisplayName = (user: any) => {
    if (!user) return "Admin User";

    if (user.name) return user.name;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split("@")[0];

    return "Admin User";
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await AuthService.handleLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API fails
      AuthService.clearAuthData();
      window.location.href = "/login";
    }
  };
  return (
    <div
      className={`${poppins.variable} antialiased bg-gray-50 min-h-screen lg:flex`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-blue-900 shadow-2xl h-screen overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 lg:relative lg:sticky lg:top-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center">
            <Image
              src="/nykfil.png"
              alt="Logo"
              width={150}
              height={100}
              className="object-contain"
            />
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Dashboard
            </p>
          </div>

          <ul className="mt-2 space-y-1">
            <li>
              <Link
                href="/admin"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname === "/admin"
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-house-door mr-3"></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/crew"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/crew")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-people mr-3"></i>
                Crew Management
              </Link>
            </li>
            <li>
              <Link
                href="/admin/applications"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/applications")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-file-earmark-text mr-3"></i>
                Applications
              </Link>
            </li>
            <li>
              <Link
                href="/admin/job-descriptions"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/job-descriptions")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-file-earmark-check mr-3"></i>
                Job Descriptions
              </Link>
            </li>
            <li>
              <Link
                href="/admin/documents"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/documents")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-folder mr-3"></i>
                Documents
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reports"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/reports")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-graph-up mr-3"></i>
                Reports
              </Link>
            </li>
          </ul>

          <div className="px-6 py-3 mt-8">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Settings
            </p>
          </div>

          <ul className="mt-2 space-y-1">
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center px-6 py-3 transition-colors ${
                  pathname.startsWith("/admin/settings")
                    ? "bg-blue-700 text-white border-r-2 border-blue-300"
                    : "text-white hover:bg-blue-800 hover:text-blue-100"
                }`}
              >
                <i className="bi bi-gear mr-3"></i>
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full px-6 py-3 text-white hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i
                  className={`bi ${
                    isLoggingOut
                      ? "bi-arrow-clockwise animate-spin"
                      : "bi-box-arrow-right"
                  } mr-3`}
                ></i>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 lg:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-3"
              >
                <i
                  className={`bi ${sidebarOpen ? "bi-x" : "bi-list"} text-xl`}
                ></i>
              </button>
              <div>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
                  NYK-FIL APPLICATION
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                  <i>
                    Welcome back, {getUserDisplayName(currentUser)}! Here&apos;s
                    what&apos;s happening today.
                  </i>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <i className="bi bi-bell text-xl"></i>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials(currentUser)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {getUserDisplayName(currentUser)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        <footer className="bg-white shadow-sm px-4 lg:px-6 py-3">
          <div className="text-center text-xs text-gray-500">
            © 2025 NYK-TDG MBU. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
