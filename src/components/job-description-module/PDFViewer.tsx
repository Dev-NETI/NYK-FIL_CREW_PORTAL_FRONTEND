"use client";

import { useState } from "react";

interface PDFData {
  memoNo: string;
  hireDate: string;
  rank: string;
  vesselType: string;
  contractStart: string;
  contractEnd: string;
  purpose: string;
}

interface CrewInfo {
  name: string;
  id: string;
}

interface PDFViewerProps {
  pdfData: PDFData;
  crewInfo: CrewInfo;
  isEditable?: boolean;
  onDataChange?: (data: PDFData) => void;
  showSignature?: boolean;
  signatureAdded?: boolean;
  onSignatureToggle?: () => void;
}

export default function PDFViewer({
  pdfData,
  crewInfo,
  isEditable = false,
  onDataChange,
  showSignature = false,
  signatureAdded = false,
  onSignatureToggle,
}: PDFViewerProps) {
  const [localData, setLocalData] = useState<PDFData>(pdfData);

  const handleInputChange = (field: keyof PDFData, value: string) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onDataChange?.(updatedData);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InputField = ({ 
    value, 
    type = "text", 
    field 
  }: { 
    value: string; 
    type?: string; 
    field: keyof PDFData;
  }) => {
    if (!isEditable) {
      return <span className="font-medium">{type === "date" ? formatDate(value) : value}</span>;
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent font-medium min-w-0 flex-1"
        style={{ minWidth: `${Math.max(value.length, 10)}ch` }}
      />
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-gray-50 p-4">
      <div className="bg-white p-8 rounded border text-sm min-h-[600px] font-serif leading-relaxed">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="bi bi-anchor text-blue-600 text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              NYK-FIL SHIP MANAGEMENT, INC.
            </h1>
            <p className="text-gray-600 text-sm mt-1">Maritime Crew Management Services</p>
          </div>
          <div className="border-t border-b border-gray-300 py-3">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest">
              JOB DESCRIPTION CERTIFICATE
            </h2>
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <p className="flex items-baseline">
              <strong className="w-24 inline-block text-gray-700">Memo No.:</strong>
              <InputField value={localData.memoNo} field="memoNo" />
            </p>
            <p className="flex items-baseline">
              <strong className="w-24 inline-block text-gray-700">Date Issued:</strong>
              <span className="font-medium">{formatDate(new Date().toISOString())}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 inline-block">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                Document Reference
              </p>
              <p className="text-lg font-bold text-blue-800 font-mono">
                {localData.memoNo || "NYK-JD-XXXX"}
              </p>
            </div>
          </div>
        </div>

        {/* Crew Information */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-base font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Crew Member Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="flex items-baseline">
                <strong className="w-32 inline-block text-gray-700">Employee Name:</strong>
                <span className="font-medium">{crewInfo.name}</span>
              </p>
              <p className="flex items-baseline">
                <strong className="w-32 inline-block text-gray-700">Employee ID:</strong>
                <span className="font-medium font-mono">{crewInfo.id}</span>
              </p>
              <p className="flex items-baseline">
                <strong className="w-32 inline-block text-gray-700">Date of Hire:</strong>
                <InputField value={localData.hireDate} type="date" field="hireDate" />
              </p>
            </div>
            <div className="space-y-3">
              <p className="flex items-baseline">
                <strong className="w-32 inline-block text-gray-700">Rank/Position:</strong>
                <InputField value={localData.rank} field="rank" />
              </p>
              <p className="flex items-baseline">
                <strong className="w-32 inline-block text-gray-700">Vessel Type:</strong>
                <InputField value={localData.vesselType} field="vesselType" />
              </p>
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Contract Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="flex items-baseline mb-3">
                <strong className="w-32 inline-block text-gray-700">Contract Start:</strong>
                <InputField 
                  value={localData.contractStart} 
                  type="date" 
                  field="contractStart" 
                />
              </p>
            </div>
            <div>
              <p className="flex items-baseline mb-3">
                <strong className="w-32 inline-block text-gray-700">Contract End:</strong>
                <InputField 
                  value={localData.contractEnd} 
                  type="date" 
                  field="contractEnd" 
                />
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="flex items-baseline">
              <strong className="w-40 inline-block text-gray-700">Duration:</strong>
              <span className="font-medium">
                {localData.contractStart && localData.contractEnd
                  ? `${Math.ceil(
                      (new Date(localData.contractEnd).getTime() - 
                       new Date(localData.contractStart).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days`
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Purpose of Request
          </h3>
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="text-blue-800 font-medium">
              This job description is issued for: <strong>{localData.purpose}</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-6">
                This document certifies the employment details of the above-mentioned crew member
                for official purposes as requested. All information provided is accurate and complete
                as per our employment records.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Document issued on: {formatDate(new Date().toISOString())}</p>
                <p>Valid for official purposes only</p>
              </div>
            </div>
            
            {showSignature && (
              <div className="text-center min-w-[200px]">
                <div className="border-b-2 border-gray-400 w-48 mb-2 mx-auto"></div>
                <div className="flex flex-col items-center">
                  {signatureAdded && (
                    <div className="bg-blue-100 p-3 rounded mb-2 border-2 border-blue-300">
                      <p className="text-blue-800 font-bold text-sm">VP DIGITAL SIGNATURE</p>
                      <p className="text-blue-600 text-xs font-medium italic">Digitally Signed</p>
                    </div>
                  )}
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    VICE PRESIDENT
                  </p>
                  <p className="text-xs text-gray-600">NYK-FIL Ship Management, Inc.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {formatDate(new Date().toISOString())}
                  </p>
                </div>
                
                {isEditable && onSignatureToggle && (
                  <button
                    onClick={onSignatureToggle}
                    className={`mt-3 px-3 py-1 rounded text-xs transition-colors ${
                      signatureAdded
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {signatureAdded ? "✓ Signed" : "Add Signature"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Company Footer */}
          <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium">NYK-FIL Ship Management, Inc.</p>
              <p>Maritime House, South Harbor, Port Area, Manila, Philippines</p>
              <p>Tel: +63 (2) 8527-8888 | Email: info@nykfil.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}