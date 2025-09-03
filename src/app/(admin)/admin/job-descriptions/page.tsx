"use client";

import { useState } from "react";

interface JobDescriptionRequest {
  id: string;
  crewName: string;
  crewId: string;
  rank: string;
  purpose: string;
  visaType?: string;
  notes?: string;
  status:
    | "pending"
    | "in_progress"
    | "ready_for_approval"
    | "approved"
    | "disapproved";
  requestDate: string;
  hireDate: string;
  vesselType: string;
  contractStart: string;
  contractEnd: string;
  processedBy?: string;
  memoNo?: string;
}

interface PDFEditorData {
  memoNo: string;
  hireDate: string;
  rank: string;
  vesselType: string;
  contractStart: string;
  contractEnd: string;
  purpose: string;
}

export default function JobDescriptionsPage() {
  const [requests] = useState<JobDescriptionRequest[]>([
    {
      id: "JD-001",
      crewName: "Juan Dela Cruz",
      crewId: "NYC-2024-001",
      rank: "Able Seaman",
      purpose: "SSS",
      status: "pending",
      requestDate: "2025-01-15",
      hireDate: "2024-06-01",
      vesselType: "Container Vessel",
      contractStart: "2024-06-01",
      contractEnd: "2025-05-31",
    },
    {
      id: "JD-002",
      crewName: "Maria Santos",
      crewId: "NYC-2024-002",
      rank: "Cook",
      purpose: "VISA",
      visaType: "SEAMAN",
      status: "in_progress",
      requestDate: "2025-01-14",
      hireDate: "2024-08-15",
      vesselType: "Bulk Carrier",
      contractStart: "2024-08-15",
      contractEnd: "2025-08-14",
      processedBy: "EA Admin",
    },
    {
      id: "JD-003",
      crewName: "Pedro Reyes",
      crewId: "NYC-2024-003",
      rank: "Engine Cadet",
      purpose: "PHILHEALTH",
      status: "ready_for_approval",
      requestDate: "2025-01-13",
      hireDate: "2024-09-01",
      vesselType: "Tanker",
      contractStart: "2024-09-01",
      contractEnd: "2025-08-31",
      processedBy: "EA Admin",
      memoNo: "NYK-JD-2025-003",
    },
  ]);

  const [selectedRequest, setSelectedRequest] =
    useState<JobDescriptionRequest | null>(null);
  const [showPDFEditor, setShowPDFEditor] = useState(false);
  const [pdfData, setPdfData] = useState<PDFEditorData>({
    memoNo: "",
    hireDate: "",
    rank: "",
    vesselType: "",
    contractStart: "",
    contractEnd: "",
    purpose: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "bi-clock";
      case "in_progress":
        return "bi-gear";
      case "ready_for_approval":
        return "bi-eye";
      case "approved":
        return "bi-check-circle";
      case "disapproved":
        return "bi-x-circle";
      default:
        return "bi-question-circle";
    }
  };

  const handleProcessRequest = (request: JobDescriptionRequest) => {
    setSelectedRequest(request);
    setPdfData({
      memoNo: request.memoNo || `NYK-JD-2025-${request.id.split("-")[1]}`,
      hireDate: request.hireDate,
      rank: request.rank,
      vesselType: request.vesselType,
      contractStart: request.contractStart,
      contractEnd: request.contractEnd,
      purpose:
        request.purpose + (request.visaType ? ` - ${request.visaType}` : ""),
    });
    setShowPDFEditor(true);
  };

  const handleSavePDF = () => {
    setShowPDFEditor(false);
    setSelectedRequest(null);
    // Simulate updating request status
    alert("Job Description PDF has been generated and sent to VP for approval");
  };

  const handleForwardToVP = () => {
    setShowPDFEditor(false);
    setSelectedRequest(null);
    alert("Job Description has been forwarded to VP for final approval");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Job Description Requests
          </h1>
          <p className="text-gray-600">
            Manage and process job description requests from crew members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Total Requests:</span>
          <span className="text-lg font-semibold text-blue-600">
            {requests.length}
          </span>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            status: "pending",
            label: "Pending",
            count: requests.filter((r) => r.status === "pending").length,
          },
          {
            status: "in_progress",
            label: "In Progress",
            count: requests.filter((r) => r.status === "in_progress").length,
          },
          {
            status: "ready_for_approval",
            label: "Ready for VP",
            count: requests.filter((r) => r.status === "ready_for_approval")
              .length,
          },
          {
            status: "approved",
            label: "Approved",
            count: requests.filter((r) => r.status === "approved").length,
          },
          {
            status: "disapproved",
            label: "Disapproved",
            count: requests.filter((r) => r.status === "disapproved").length,
          },
        ].map((item) => (
          <div
            key={item.status}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(
                  item.status
                )}`}
              >
                <i className={`bi ${getStatusIcon(item.status)} text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crew Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
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
                      <p className="font-semibold text-gray-900">
                        {request.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Requested:{" "}
                        {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      {request.memoNo && (
                        <p className="text-sm text-blue-600 font-medium">
                          Memo: {request.memoNo}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.crewName}
                      </p>
                      <p className="text-sm text-gray-600">{request.crewId}</p>
                      <p className="text-sm text-gray-600">{request.rank}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.purpose}
                      </p>
                      {request.visaType && (
                        <p className="text-sm text-gray-600">
                          {request.visaType}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      <i
                        className={`bi ${getStatusIcon(request.status)} mr-1`}
                      ></i>
                      {request.status.replace("_", " ").toUpperCase()}
                    </span>
                    {request.processedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        By: {request.processedBy}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {request.status === "pending" && (
                        <button
                          onClick={() => handleProcessRequest(request)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <i className="bi bi-gear mr-1"></i>
                          Process
                        </button>
                      )}
                      {request.status === "in_progress" && (
                        <button
                          onClick={() => handleProcessRequest(request)}
                          className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          <i className="bi bi-file-earmark-pdf mr-1"></i>
                          Generate PDF
                        </button>
                      )}
                      <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200 transition-colors">
                        <i className="bi bi-eye mr-1"></i>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Editor Modal */}
      {showPDFEditor && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Generate Job Description PDF - {selectedRequest.crewName}
                </h3>
                <button
                  onClick={() => setShowPDFEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Job Description Details
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memo Number
                    </label>
                    <input
                      type="text"
                      value={pdfData.memoNo}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, memoNo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={pdfData.hireDate}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, hireDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rank
                    </label>
                    <input
                      type="text"
                      value={pdfData.rank}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, rank: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Vessel
                    </label>
                    <input
                      type="text"
                      value={pdfData.vesselType}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, vesselType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Start Date
                    </label>
                    <input
                      type="date"
                      value={pdfData.contractStart}
                      onChange={(e) =>
                        setPdfData({
                          ...pdfData,
                          contractStart: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract End Date
                    </label>
                    <input
                      type="date"
                      value={pdfData.contractEnd}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, contractEnd: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose of Request
                    </label>
                    <input
                      type="text"
                      value={pdfData.purpose}
                      onChange={(e) =>
                        setPdfData({ ...pdfData, purpose: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                </div>

                {/* PDF Preview */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    PDF Preview
                  </h4>
                  <div className="bg-white p-6 rounded border text-sm">
                    <div className="text-center mb-6">
                      <h5 className="font-bold text-lg">
                        NYK-FIL SHIP MANAGEMENT, INC.
                      </h5>
                      <p className="text-gray-600">JOB DESCRIPTION</p>
                    </div>

                    <div className="space-y-3">
                      <p>
                        <strong>Memo No.:</strong> {pdfData.memoNo}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Employee Name:</strong>{" "}
                        {selectedRequest.crewName}
                      </p>
                      <p>
                        <strong>Employee ID:</strong> {selectedRequest.crewId}
                      </p>
                      <p>
                        <strong>Date of Hire:</strong>{" "}
                        {new Date(pdfData.hireDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Rank/Position:</strong> {pdfData.rank}
                      </p>
                      <p>
                        <strong>Type of Vessel:</strong> {pdfData.vesselType}
                      </p>
                      <p>
                        <strong>Contract Period:</strong>{" "}
                        {new Date(pdfData.contractStart).toLocaleDateString()}{" "}
                        to {new Date(pdfData.contractEnd).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Purpose of Request:</strong> {pdfData.purpose}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        This job description is issued for official purposes as
                        requested.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowPDFEditor(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <i className="bi bi-floppy mr-2"></i>
                  Save Draft
                </button>
                <button
                  onClick={handleForwardToVP}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <i className="bi bi-send mr-2"></i>
                  Forward to VP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
