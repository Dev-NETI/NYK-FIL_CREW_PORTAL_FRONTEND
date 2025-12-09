"use client";

import { useState, useEffect } from "react";
import { ProfileUpdateRequestService, ProfileUpdateRequest } from "@/services/profile-update-request";
import toast from "react-hot-toast";
import { UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ProfileUpdateApprovalsPage() {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProfileUpdateRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await ProfileUpdateRequestService.getPendingRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        toast.error(response.message || "Failed to load requests");
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load profile update requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: ProfileUpdateRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setRejectionReason("");
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true);
      const response = await ProfileUpdateRequestService.approveRequest(id);
      if (response.success) {
        toast.success("Profile update request approved successfully!");
        setShowModal(false);
        await loadRequests();
      } else {
        toast.error(response.message || "Failed to approve request");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      const response = await ProfileUpdateRequestService.rejectRequest(id, rejectionReason);
      if (response.success) {
        toast.success("Profile update request rejected");
        setShowModal(false);
        await loadRequests();
      } else {
        toast.error(response.message || "Failed to reject request");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case "basic": return "Basic Information";
      case "contact": return "Contact Information";
      case "physical": return "Physical Traits";
      case "education": return "Education Information";
      default: return section;
    }
  };

  const formatChanges = (current: any, requested: any) => {
    const changes: string[] = [];
    
    // Basic comparison of objects
    const compareObjects = (curr: any, req: any, prefix = "") => {
      if (!req) return;
      
      Object.keys(req).forEach(key => {
        if (typeof req[key] === 'object' && req[key] !== null) {
          compareObjects(curr?.[key], req[key], prefix + key + ".");
        } else if (curr?.[key] !== req[key]) {
          changes.push(`${prefix}${key}: "${curr?.[key] || 'N/A'}" → "${req[key]}"`);
        }
      });
    };

    compareObjects(current, requested);
    return changes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile update requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Update Approvals
              </h1>
            </div>
            <p className="text-gray-600">
              Review and approve crew member profile update requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {requests.length}
                  </p>
                  <p className="text-gray-600">Pending Requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Profile Update Requests
              </h3>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Pending Requests
                </h3>
                <p className="text-gray-600">
                  All profile update requests have been processed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crew Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {(request.crew?.profile?.full_name || request.crew?.name || request.crew?.email)
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "?"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.crew?.profile?.full_name || request.crew?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.crew?.profile?.crew_id ? `ID: ${request.crew.profile.crew_id}` : request.crew?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {getSectionLabel(request.section)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            ></div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-50">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Profile Update Request - {getSectionLabel(selectedRequest.section)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  >
                    <span className="sr-only">Close</span>
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Crew Member</h4>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.crew?.profile?.full_name || selectedRequest.crew?.name} 
                    {selectedRequest.crew?.profile?.crew_id && ` (ID: ${selectedRequest.crew.profile.crew_id})`}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Changes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {formatChanges(selectedRequest.current_data, selectedRequest.requested_data).length > 0 ? (
                      formatChanges(selectedRequest.current_data, selectedRequest.requested_data).map((change, index) => (
                        <div key={index} className="text-sm text-gray-800 mb-1 font-mono">
                          {change}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No specific changes detected</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}