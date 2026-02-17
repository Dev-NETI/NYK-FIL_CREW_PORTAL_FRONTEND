"use client";

import { useState, useEffect } from "react";
import {
  CrewCertificateApprovalService,
  CrewCertificateUpdate,
} from "@/services/crew-certificate-approval";
import toast from "react-hot-toast";
import { Award, AlertCircle } from "lucide-react";
import PendingUpdatesTable from "@/components/admin/documents/certificate-approvals/PendingUpdatesTable";
import ApprovalModal from "@/components/admin/documents/certificate-approvals/ApprovalModal";

export default function CertificateApprovalsPage() {
  const [updates, setUpdates] = useState<CrewCertificateUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] =
    useState<CrewCertificateUpdate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  useEffect(() => {
    loadUpdates();
  }, [filter]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const data =
        filter === "pending"
          ? await CrewCertificateApprovalService.getPendingUpdates()
          : await CrewCertificateApprovalService.getAllUpdates();

      const filtered =
        filter === "all" ? data : data.filter((u) => u.status === filter);

      setUpdates(filtered);
    } catch (error) {
      console.error("Error loading updates:", error);
      toast.error("Failed to load update requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUpdate = (update: CrewCertificateUpdate) => {
    setSelectedUpdate(update);
    setShowModal(true);
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await CrewCertificateApprovalService.approve(id);
      if (response.success) {
        toast.success(response.message);
        setShowModal(false);
        await loadUpdates();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve update");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      const response = await CrewCertificateApprovalService.reject(id, {
        rejection_reason: reason,
      });
      if (response.success) {
        toast.success(response.message);
        setShowModal(false);
        await loadUpdates();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject update");
    }
  };

  const pendingCount = updates.filter((u) => u.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval requests...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Award className="w-8 h-8 mr-3 text-blue-600" />
                  Certificate Approvals
                </h1>
                <p className="mt-2 text-gray-600">
                  Review and approve crew certificate update requests
                </p>
              </div>
              {pendingCount > 0 && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-4 py-2 flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    {pendingCount} pending{" "}
                    {pendingCount === 1 ? "request" : "requests"}
                  </span>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "pending", label: "Pending" },
                  { key: "all", label: "All" },
                  { key: "approved", label: "Approved" },
                  { key: "rejected", label: "Rejected" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`${
                      filter === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Updates Table */}
          <PendingUpdatesTable
            updates={updates}
            onViewUpdate={handleViewUpdate}
          />
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedUpdate && (
        <ApprovalModal
          update={selectedUpdate}
          onClose={() => setShowModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
