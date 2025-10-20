import { EmploymentDocumentUpdate } from "@/services/employment-document-approval";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface PendingUpdatesTableProps {
  updates: EmploymentDocumentUpdate[];
  onViewUpdate: (update: EmploymentDocumentUpdate) => void;
}

export default function PendingUpdatesTable({
  updates,
  onViewUpdate,
}: PendingUpdatesTableProps) {
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

  const getCrewName = (update: EmploymentDocumentUpdate) => {
    const profile = update.employment_document?.user_profile;
    if (!profile) return "Unknown Crew";
    return `${profile.first_name} ${profile.middle_name || ""} ${
      profile.last_name
    }`.trim();
  };

  if (updates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No update requests found
        </h3>
        <p className="text-gray-500">
          There are no employment document update requests at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crew Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewed
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {updates.map((update) => (
              <tr key={update.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getCrewName(update)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {update.employment_document?.user_profile?.crew_id || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {update.updated_data.document_number || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Original: {update.original_data.document_number || "N/A"}
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
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
