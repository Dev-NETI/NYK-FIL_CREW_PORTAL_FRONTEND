import { Admin } from "@/services/admin-management";
import { Mail, Building2, Calendar, Edit, Trash2 } from "lucide-react";

interface AdminListItemProps {
  admin: Admin;
  onEdit?: (admin: Admin) => void;
  onDelete?: (id: number, email: string) => void;
}

export default function AdminListItemComponent({
  admin,
  onEdit,
  onDelete,
}: AdminListItemProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {admin.profile.firstname.charAt(0)}
              {admin.profile.lastname.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {admin.profile.full_name}
            </div>
            <div className="text-sm text-gray-500">ID: {admin.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          {admin.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-900">
            {admin.department.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {admin.last_login_at ? (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {new Date(admin.last_login_at).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-gray-400">Never</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(admin)}
              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(admin.id, admin.email)}
              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
