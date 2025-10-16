"use client";

import { useState, useMemo } from "react";
import { Shield, ShieldCheck, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminRole } from "@/services/admin-role";
import { motion, AnimatePresence } from "framer-motion";

interface AssignedRolesCardProps {
  assignedRoles: AdminRole[];
  onRemoveRole: (adminRoleId: number, roleName: string) => void;
  saving: boolean;
}

export default function AssignedRolesCard({
  assignedRoles,
  onRemoveRole,
  saving,
}: AssignedRolesCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredRoles = useMemo(() => {
    return assignedRoles.filter((adminRole) =>
      adminRole.role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assignedRoles, searchQuery]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
          Assigned Roles ({filteredRoles.length})
        </h2>
        {assignedRoles.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assigned roles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 min-h-[400px]">
        {assignedRoles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No roles assigned yet</p>
            <p className="text-sm mt-1">Select roles from the available list</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No roles found matching your search</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {paginatedRoles.map((adminRole) => (
                <div
                  key={adminRole.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <ShieldCheck className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {adminRole.role.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Assigned{" "}
                        {new Date(adminRole.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveRole(adminRole.id, adminRole.role.name)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
