"use client";

import { useState } from 'react';
import { EnhancedPDFViewer } from '@/components/job-description-module';

export default function JobDescriptionPDFEditorPage() {
  // Mock data - in real app, this would come from your API
  const [mockRequest, setMockRequest] = useState({
    id: 'JD-2025-001',
    crewId: '219454',
    crewName: 'CALSENA, RONITO JR H.',
    purpose: 'Social Security System (SSS)',
    status: 'in_progress',
    memoNo: 'NYK-JD-2025-001',
    processedBy: 'Maria Santos Cruz',
    requestDate: '2025-01-15',
  });

  const [pdfData, setPdfData] = useState({
    memoNo: mockRequest.memoNo,
    purpose: mockRequest.purpose,
    crewName: mockRequest.crewName,
    crewId: mockRequest.crewId,
  });

  const [signatureAdded, setSignatureAdded] = useState(false);

  const handleDataChange = (newData: typeof pdfData) => {
    setPdfData(newData);
  };

  const handleSignatureToggle = () => {
    setSignatureAdded(!signatureAdded);
  };

  const handleApprove = () => {
    if (!signatureAdded) {
      alert('Please add your digital signature before approving.');
      return;
    }
    
    // Update request status to approved
    setMockRequest(prev => ({ ...prev, status: 'approved' }));
    alert('Job description request has been approved and signed!');
  };

  const handleDisapprove = () => {
    const reason = prompt('Please enter the reason for disapproval:');
    if (!reason) return;
    
    // Update request status to disapproved
    setMockRequest(prev => ({ ...prev, status: 'disapproved' }));
    alert(`Request disapproved. Reason: ${reason}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Job Description PDF Editor
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve job description requests with integrated PDF editing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mockRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                mockRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                mockRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {mockRequest.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Request Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Request ID</label>
                <p className="text-lg font-semibold text-gray-900">{mockRequest.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Crew Member</label>
                <p className="text-lg font-semibold text-gray-900">{mockRequest.crewName}</p>
                <p className="text-sm text-gray-600">ID: {mockRequest.crewId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-lg font-semibold text-gray-900">{mockRequest.purpose}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Request Date</label>
                <p className="text-lg font-semibold text-gray-900">{mockRequest.requestDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Processed By</label>
                <p className="text-lg font-semibold text-gray-900">{mockRequest.processedBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {mockRequest.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Editor */}
        <div className="mb-6">
          <EnhancedPDFViewer
            pdfData={pdfData}
            crewInfo={{
              name: mockRequest.crewName,
              id: mockRequest.crewId,
            }}
            isEditable={mockRequest.status === 'in_progress' || mockRequest.status === 'ready_for_approval'}
            onDataChange={handleDataChange}
            showSignature={mockRequest.status === 'ready_for_approval'}
            signatureAdded={signatureAdded}
            onSignatureToggle={handleSignatureToggle}
          />
        </div>

        {/* Action Buttons */}
        {(mockRequest.status === 'in_progress' || mockRequest.status === 'ready_for_approval') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {mockRequest.status === 'in_progress' 
                    ? 'Complete document processing and generate PDF before approval'
                    : 'Review the generated document and add your digital signature to approve'
                  }
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDisapprove}
                    className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <i className="bi bi-x-circle mr-2"></i>
                    Disapprove
                  </button>
                  {mockRequest.status === 'ready_for_approval' && (
                    <button
                      onClick={handleApprove}
                      disabled={!signatureAdded}
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="bi bi-check-circle mr-2"></i>
                      Approve & Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {mockRequest.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <i className="bi bi-check-circle-fill text-green-500 text-xl mr-3"></i>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Request Approved Successfully
                </h3>
                <p className="text-green-700">
                  The job description has been approved and digitally signed. The crew member will be notified and can download the document.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Guide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            <i className="bi bi-info-circle mr-2"></i>
            Workflow Guide
          </h4>
          <div className="space-y-2 text-blue-700">
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3">1</span>
              <span>Crew submits job description request</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3">2</span>
              <span>EA processes request and generates PDF document</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3">3</span>
              <span>VP reviews, edits (if needed), and digitally signs the document</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3">4</span>
              <span>Crew receives notification and downloads approved document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}