"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminManagementService, Admin } from "@/services/admin-management";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import AdminCardComponent from "@/components/admin/user-management/AdminCardComponent";
import AdminListComponent from "@/components/admin/user-management/AdminListComponent";

export default function UserManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load admin data from API
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await AdminManagementService.getAllAdmins();

      if (response.success && response.data) {
        setAdmins(response.data);
        toast.success("Admin data loaded successfully");
      } else {
        toast.error(response.message || "Failed to load admin data");
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Get unique departments for statistics
  const departments = useMemo(() => {
    const deptSet = new Set(admins.map((admin) => admin.department.name));
    return Array.from(deptSet);
  }, [admins]);

  const handleEdit = (admin: Admin) => {
    // TODO: Implement edit functionality
    console.log("Edit admin:", admin);
    toast("Edit functionality coming soon", { icon: "ℹ️" });
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Are you sure you want to delete admin account: ${email}?`)) {
      return;
    }

    try {
      const response = await AdminManagementService.deleteAdmin(id);
      if (response.success) {
        toast.success("Admin deleted successfully");
        loadAdminData();
      } else {
        toast.error(response.message || "Failed to delete admin");
      }
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className={`mb-6 sm:mb-8 transform transition-all duration-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage administrator accounts and permissions
                </p>
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div
            className={`grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 transform transition-all duration-1000 delay-200 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <AdminCardComponent
              title="Total Admins"
              value={admins.length}
              description="All administrators"
              icon="👥"
              valueColor="text-gray-900"
            />
            <AdminCardComponent
              title="Departments"
              value={departments.length}
              description="Active departments"
              icon="🏢"
              valueColor="text-blue-600"
            />
          </div>

          {/* Admin List with Filter and Table */}
          <div
            className={`transform transition-all duration-1000 delay-400 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <AdminListComponent
              admins={admins}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
