import { Admin } from "@/services/admin-management";

interface UserInfoCardProps {
  admin: Admin;
}

export default function UserInfoCard({ admin }: UserInfoCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
          {admin.profile?.firstname?.charAt(0) ||
            admin.email.charAt(0).toUpperCase()}
          {admin.profile?.lastname?.charAt(0) || ""}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Assign Roles</h1>
          <p className="text-gray-600 mt-1">
            {admin.profile?.full_name || admin.email}
          </p>
          <p className="text-sm text-gray-500">{admin.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            {admin.department?.name || "No Department"}
          </p>
        </div>
      </div>
    </div>
  );
}
