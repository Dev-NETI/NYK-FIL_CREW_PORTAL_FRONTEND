"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Download, FileText, Pencil } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import Pagination from "@/components/Pagination";
import { formatDate, getStatusBadge, getDisplayFormId } from "@/lib/utils";
import { CrewDebriefingService, DebriefingForm } from "@/services/crew-debriefing";
import CrewDebriefingFormModal from "@/components/crew/documents/debriefing/form/CrewDebriefingFormModal";
import DebriefingReadOnlyModal from "@/components/DebriefingReadOnlyModal";

const ITEMS_PER_PAGE = 10;

export default function DebriefingListComponent() {
  const [forms, setForms] = useState<DebriefingForm[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [readOpen, setReadOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | undefined>(undefined);

  const fetchForms = async (page = 1) => {
    try {
      setLoading(true);

      const res = await CrewDebriefingService.getForms({
        per_page: ITEMS_PER_PAGE,
        page,
      });

      const paginated = res.data;

      setForms(paginated?.data ?? []);
      setCurrentPage(paginated?.current_page ?? page);
      setTotalPages(paginated?.last_page ?? 1);
      setTotalItems(paginated?.total ?? 0);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load debriefing forms");
      setForms([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchForms(page);
  };

  const openDownload = async (id: number) => {
    try {
      await CrewDebriefingService.downloadPdf(id);
    } catch (e: any) {
      if (e?.response?.status === 409) toast("PDF is not ready yet.");
      else toast.error(e?.response?.data?.message || "Failed to download PDF");
    }
  };

  const handleOpenAction = (f: DebriefingForm) => {
    setActiveId(f.id);

    if (f.status === "draft") {
      setEditOpen(true);
      return;
    }

    setReadOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <TableSkeleton columns={6} rows={8} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Debriefing Forms</h2>
              <p className="text-sm text-gray-600">
                Drafts can be edited. Submitted forms are pending review. Confirmed forms can generate PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Form ID</th>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Vessel</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {forms.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No debriefing forms yet
                  </td>
                </tr>
              )}

              {forms.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{getDisplayFormId(f.id)}</td>
                  <td className="px-4 py-3">{f.rank ?? "-"}</td>
                  <td className="px-4 py-3">{f.embarkation_vessel_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    {f.submitted_at ? formatDate(String(f.submitted_at).slice(0, 10)) : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                          f.status as any
                        )}`}
                      >
                        {f.status}
                      </span>

                      {f.status === "submitted" && (
                        <span className="text-xs text-gray-500">Awaiting confirmation</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        title={f.status === "draft" ? "Edit draft" : "View (read-only)"}
                        className="text-blue-600 hover:text-blue-700 transition"
                        onClick={() => handleOpenAction(f)}
                      >
                        {f.status === "draft" ? <Pencil size={18} /> : <Eye size={18} />}
                      </button>

                      {f.status === "confirmed" ? (
                        <button
                          title="Download PDF"
                          className="text-gray-700 hover:text-gray-900 transition"
                          onClick={() => openDownload(f.id)}
                        >
                          <Download size={18} />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="lg:hidden p-4 space-y-3">
          {forms.length === 0 && (
            <div className="py-10 text-center text-gray-500 text-sm">
              No debriefing forms yet
            </div>
          )}

          {forms.map((f) => (
            <div key={f.id} className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    #{f.id} — {f.embarkation_vessel_name ?? "-"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{f.rank ?? "-"}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                      f.status as any
                    )}`}
                  >
                    {f.status}
                  </span>

                  {f.status === "submitted" && (
                    <span className="text-[11px] text-gray-500">Awaiting confirmation</span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {f.submitted_at ? formatDate(String(f.submitted_at).slice(0, 10)) : "—"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-700 transition p-1"
                    title={f.status === "draft" ? "Edit draft" : "View (read-only)"}
                    onClick={() => handleOpenAction(f)}
                  >
                    {f.status === "draft" ? <Pencil size={18} /> : <Eye size={18} />}
                  </button>

                  {f.status === "confirmed" && (
                    <button
                      className="text-gray-700 hover:text-gray-900 transition p-1"
                      title="Download PDF"
                      onClick={() => openDownload(f.id)}
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalItems}
        />
      </div>

      <CrewDebriefingFormModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setActiveId(undefined);
        }}
        onSuccess={() => {
          fetchForms(currentPage);
        }}
        formId={activeId}
      />

      <DebriefingReadOnlyModal
        isOpen={readOpen}
        onClose={() => setReadOpen(false)}
        formId={activeId}
        fetchForm={(id) => CrewDebriefingService.getForm(id)}
      />;
    </>
  );
}
