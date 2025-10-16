import { ShieldCheck } from "lucide-react";
import { Admin } from "@/services/admin-management";

interface RoleSummaryCardProps {
  admin: Admin;
  assignedCount: number;
  totalCount: number;
}

export default function RoleSummaryCard({
  admin,
  assignedCount,
  totalCount,
}: RoleSummaryCardProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
      <div className="flex items-start">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900">
            Role Assignment Summary
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {admin.profile?.full_name || admin.email} has {assignedCount}{" "}
            role(s) assigned out of {totalCount} available roles.
          </p>
        </div>
      </div>
    </div>
  );
}
