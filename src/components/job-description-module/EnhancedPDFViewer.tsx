"use client";

import React, { useState } from 'react';
import BrowserPDFEditor from './BrowserPDFEditor';

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

interface EnhancedPDFViewerProps {
  pdfData: PDFData;
  crewInfo: CrewInfo;
  isEditable?: boolean;
  onDataChange?: (data: PDFData) => void;
  showSignature?: boolean;
  signatureAdded?: boolean;
  onSignatureToggle?: () => void;
  mode?: 'form' | 'pdf';
}

export default function EnhancedPDFViewer({
  pdfData,
  crewInfo,
  isEditable = false,
  onDataChange,
  showSignature = false,
  signatureAdded = false,
  onSignatureToggle,
  mode = 'form',
}: EnhancedPDFViewerProps) {
  const [localData, setLocalData] = useState<PDFData>(pdfData);
  const [generatedPdf, setGeneratedPdf] = useState<ArrayBuffer | null>(null);
  const [pdfMode, setPdfMode] = useState<'form' | 'pdf'>(mode);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof PDFData, value: string) => {
    if (!isEditable) return;
    
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onDataChange?.(updatedData);
  };

  const generateJobDescriptionPDF = async (): Promise<ArrayBuffer> => {
    // Import PDF-lib dynamically
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    
    // Embed fonts
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    const { width, height } = page.getSize();
    const margin = 50;
    
    // Header
    page.drawText('NYK-FIL SHIP MANAGEMENT, INC.', {
      x: margin,
      y: height - 80,
      size: 18,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('7th Floor, NYK-FIL Maritime E-Training, Inc. Building', {
      x: margin,
      y: height - 110,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Bonifacio Global City, Taguig City, Metro Manila, Philippines', {
      x: margin,
      y: height - 130,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    // Horizontal line
    page.drawLine({
      start: { x: margin, y: height - 150 },
      end: { x: width - margin, y: height - 150 },
      thickness: 2,
      color: rgb(0, 0, 0),
    });
    
    // Title
    page.drawText('JOB DESCRIPTION CERTIFICATE', {
      x: margin,
      y: height - 190,
      size: 16,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    // Memo info
    page.drawText(`MEMO NO: ${localData.memoNo}`, {
      x: margin,
      y: height - 230,
      size: 12,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`DATE: ${new Date().toLocaleDateString()}`, {
      x: width - 200,
      y: height - 230,
      size: 12,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    // Content
    page.drawText('TO WHOM IT MAY CONCERN:', {
      x: margin,
      y: height - 280,
      size: 12,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    // First paragraph
    const line1 = `        This is to certify that ${crewInfo.name}, bearing Crew ID No.`;
    const line2 = `${crewInfo.id}, has been employed with NYK-FIL Ship Management, Inc.`;
    
    page.drawText(line1, {
      x: margin,
      y: height - 320,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(line2, {
      x: margin,
      y: height - 340,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    // Purpose paragraph
    const purposeLine1 = `        This certification is being issued upon request of the above-`;
    const purposeLine2 = `mentioned person for ${localData.purpose} purposes and for whatever`;
    const purposeLine3 = `legal purposes it may serve.`;
    
    page.drawText(purposeLine1, {
      x: margin,
      y: height - 380,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(purposeLine2, {
      x: margin,
      y: height - 400,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(purposeLine3, {
      x: margin,
      y: height - 420,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    // Date line
    const issuedLine = `        Issued this ${new Date().toLocaleDateString()} at Taguig City, Metro Manila, Philippines.`;
    page.drawText(issuedLine, {
      x: margin,
      y: height - 460,
      size: 12,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    // Signature area
    const sigX = width - 250;
    page.drawText('Authorized Signatory', {
      x: sigX,
      y: height - 550,
      size: 12,
      font: timesBold,
      color: rgb(0, 0, 0),
    });
    
    // Draw signature line
    page.drawLine({
      start: { x: sigX, y: height - 530 },
      end: { x: sigX + 200, y: height - 530 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('NYK-FIL Ship Management, Inc.', {
      x: sigX,
      y: height - 570,
      size: 10,
      font: timesFont,
      color: rgb(0, 0, 0),
    });
    
    if (signatureAdded) {
      page.drawText('✓ Digitally Signed', {
        x: sigX,
        y: height - 590,
        size: 10,
        font: timesBold,
        color: rgb(0, 0.4, 0.8),
      });
    }
    
    // Return PDF as ArrayBuffer
    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer as ArrayBuffer;
  };

  const handleGeneratePDF = async () => {
    if (!localData.memoNo) {
      alert('Please enter a memo number before generating PDF');
      return;
    }

    try {
      setLoading(true);
      const pdfBuffer = await generateJobDescriptionPDF();
      setGeneratedPdf(pdfBuffer);
      setPdfMode('pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePDF = (pdfBytes: ArrayBuffer, annotations: unknown[]) => {
    // Handle saving the edited PDF
    console.log('PDF saved with annotations:', annotations.length);
    
    // Create download link
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-description-${localData.memoNo || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // You can also send this to your backend API
    // await fetch('/api/job-descriptions/save-pdf', {
    //   method: 'POST',
    //   body: pdfBytes
    // });
  };

  if (pdfMode === 'pdf' && generatedPdf) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Job Description PDF Editor
              </h3>
              <p className="text-sm text-gray-600">
                {localData.memoNo} - {crewInfo.name}
              </p>
            </div>
            <button
              onClick={() => setPdfMode('form')}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="bi bi-arrow-left mr-2"></i>
              Back to Form
            </button>
          </div>
        </div>

        {/* PDF Editor */}
        <BrowserPDFEditor
          pdfData={generatedPdf}
          isReadOnly={!isEditable}
          onSave={handleSavePDF}
          showSignatureArea={showSignature}
          signatureAdded={signatureAdded}
          onSignatureToggle={onSignatureToggle}
        />
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
              onClick={handleGeneratePDF}
              disabled={loading || !localData.memoNo}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="bi bi-hourglass-split mr-2 animate-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-pdf mr-2"></i>
                  Generate PDF
                </>
              )}
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

        {/* Preview Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            Document Preview
          </h4>
          <div className="bg-white p-6 rounded border text-sm leading-relaxed">
            <div className="text-center mb-6">
              <div className="font-bold text-lg">NYK-FIL SHIP MANAGEMENT, INC.</div>
              <div className="text-sm text-gray-600 mt-1">
                7th Floor, NYK-FIL Maritime E-Training, Inc. Building<br />
                Bonifacio Global City, Taguig City, Metro Manila, Philippines
              </div>
              <div className="font-bold mt-4 underline">JOB DESCRIPTION CERTIFICATE</div>
            </div>

            <div className="mb-4 flex justify-between">
              <span><strong>MEMO NO:</strong> {localData.memoNo || '[TO BE ASSIGNED]'}</span>
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
                <div className="border-b-2 border-black w-48 mb-1"></div>
                <div className="font-bold">Authorized Signatory</div>
                <div className="text-sm">NYK-FIL Ship Management, Inc.</div>
                {signatureAdded && (
                  <div className="text-blue-600 italic text-sm mt-1">✓ Digitally Signed</div>
                )}
              </div>
            </div>
          </div>
        </div>
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