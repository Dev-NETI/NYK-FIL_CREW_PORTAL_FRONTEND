"use client";

import { useState } from "react";

interface JobDescriptionForApproval {
  id: string;
  crewName: string;
  crewId: string;
  rank: string;
  purpose: string;
  visaType?: string;
  requestDate: string;
  processedDate: string;
  processedBy: string;
  memoNo: string;
  pdfData: {
    memoNo: string;
    purpose: string;
    crewName: string;
    crewId: string;
  };
  status: "ready_for_approval" | "approved" | "disapproved";
  vpComments?: string;
  disapprovalReason?: string;
}

export default function VPApprovalPage() {
  const [requests] = useState<JobDescriptionForApproval[]>([
    {
      id: "JD-003",
      crewName: "Pedro Reyes",
      crewId: "NYC-2024-003",
      rank: "Engine Cadet",
      purpose: "PHILHEALTH",
      requestDate: "2025-01-13",
      processedDate: "2025-01-15",
      processedBy: "EA Admin",
      memoNo: "NYK-JD-2025-003",
      status: "ready_for_approval",
      pdfData: {
        memoNo: "NYK-JD-2025-003",
        purpose: "PhilHealth Application",
        crewName: "Pedro Reyes",
        crewId: "NYC-2024-003",
      },
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_for_approval":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "disapproved":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VP Job Description Approval</h1>
          <p className="text-gray-600">Review and approve job description documents</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-purple-600">
              {requests.filter(r => r.status === "ready_for_approval").length}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready for Approval</p>
              <p className="text-3xl font-bold text-purple-600">
                {requests.filter(r => r.status === "ready_for_approval").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="bi bi-eye text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved This Week</p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="bi bi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Processing Time</p>
              <p className="text-3xl font-bold text-blue-600">2.1</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="bi bi-clock text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Job Description Documents for Review</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crew Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{request.memoNo}</p>
                      <p className="text-sm text-gray-600">
                        Purpose: {request.purpose}
                        {request.visaType && ` - ${request.visaType}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{request.crewName}</p>
                      <p className="text-sm text-gray-600">{request.crewId}</p>
                      <p className="text-sm text-gray-600">{request.rank}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">
                        Processed: {new Date(request.processedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">By: {request.processedBy}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status === "ready_for_approval" && <i className="bi bi-eye mr-1"></i>}
                      {request.status === "approved" && <i className="bi bi-check-circle mr-1"></i>}
                      {request.status === "disapproved" && <i className="bi bi-x-circle mr-1"></i>}
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {request.status === "ready_for_approval" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            <i className="bi bi-check-circle mr-1"></i>
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            <i className="bi bi-x-circle mr-1"></i>
                            Disapprove
                          </button>
                        </>
                      )}
                      <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200 transition-colors">
                        <i className="bi bi-file-earmark-pdf mr-1"></i>
                        View PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}