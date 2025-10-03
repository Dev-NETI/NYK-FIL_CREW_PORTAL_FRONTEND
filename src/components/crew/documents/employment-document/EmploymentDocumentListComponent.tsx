import { useState, useEffect } from "react";
import EmploymentDocumentListItemComponent from "./EmploymentDocumentListItemComponent";
import { useUser } from "@/hooks/useUser";
import {
  EmploymentDocumentService,
  EmploymentDocument as APIEmploymentDocument,
} from "@/services/employment-document";
import EmploymentDocumentListSkeleton from "./EmploymentDocumentListSkeleton";

interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
}

export default function EmploymentDocumentListComponent() {
  const { user } = useUser();
  const [employmentDocuments, setEmploymentDocuments] = useState<
    APIEmploymentDocument[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmploymentDocuments = async () => {
    if (user?.profile?.crew_id) {
      try {
        setIsLoading(true);
        const data =
          await EmploymentDocumentService.getEmploymentDocumentsByCrewId(
            user.profile.crew_id
          );
        console.log("Employment Documents:", data);
        setEmploymentDocuments(data || []);
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
    })) || [];

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
    </div>
  );
}
