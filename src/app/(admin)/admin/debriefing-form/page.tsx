import AdminDebriefingList from "@/components/admin/debriefing/DebriefingFormList";

export default function AdminDebriefingFormsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Debriefing Forms</h1>
        <p className="text-sm text-gray-600">
          Review submitted forms, confirm, and generate official PDFs.
        </p>
      </div>

      <AdminDebriefingList />
    </div>
  );
}
