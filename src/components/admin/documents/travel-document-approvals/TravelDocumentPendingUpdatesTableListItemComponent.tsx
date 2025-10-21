import { TravelDocumentUpdate } from "@/services/travel-document-approval";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface TravelDocumentPendingUpdatesTableListItemComponentProps {
  update: TravelDocumentUpdate;
  onViewUpdate: (update: TravelDocumentUpdate) => void;
}

export default function TravelDocumentPendingUpdatesTableListItemComponent({
  update,
  onViewUpdate,
}: TravelDocumentPendingUpdatesTableListItemComponentProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getCrewName = () => {
    const profile = update.travelDocument?.user_profile;
    if (!profile) return "Unknown Crew";
    return `${profile.first_name} ${profile.middle_name || ""} ${
      profile.last_name
    }`.trim();
  };

  const getDocumentType = () => {
    return update.travelDocument?.travel_document_type?.name || "N/A";
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {getCrewName()}
        </div>
        <div className="text-sm text-gray-500">
          {update.travelDocument?.user_profile?.crew_id || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {getDocumentType()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {update.updated_data.id_no || "N/A"}
        </div>
        <div className="text-xs text-gray-500">
          Original: {update.original_data.id_no || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(update.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(update.created_at).toLocaleDateString()}
        <br />
        <span className="text-xs">
          {new Date(update.created_at).toLocaleTimeString()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {update.reviewed_at ? (
          <>
            {new Date(update.reviewed_at).toLocaleDateString()}
            <br />
            <span className="text-xs">
              {new Date(update.reviewed_at).toLocaleTimeString()}
            </span>
          </>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onViewUpdate(update)}
          className="text-purple-600 hover:text-purple-900 inline-flex items-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
      </td>
    </tr>
  );
}