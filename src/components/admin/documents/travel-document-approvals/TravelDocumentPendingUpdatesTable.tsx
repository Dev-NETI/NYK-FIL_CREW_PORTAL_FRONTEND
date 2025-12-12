import { TravelDocumentUpdate } from "@/services/travel-document-approval";
import { Clock } from "lucide-react";
import TravelDocumentPendingUpdatesTableListItemComponent from "./TravelDocumentPendingUpdatesTableListItemComponent";

interface TravelDocumentPendingUpdatesTableProps {
  updates: TravelDocumentUpdate[];
  onViewUpdate: (update: TravelDocumentUpdate) => void;
}

export default function TravelDocumentPendingUpdatesTable({
  updates,
  onViewUpdate,
}: TravelDocumentPendingUpdatesTableProps) {
  if (updates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No update requests found
        </h3>
        <p className="text-gray-500">
          There are no travel document update requests at this time.
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
                Document Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Number
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
              <TravelDocumentPendingUpdatesTableListItemComponent
                key={update.id}
                update={update}
                onViewUpdate={onViewUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
