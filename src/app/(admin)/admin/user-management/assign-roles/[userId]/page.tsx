"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminManagementService, Admin } from "@/services/admin-management";
import { RoleService, Role } from "@/services/role";
import { AdminRoleService, AdminRole } from "@/services/admin-role";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import UserInfoCard from "@/components/admin/user-management/assign-roles/UserInfoCard";
import RoleSummaryCard from "@/components/admin/user-management/assign-roles/RoleSummaryCard";
import AssignedRolesCard from "@/components/admin/user-management/assign-roles/AssignedRolesCard";
import AvailableRolesCard from "@/components/admin/user-management/assign-roles/AvailableRolesCard";

export default function AssignRolesPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.userId as string);

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<AdminRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load admin data, all roles, and assigned roles
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load admin details
      const admin = await AdminManagementService.getAdmin(userId);
      setAdmin(admin);

      // Load all available roles
      const rolesData = await RoleService.getAll();
      setAllRoles(rolesData);

      // Load assigned roles for this user
      try {
        const assignedData = await AdminRoleService.getByUserId(userId);
        // Ensure assignedData is an array
        const roles = Array.isArray(assignedData) ? assignedData : [];
        setAssignedRoles(roles);

        // Calculate available roles (roles not yet assigned)
        const assignedRoleIds = roles.map((ar) => ar.role_id);
        const available = rolesData.filter(
          (role) => !assignedRoleIds.includes(role.id)
        );
        setAvailableRoles(available);
      } catch (error: any) {
        // If 404 or any error, user has no roles yet
        console.log("No roles assigned yet:", error);
        setAssignedRoles([]);
        setAvailableRoles(rolesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (roleId: number) => {
    try {
      setSaving(true);
      const response = await AdminRoleService.store({
        user_id: userId,
        role_id: roleId,
      });

      if (response.success) {
        toast.success(response.message || "Role assigned successfully");
        await loadData(); // Reload data to update lists
      } else {
        toast.error(response.message || "Failed to assign role");
      }
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error(error.response?.data?.message || "Failed to assign role");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (adminRoleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to remove the "${roleName}" role?`)) {
      return;
    }

    try {
      setSaving(true);
      const response = await AdminRoleService.destroy(adminRoleId);

      if (response.success) {
        toast.success(response.message || "Role removed successfully");
        await loadData(); // Reload data to update lists
      } else {
        toast.error(response.message || "Failed to remove role");
      }
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error(error.response?.data?.message || "Failed to remove role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role data...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Admin user not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to User Management
            </button>

            <UserInfoCard admin={admin} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvailableRolesCard
              availableRoles={availableRoles}
              onAssignRole={handleAssignRole}
              saving={saving}
            />
            <AssignedRolesCard
              assignedRoles={assignedRoles}
              onRemoveRole={handleRemoveRole}
              saving={saving}
            />
          </div>

          <RoleSummaryCard
            admin={admin}
            assignedCount={assignedRoles.length}
            totalCount={allRoles.length}
          />
        </div>
      </div>
    </div>
  );
}
