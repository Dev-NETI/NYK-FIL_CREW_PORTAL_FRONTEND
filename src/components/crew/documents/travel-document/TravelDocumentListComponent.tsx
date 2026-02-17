import { useState, useEffect } from "react";
import TravelDocumentListItemComponent from "./TravelDocumentListItemComponent";
import TravelDocumentListSkeleton from "./TravelDocumentListSkeleton";
import MissingTravelDocumentCardComponent from "./MissingTravelDocumentCardComponent";
import AddTravelDocumentModal from "./AddTravelDocumentModal";
import { useUser } from "@/hooks/useUser";
import { TravelDocumentService } from "@/services/travel-document";
import {
  TravelDocumentTypeService,
  TravelDocumentType as APITravelDocumentType,
} from "@/services/travel-document-type";

interface TravelDocument {
  id: number;
  crew_id: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  travel_document_type_id: number;
  remaining_pages?: number;
  visa_type?: string;
}

export default function TravelDocumentListComponent() {
  const { user } = useUser();
  const [travelDocuments, setTravelDocuments] = useState<TravelDocument[]>([]);
  const [travelDocumentTypes, setTravelDocumentTypes] = useState<
    APITravelDocumentType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<APITravelDocumentType | null>(null);

  const getDocumentIcon = (documentType: string): string => {
    const iconMap: Record<string, string> = {
      Passport: "bi-passport",
      SIRB: "bi-book",
      SID: "bi-person-badge",
      "US VISA": "bi-flag-usa",
    };
    return iconMap[documentType] || "bi-file-earmark-text";
  };

  const fetchTravelDocuments = async () => {
    if (user?.profile?.crew_id) {
      try {
        setIsLoading(true);
        const data = await TravelDocumentService.getTravelDocumentsByCrewId(
          user.profile.crew_id,
        );
        const types = await TravelDocumentTypeService.getTravelDocumentTypes();

        const mappedDocuments: TravelDocument[] = data.map((doc) => ({
          id: doc.id,
          crew_id: doc.crew_id,
          documentType:
            doc.is_US_VISA === 1 ? "US VISA" : doc.travel_document_type.name,
          documentNumber: doc.id_no,
          issueDate: doc.date_of_issue,
          expiryDate: doc.expiration_date,
          issuingCountry: doc.place_of_issue,
          createdAt: doc.created_at,
          modifiedBy: doc.modified_by,
          icon: getDocumentIcon(
            doc.is_US_VISA === 1 ? "US VISA" : doc.travel_document_type.name,
          ),
          travel_document_type_id: doc.travel_document_type_id,
          remaining_pages: doc.remaining_pages,
          visa_type: doc.visa_type ?? undefined,
          file_path: doc.file_path,
          file_ext: doc.file_ext,
        }));

        setTravelDocuments(mappedDocuments);
        setTravelDocumentTypes(types);
      } catch (error) {
        console.error("Error fetching travel documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTravelDocuments();
  }, [user]);

  // Find missing document types
  const existingDocumentTypeIds = travelDocuments
    .map((doc) => {
      const foundType = travelDocumentTypes.find(
        (type) => type.name === doc.documentType,
      );
      return foundType?.id;
    })
    .filter(Boolean);

  const missingDocumentTypes = travelDocumentTypes.filter(
    (type) => !existingDocumentTypeIds.includes(type.id),
  );

  if (isLoading) {
    return <TravelDocumentListSkeleton />;
  }

  return (
    <div className="space-y-4 mb-28">
      {travelDocuments.map((doc, index) => (
        <TravelDocumentListItemComponent
          key={doc.id}
          document={doc}
          onUpdate={fetchTravelDocuments}
          index={index}
        />
      ))}

      {/* Missing Document Type Cards */}
      {missingDocumentTypes.map((type, index) => (
        <MissingTravelDocumentCardComponent
          key={type.id}
          documentType={type.name}
          onAdd={() => {
            setSelectedDocumentType(type);
            setIsModalOpen(true);
          }}
          index={travelDocuments.length + index}
        />
      ))}

      {travelDocuments.length === 0 && missingDocumentTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <i className="bi bi-passport text-gray-400 text-5xl mb-4"></i>
          <p className="text-gray-600 text-lg font-medium">
            No travel documents found
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Your travel documents will appear here once added
          </p>
        </div>
      )}

      {/* Add Travel Document Modal */}
      {selectedDocumentType && user?.profile?.crew_id && (
        <AddTravelDocumentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocumentType(null);
          }}
          onSuccess={fetchTravelDocuments}
          documentType={selectedDocumentType.name}
          documentTypeId={selectedDocumentType.id}
          crewId={user.profile.crew_id}
          icon={getDocumentIcon(selectedDocumentType.name)}
        />
      )}
    </div>
  );
}
