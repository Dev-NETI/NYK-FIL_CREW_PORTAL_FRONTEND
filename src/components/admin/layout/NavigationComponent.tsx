"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthService } from "@/services/auth";
import { useUser } from "@/hooks/useUser";
import { useUnreadCount } from "@/contexts/UnreadCountContext";

interface NavigationComponentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function NavigationComponent({
  sidebarOpen,
  setSidebarOpen,
}: NavigationComponentProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [maintenanceDropdownOpen, setMaintenanceDropdownOpen] = useState(false);
  const [generalSettingsDropdownOpen, setGeneralSettingsDropdownOpen] =
    useState(false);
  const { unreadCount } = useUnreadCount();

  // Helper function to check if user has a specific role
  const hasRole = (roleName: string) => {
    if (!user || !user.admin_roles) return false;
    return user.admin_roles.some(
      (adminRole: any) =>
        adminRole.role_name?.toLowerCase() === roleName.toLowerCase()
    );
  };


  // Navigation links array for easy management
  const navigationLinks = [
    {
      href: "/admin",
      icon: "bi-house-door",
      label: "Dashboard",
      isActive: pathname === "/admin",
      requiredRole: "Dashboard",
    },
    {
      href: "/admin/crew",
      icon: "bi-people",
      label: "Crew Management",
      isActive: pathname.startsWith("/admin/crew"),
      requiredRole: "Crew Management",
    },
    {
      href: "/admin/documents",
      icon: "bi-folder",
      label: "Documents",
      isActive: pathname.startsWith("/admin/documents"),
      requiredRole: "Document Approval",
    },
    {
      href: "/admin/chat",
      icon: "bi-chat-dots",
      label: "Chat",
      isActive: pathname.startsWith("/admin/chat"),
      requiredRole: "Inquiries",
    },
    {
      href: "/admin/reports",
      icon: "bi-graph-up",
      label: "Reports",
      isActive: pathname.startsWith("/admin/reports"),
      requiredRole: "Reports",
    },
    {
      href: "/admin/appointment",
      icon: "bi-calendar-event",
      label: "Appointments",
      isActive: pathname.startsWith("/admin/appointment"),
      requiredRole: 'Appointments',
    },
    {
      href: "/admin/qr-scanner",
      icon: "bi-qr-code-scan",
      label: "Qr Scanner",
      isActive: pathname.startsWith("/admin/qr-scanner"),
      requiredRole: 'Qr Scanner',
    },
  ].filter((link) => hasRole(link.requiredRole));

  // General Settings sub-items
  const generalSettingsItems = [
    {
      href: "/admin/programs",
      icon: "bi-building",
      label: "Programs",
    },
    {
      href: "/admin/settings/general/appearance",
      icon: "bi-palette",
      label: "Appearance & Theme",
    },
    {
      href: "/admin/settings/general/notifications",
      icon: "bi-bell",
      label: "Notification Settings",
    },
    {
      href: "/admin/settings/general/email",
      icon: "bi-envelope",
      label: "Email Configuration",
    },
    {
      href: "/admin/settings/general/security",
      icon: "bi-shield-check",
      label: "Security Settings",
    },
  ];

  // Maintenance dropdown items
  const maintenanceItems = [
    {
      href: "/admin/settings/general",
      icon: "bi-gear",
      label: "General Settings",
      hasSubItems: true,
      requiredRole: "General Settings",
    },
    {
      href: "/admin/user-management",
      icon: "bi-person-gear",
      label: "User Management",
      requiredRole: "User Management",
    },
    {
      href: "/admin/settings/system",
      icon: "bi-server",
      label: "System Settings",
      requiredRole: "System Settings",
    },
    {
      href: "/admin/settings/backup",
      icon: "bi-cloud-download",
      label: "Backup & Restore",
      requiredRole: "Backup & Restore",
    },
  ].filter((item) => hasRole(item.requiredRole));

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
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-blue-900 shadow-2xl h-screen overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 lg:sticky lg:top-0 ${
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
          <div className="px-6 py-3 bg-white">
            <p className="text-xs font-semibold text-black uppercase tracking-wider justify-center text-center">
              Technical Panel
            </p>
          </div>
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Dashboard
            </p>
          </div>

          <ul className="mt-2 space-y-1">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center justify-between px-6 py-3 transition-colors ${
                    link.isActive
                      ? "bg-blue-700 text-white border-r-2 border-blue-300"
                      : "text-white hover:bg-blue-800 hover:text-blue-100"
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`bi ${link.icon} mr-3`}></i>
                    {link.label}
                  </div>
                  {link.label === "Chat" && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-6 py-3 mt-8">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Maintenance
            </p>
          </div>

          <ul className="mt-2 space-y-1">
            {maintenanceItems.length > 0 && (
              <li>
                <button
                  onClick={() =>
                    setMaintenanceDropdownOpen(!maintenanceDropdownOpen)
                  }
                  className="flex items-center justify-between w-full px-6 py-3 text-white hover:bg-blue-800 hover:text-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <i className="bi bi-tools mr-3"></i>
                    Maintenance
                  </div>
                  <i
                    className={`bi ${
                      maintenanceDropdownOpen
                        ? "bi-chevron-up"
                        : "bi-chevron-down"
                    } text-sm`}
                  ></i>
                </button>

                {maintenanceDropdownOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {maintenanceItems.map((item) => (
                      <li key={item.href}>
                        {item.hasSubItems ? (
                          <div>
                            <button
                              onClick={() =>
                                setGeneralSettingsDropdownOpen(
                                  !generalSettingsDropdownOpen
                                )
                              }
                              className="flex items-center justify-between w-full px-6 py-2 text-sm text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
                            >
                              <div className="flex items-center">
                                <i className={`bi ${item.icon} mr-3`}></i>
                                {item.label}
                              </div>
                              <i
                                className={`bi ${
                                  generalSettingsDropdownOpen
                                    ? "bi-chevron-up"
                                    : "bi-chevron-down"
                                } text-xs`}
                              ></i>
                            </button>

                            {generalSettingsDropdownOpen && (
                              <ul className="ml-6 mt-1 space-y-1">
                                {generalSettingsItems.map((subItem) => (
                                  <li key={subItem.href}>
                                    <Link
                                      href={subItem.href}
                                      className={`flex items-center px-6 py-2 text-xs transition-colors ${
                                        pathname.startsWith(subItem.href)
                                          ? "bg-blue-500 text-white border-r-2 border-blue-300"
                                          : "text-blue-300 hover:bg-blue-600 hover:text-white"
                                      }`}
                                    >
                                      <i
                                        className={`bi ${subItem.icon} mr-3`}
                                      ></i>
                                      {subItem.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className={`flex items-center px-6 py-2 text-sm transition-colors ${
                              pathname.startsWith(item.href)
                                ? "bg-blue-600 text-white border-r-2 border-blue-300"
                                : "text-blue-200 hover:bg-blue-700 hover:text-white"
                            }`}
                          >
                            <i className={`bi ${item.icon} mr-3`}></i>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
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
    </>
  );
}
