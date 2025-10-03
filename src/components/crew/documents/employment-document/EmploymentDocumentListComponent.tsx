import EmploymentDocumentListItemComponent from "./EmploymentDocumentListItemComponent";
import { useUser } from "@/hooks/useUser";

interface EmploymentDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  color: string;
}

interface EmploymentDocumentListComponentProps {
  documents: EmploymentDocument[];
}

export default function EmploymentDocumentListComponent({
  documents,
}: EmploymentDocumentListComponentProps) {
  const { user, loading } = useUser();
  user && console.log(user?.profile?.crew_id);

  return (
    <div className="space-y-4 mb-28">
      {documents.map((doc) => (
        <EmploymentDocumentListItemComponent key={doc.id} document={doc} />
      ))}
    </div>
  );
}
