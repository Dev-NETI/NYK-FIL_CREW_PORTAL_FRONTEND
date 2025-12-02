import { useState } from "react";
import CertificateListItemComponent from "./CertificateListItemComponent";

export default function CertificateListComponent() {
  // Mock data - will be replaced with actual API calls
  const [certificates] = useState([
    {
      id: 1,
      name: "STCW Basic Safety Training",
      issueDate: "2023-01-15",
      expiryDate: "2028-01-15",
      issuingAuthority: "MARINA",
      certificateNumber: "BST-2023-00145",
      status: "valid",
      hasFile: true,
    },
    {
      id: 2,
      name: "Certificate of Competency",
      issueDate: "2022-06-20",
      expiryDate: "2027-06-20",
      issuingAuthority: "MARINA",
      certificateNumber: "COC-2022-00892",
      status: "valid",
      hasFile: true,
    },
    {
      id: 3,
      name: "Advanced Fire Fighting",
      issueDate: "2023-03-10",
      expiryDate: "2026-03-10",
      issuingAuthority: "PTC",
      certificateNumber: "AFF-2023-00234",
      status: "expiring_soon",
      hasFile: false,
    },
    {
      id: 4,
      name: "Medical First Aid",
      issueDate: "2021-08-15",
      expiryDate: "2024-08-15",
      issuingAuthority: "MARINA",
      certificateNumber: "MFA-2021-00567",
      status: "expired",
      hasFile: true,
    },
  ]);

  const [isLoading] = useState(false);

  // TODO: Implement fetch certificates function
  const fetchCertificates = async () => {
    console.log("Fetching certificates...");
  };

  if (isLoading) {
    // TODO: Add skeleton loading component
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 mb-28">
      {certificates.map((certificate) => (
        <CertificateListItemComponent
          key={certificate.id}
          certificate={certificate}
          onUpdate={fetchCertificates}
        />
      ))}

      {certificates.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-award text-gray-400 text-4xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your professional certificates and licenses
          </p>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <i className="bi bi-plus-circle mr-2"></i>
            Add Your First Certificate
          </button>
        </div>
      )}
    </div>
  );
}
