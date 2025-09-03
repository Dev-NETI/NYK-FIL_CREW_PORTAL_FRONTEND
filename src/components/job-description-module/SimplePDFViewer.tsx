"use client";

import React, { useState } from 'react';

interface PDFData {
  memoNo: string;
  purpose: string;
  crewName: string;
  crewId: string;
}

interface CrewInfo {
  name: string;
  id: string;
}

interface SimplePDFViewerProps {
  pdfData: PDFData;
  crewInfo: CrewInfo;
  isEditable?: boolean;
  onDataChange?: (data: PDFData) => void;
  showSignature?: boolean;
  signatureAdded?: boolean;
  onSignatureToggle?: () => void;
}

export default function SimplePDFViewer({
  pdfData,
  crewInfo,
  isEditable = false,
  onDataChange,
  showSignature = false,
  signatureAdded = false,
  onSignatureToggle,
}: SimplePDFViewerProps) {
  const [localData, setLocalData] = useState<PDFData>(pdfData);
  const [showPreview, setShowPreview] = useState(false);
  // const printFrameRef = useRef<HTMLIFrameElement>(null);

  const handleInputChange = (field: keyof PDFData, value: string) => {
    if (!isEditable) return;
    
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onDataChange?.(updatedData);
  };

  const generateHTMLContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Description - ${crewInfo.name}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              line-height: 1.6;
              margin: 40px;
              color: #000;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            .company-address {
              font-size: 12px;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            .document-title {
              font-size: 16px;
              font-weight: bold;
              text-decoration: underline;
              margin-top: 20px;
              letter-spacing: 0.5px;
            }
            .memo-section {
              margin: 30px 0;
            }
            .memo-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-weight: bold;
            }
            .content-section {
              margin: 30px 0;
              text-align: justify;
              line-height: 1.8;
            }
            .content-section p {
              margin-bottom: 20px;
              text-indent: 50px;
            }
            .content-section p.no-indent {
              text-indent: 0;
              font-weight: bold;
            }
            .signature-section {
              margin-top: 80px;
              text-align: right;
            }
            .signature-box {
              display: inline-block;
              text-align: center;
            }
            .signature-line {
              border-bottom: 2px solid #000;
              width: 250px;
              margin-bottom: 8px;
              height: 50px;
              position: relative;
            }
            .signature-text {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-text {
              font-size: 12px;
            }
            .digital-signature {
              color: #0066cc;
              font-style: italic;
              font-size: 12px;
              margin-top: 10px;
            }
            .field-highlight {
              background-color: #fff3cd;
              padding: 2px 4px;
              border: 1px solid #ffeaa7;
              font-weight: bold;
            }
            @media print {
              body { 
                margin: 20mm; 
                font-size: 12px;
              }
              .header {
                border-bottom: 2px solid #000;
              }
            }
            @page {
              margin: 20mm;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">NYK-FIL SHIP MANAGEMENT, INC.</div>
            <div class="company-address">
              7th Floor, NYK-FIL Maritime E-Training, Inc. Building<br>
              Bonifacio Global City, Taguig City, Metro Manila, Philippines
            </div>
            <div class="document-title">JOB DESCRIPTION CERTIFICATE</div>
          </div>

          <div class="memo-section">
            <div class="memo-header">
              <div>MEMO NO: <span class="field-highlight">${localData.memoNo || '[TO BE ASSIGNED]'}</span></div>
              <div>DATE: <span class="field-highlight">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span></div>
            </div>
          </div>

          <div class="content-section">
            <p class="no-indent"><strong>TO WHOM IT MAY CONCERN:</strong></p>
            
            <p>
              This is to certify that <span class="field-highlight"><strong>${crewInfo.name}</strong></span>, 
              bearing Crew ID No. <span class="field-highlight"><strong>${crewInfo.id}</strong></span>, 
              has been employed with NYK-FIL Ship Management, Inc.
            </p>

            <p>
              This certification is being issued upon request of the above-mentioned person 
              for <span class="field-highlight"><strong>${localData.purpose || '[PURPOSE TO BE SPECIFIED]'}</strong></span> 
              purposes and for whatever legal purposes it may serve.
            </p>

            <p>
              Issued this <span class="field-highlight"><strong>${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</strong></span> 
              at Taguig City, Metro Manila, Philippines.
            </p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                ${signatureAdded ? '<div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 18px; color: #0066cc;">✓ Authorized Signature</div>' : ''}
              </div>
              <div class="signature-text">Authorized Signatory</div>
              <div class="company-text">NYK-FIL Ship Management, Inc.</div>
              ${signatureAdded ? '<div class="digital-signature">✓ Digitally Signed</div>' : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the document');
      return;
    }

    const htmlContent = generateHTMLContent();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const handleDownloadPDF = () => {
    // Create a blob with the HTML content
    const htmlContent = generateHTMLContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-description-${localData.memoNo || 'document'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open print dialog
    handlePrint();
  };

  const handleSaveToPDF = () => {
    if (!window.print) {
      alert('Print functionality is not available in this browser');
      return;
    }

    // Open print dialog with save as PDF option
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to save as PDF');
      return;
    }

    const htmlContent = generateHTMLContent();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      alert('Use your browser\'s print dialog to save as PDF');
      printWindow.print();
    }, 500);
  };

  if (showPreview) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Preview Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Document Preview
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-printer mr-2"></i>
                Print
              </button>
              <button
                onClick={handleSaveToPDF}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="bi bi-file-earmark-pdf mr-2"></i>
                Save as PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <i className="bi bi-arrow-left mr-2"></i>
                Back to Editor
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 bg-gray-50">
          <div 
            className="bg-white shadow-lg mx-auto"
            style={{ maxWidth: '21cm', minHeight: '29.7cm' }}
            dangerouslySetInnerHTML={{ __html: generateHTMLContent() }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Job Description Document
            </h3>
            <p className="text-sm text-gray-600">
              {crewInfo.name} ({crewInfo.id})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={!localData.memoNo}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="bi bi-eye mr-2"></i>
              Preview
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!localData.memoNo}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="bi bi-download mr-2"></i>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Form Editor */}
      <div className="p-6">
        {/* Document Information */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            Document Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memo Number *
              </label>
              {isEditable ? (
                <input
                  type="text"
                  value={localData.memoNo}
                  onChange={(e) => handleInputChange('memoNo', e.target.value)}
                  placeholder="e.g., NYK-JD-2025-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {localData.memoNo || 'Not assigned'}
                </p>
              )}
              {!localData.memoNo && (
                <p className="text-sm text-red-600 mt-1">
                  Memo number is required to generate the document
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              {isEditable ? (
                <select
                  value={localData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select purpose...</option>
                  <option value="Social Security System (SSS)">SSS Application</option>
                  <option value="Pag-Ibig Fund">Pag-Ibig Fund</option>
                  <option value="PhilHealth">PhilHealth</option>
                  <option value="VISA Application - Tourist">VISA - Tourist</option>
                  <option value="VISA Application - Business">VISA - Business</option>
                  <option value="VISA Application - Work">VISA - Work</option>
                  <option value="VISA Application - Seaman">VISA - Seaman</option>
                </select>
              ) : (
                <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {localData.purpose || 'Not specified'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Crew Information */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            Crew Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crew Name
              </label>
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {crewInfo.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crew ID
              </label>
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {crewInfo.id}
              </p>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        {localData.memoNo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">
              Document Preview
            </h4>
            <div className="bg-white p-6 rounded border text-sm leading-relaxed max-h-96 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="font-bold text-lg">NYK-FIL SHIP MANAGEMENT, INC.</div>
                <div className="text-sm text-gray-600 mt-1">
                  7th Floor, NYK-FIL Maritime E-Training, Inc. Building<br />
                  Bonifacio Global City, Taguig City, Metro Manila, Philippines
                </div>
                <div className="font-bold mt-4 underline">JOB DESCRIPTION CERTIFICATE</div>
              </div>

              <div className="mb-4 flex justify-between">
                <span><strong>MEMO NO:</strong> {localData.memoNo}</span>
                <span><strong>DATE:</strong> {new Date().toLocaleDateString()}</span>
              </div>

              <div className="mb-4">
                <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
              </div>

              <div className="space-y-4 text-justify">
                <p className="indent-12">
                  This is to certify that <strong>{crewInfo.name}</strong>, bearing Crew ID No. 
                  <strong> {crewInfo.id}</strong>, has been employed with NYK-FIL Ship Management, Inc.
                </p>

                <p className="indent-12">
                  This certification is being issued upon request of the above-mentioned person for{' '}
                  <strong>{localData.purpose || '[PURPOSE TO BE SPECIFIED]'}</strong> purposes and for 
                  whatever legal purposes it may serve.
                </p>

                <p className="indent-12">
                  Issued this <strong>{new Date().toLocaleDateString()}</strong> at Taguig City, 
                  Metro Manila, Philippines.
                </p>
              </div>

              <div className="mt-12 text-right">
                <div className="inline-block">
                  <div className="border-b-2 border-black w-48 mb-1 h-12 relative">
                    {signatureAdded && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-blue-600 font-bold">
                        ✓ Authorized Signature
                      </div>
                    )}
                  </div>
                  <div className="font-bold">Authorized Signatory</div>
                  <div className="text-sm">NYK-FIL Ship Management, Inc.</div>
                  {signatureAdded && (
                    <div className="text-blue-600 italic text-sm mt-1">✓ Digitally Signed</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Section */}
      {showSignature && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Digital Signature:
              </span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                signatureAdded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {signatureAdded ? 'Document Signed' : 'Awaiting Signature'}
              </span>
            </div>
            {onSignatureToggle && (
              <button
                onClick={onSignatureToggle}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  signatureAdded
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <i className={`bi ${signatureAdded ? 'bi-x-lg' : 'bi-pen'} mr-1`}></i>
                {signatureAdded ? 'Remove Signature' : 'Add Digital Signature'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}