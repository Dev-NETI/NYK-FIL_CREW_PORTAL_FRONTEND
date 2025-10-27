"use client";
import { Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import NavigationComponent from "@/components/admin/layout/NavigationComponent";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <UnreadCountProvider userId={currentUser?.id || null}>
      <div
        className={`${poppins.variable} antialiased bg-gray-50 min-h-screen lg:flex`}
      >
        <NavigationComponent
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

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
          <div className="overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          <footer className="bg-white shadow-sm px-4 lg:px-6 py-3">
            <div className="text-center text-xs text-gray-500">
              © 2025 NYK-TDG MBU. All rights reserved.
            </div>
          </footer>
        </main>
      </div>
    </UnreadCountProvider>
  );
}
