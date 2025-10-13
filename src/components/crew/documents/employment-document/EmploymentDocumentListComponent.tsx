import { useState, useEffect } from "react";
import EmploymentDocumentListItemComponent from "./EmploymentDocumentListItemComponent";
import MissingEmploymentDocumentCardComponent from "./MissingEmploymentDocumentCardComponent";
import AddEmploymentDocumentModal from "./AddEmploymentDocumentModal";
import { useUser } from "@/hooks/useUser";
import {
  EmploymentDocumentService,
  EmploymentDocument as APIEmploymentDocument,
} from "@/services/employment-document";
import EmploymentDocumentListSkeleton from "./EmploymentDocumentListSkeleton";
import {
  EmploymentDocumentTypeService,
  EmploymentDocumentType as APIEmploymentDocumentType,
} from "@/services/employment-document-type";

interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  file_path?: string;
  file_ext?: string;
}

export default function EmploymentDocumentListComponent() {
  const { user } = useUser();
  const [employmentDocuments, setEmploymentDocuments] = useState<
    APIEmploymentDocument[]
  >([]);
  const [employmentDocumentTypes, setEmploymentDocumentTypes] = useState<
    APIEmploymentDocumentType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<APIEmploymentDocumentType | null>(null);

  console.log(user);
  const fetchEmploymentDocuments = async () => {
    if (user?.profile?.crew_id) {
      try {
        setIsLoading(true);
        const data =
          await EmploymentDocumentService.getEmploymentDocumentsByCrewId(
            user.profile.crew_id
          );
        const eDocDataType =
          await EmploymentDocumentTypeService.getEmploymentDocumentTypes();
        // console.log("Employment Documents Type:", eDocDataType);
        // console.log("Employment Documents:", data);
        setEmploymentDocuments(data || []);
        setEmploymentDocumentTypes(eDocDataType || []);
      } catch (error) {
        console.error("Error fetching employment documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEmploymentDocuments();
  }, [user]);

  const getDocumentIcon = (documentType: string): string => {
    const iconMap: Record<string, string> = {
      TIN: "bi-receipt-cutoff",
      SSS: "bi-shield-check",
      "PAG-IBIG": "bi-house-check",
      PHILHEALTH: "bi-heart-pulse",
      SRN: "bi-award",
    };
    return iconMap[documentType] || "bi-file-earmark-text";
  };

  const getDocumentColor = (documentType: string): string => {
    const colorMap: Record<string, string> = {
      TIN: "blue",
      SSS: "green",
      "PAG-IBIG": "purple",
      PHILHEALTH: "orange",
      SRN: "indigo",
    };
    return colorMap[documentType] || "gray";
  };

  const mappedDocuments: EmploymentDocument[] =
    employmentDocuments?.map((doc) => ({
      id: doc.id,
      crew_id: doc.crew_id,
      employment_document_type_id: doc.employment_document_type_id,
      documentType: doc.employment_document_type.name,
      documentNumber: doc.document_number,
      createdAt: doc.created_at,
      modifiedBy: doc.modified_by,
      icon: getDocumentIcon(doc.employment_document_type.name),
      file_path: doc.file_path,
      file_ext: doc.file_ext,
    })) || [];

  // Find missing document types
  const existingDocumentTypeIds = employmentDocuments.map(
    (doc) => doc.employment_document_type_id
  );
  const missingDocumentTypes = employmentDocumentTypes.filter(
    (type) => !existingDocumentTypeIds.includes(type.id)
  );

  if (isLoading) {
    return <EmploymentDocumentListSkeleton />;
  }

  return (
    <div className="space-y-4 mb-28">
      {mappedDocuments.map((doc) => (
        <EmploymentDocumentListItemComponent
          key={doc.id}
          document={doc}
          onUpdate={fetchEmploymentDocuments}
        />
      ))}

      {/* Missing Document Type Cards */}
      {missingDocumentTypes.map((type) => (
        <MissingEmploymentDocumentCardComponent
          key={type.id}
          documentType={type.name}
          icon={getDocumentIcon(type.name)}
          onAdd={() => {
            setSelectedDocumentType(type);
            setIsModalOpen(true);
          }}
        />
      ))}

      {/* Add Employment Document Modal */}
      {selectedDocumentType && user?.profile?.crew_id && (
        <AddEmploymentDocumentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocumentType(null);
          }}
          onSuccess={fetchEmploymentDocuments}
          documentType={selectedDocumentType.name}
          documentTypeId={selectedDocumentType.id}
          crewId={user.profile.crew_id}
          icon={getDocumentIcon(selectedDocumentType.name)}
        />
      )}
    </div>
  );
}
