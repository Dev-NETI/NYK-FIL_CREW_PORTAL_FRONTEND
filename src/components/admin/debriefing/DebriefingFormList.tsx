"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, Eye, Download, RefreshCw } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import Pagination from "@/components/Pagination";
import ConfirmDebriefingModal from "./modal/ConfirmDebriefingModal";
import { formatDate, getStatusBadge } from "@/lib/utils";
import { AdminDebriefingService, DebriefingForm } from "@/services/admin-debriefing";
import DebriefingFilters, { DebriefingFilters as Filters } from "./filter/DebriefingListFilter";
import DebriefingReadOnlyModal from "@/components/DebriefingReadOnlyModal";

const PAGE_SIZE = 10;
const POLL_MS = 4000;

function PdfBadge({ status }: { status?: DebriefingForm["pdf_status"] }) {
  if (!status) return null;

  const base = "px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center";

  if (status === "ready") return <span className={`${base} bg-green-100 text-green-700`}>Ready</span>;

  if (status === "pending" || status === "generating")
    return <span className={`${base} bg-amber-100 text-amber-700`}>Generating…</span>;

  if (status === "failed") return <span className={`${base} bg-red-100 text-red-700`}>Failed</span>;

  return null;
}

export default function DebriefingFormList() {
  const [forms, setForms] = useState<DebriefingForm[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    crewName: "",
    vessel: "",
    dateFrom: "",
    dateTo: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedForm, setSelectedForm] = useState<DebriefingForm | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | undefined>(undefined);

  const pollRef = useRef<number | null>(null);

  const getCrewName = (form: DebriefingForm) => {
    if (form.crew_name) return form.crew_name;

    const profile = form.crew?.profile;
    if (!profile) return `Crew #${form.crew_id}`;

    return `${profile.last_name ?? ""}, ${profile.first_name ?? ""} ${profile.middle_name ?? ""}`
      .replace(/\s+/g, " ")
      .trim();
  };

  const buildParams = (page: number) => {
    const params: any = { per_page: PAGE_SIZE, page };

    if (filters.status !== "all") params.status = filters.status;
    if (filters.crewName.trim()) params.crew_name = filters.crewName.trim();
    if (filters.vessel.trim()) params.vessel = filters.vessel.trim();
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    return params;
  };

  const fetchForms = async (page = currentPage, silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await AdminDebriefingService.getForms(buildParams(page));
      const paginated = res.data;

      setForms(paginated?.data ?? []);
      setCurrentPage(paginated?.current_page ?? page);
      setTotalPages(paginated?.last_page ?? 1);
      setTotalItems(paginated?.total ?? 0);
    } catch (e: any) {
      if (!silent) toast.error(e?.response?.data?.message || "Failed to load debriefing forms");
      setForms([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchForms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.crewName, filters.vessel, filters.dateFrom, filters.dateTo]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchForms(page);
  };

  const resetConfirmState = () => {
    setShowConfirmModal(false);
    setSelectedForm(null);
  };

  const canConfirm = (status: DebriefingForm["status"]) => status === "submitted";

  const isPdfReady = (f: DebriefingForm) => f.status === "confirmed" && f.pdf_status === "ready";
  const isPdfGenerating = (f: DebriefingForm) =>
    f.status === "confirmed" && (f.pdf_status === "pending" || f.pdf_status === "generating");
  const isPdfFailed = (f: DebriefingForm) => f.status === "confirmed" && f.pdf_status === "failed";

  const hasGenerating = useMemo(() => forms.some((f) => isPdfGenerating(f)), [forms]);

  useEffect(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (!hasGenerating) return;

    pollRef.current = window.setInterval(() => {
      fetchForms(currentPage, true);
    }, POLL_MS);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGenerating, currentPage, filters.status, filters.crewName, filters.vessel, filters.dateFrom, filters.dateTo]);

  const confirmForm = async () => {
    if (!selectedForm) return;

    try {
      setConfirming(true);
      await AdminDebriefingService.confirmForm(selectedForm.id);
      toast.success("Debriefing form confirmed. PDF is generating…");
      await fetchForms(currentPage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to confirm form");
    } finally {
      setConfirming(false);
      resetConfirmState();
    }
  };

  const openPreview = async (id: number) => {
    try {
      await AdminDebriefingService.previewPdf(id);
    } catch (e: any) {
      if (e?.response?.status === 409) toast("PDF is still being generated. Please try again later.");
      else toast.error(e?.response?.data?.message || "Failed to preview PDF");
    }
  };

  const openDownload = async (id: number) => {
    try {
      await AdminDebriefingService.downloadPdf(id);
    } catch (e: any) {
      if (e?.response?.status === 409) toast("PDF is still being generated. Please try again later.");
      else toast.error(e?.response?.data?.message || "Failed to download PDF");
    }
  };

  const regeneratePdf = async (id: number) => {
    try {
      await AdminDebriefingService.regeneratePdf(id);
      toast.success("PDF regeneration queued");
      await fetchForms(currentPage);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to regenerate PDF");
    }
  };

  const openViewModal = (id: number) => {
    setActiveId(id);
    setViewOpen(true);
  };

  const closeViewModal = () => {
    setViewOpen(false);
    setActiveId(undefined);
  };

  return (
    <>
      <DebriefingFilters
        value={filters}
        onChange={(v: any) => {
          setFilters(v);
          setCurrentPage(1);
        }}
        onClear={() => {
          setFilters({ status: "all", crewName: "", vessel: "", dateFrom: "", dateTo: "" });
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <TableSkeleton columns={8} rows={10} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Form ID</th>
                  <th className="px-4 py-3 text-left">Crew</th>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Vessel</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Confirmed</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {forms.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      No debriefing forms found
                    </td>
                  </tr>
                )}

                {forms.map((f) => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">#{f.id}</td>
                    <td className="px-4 py-3">{getCrewName(f)}</td>
                    <td className="px-4 py-3">{f.rank ?? "-"}</td>
                    <td className="px-4 py-3">{f.embarkation_vessel_name ?? "-"}</td>

                    <td className="px-4 py-3">
                      {f.submitted_at ? formatDate(String(f.submitted_at).slice(0, 10)) : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(f.status as any)}`}>
                          {f.status}
                        </span>
                        {f.status === "confirmed" && <PdfBadge status={f.pdf_status} />}
                      </div>

                      {isPdfFailed(f) && f.pdf_error && (
                        <div className="text-xs text-red-600 mt-1 truncate" title={f.pdf_error}>
                          {f.pdf_error}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {f.confirmed_at ? (
                        <span className="text-gray-700">{formatDate(String(f.confirmed_at).slice(0, 10))}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          title="View form"
                          className="text-blue-600 hover:text-blue-700 transition"
                          onClick={() => openViewModal(f.id)}
                        >
                          <Eye size={18} />
                        </button>

                        {canConfirm(f.status) && (
                          <button
                            title="Confirm form"
                            className="text-green-600 hover:text-green-700 transition"
                            onClick={() => {
                              setSelectedForm(f);
                              setShowConfirmModal(true);
                            }}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        {f.status === "confirmed" ? (
                          <>
                            <button
                              title={
                                isPdfReady(f) ? "Preview PDF" : isPdfGenerating(f) ? "PDF is generating…" : "PDF not ready"
                              }
                              className={`transition ${isPdfReady(f) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-not-allowed"
                                }`}
                              onClick={() => isPdfReady(f) && openPreview(f.id)}
                              disabled={!isPdfReady(f)}
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              title={
                                isPdfReady(f) ? "Download PDF" : isPdfGenerating(f) ? "PDF is generating…" : "PDF not ready"
                              }
                              className={`transition ${isPdfReady(f) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-not-allowed"
                                }`}
                              onClick={() => isPdfReady(f) && openDownload(f.id)}
                              disabled={!isPdfReady(f)}
                            >
                              <Download size={18} />
                            </button>

                            {isPdfFailed(f) && (
                              <button
                                title="Regenerate PDF"
                                className="text-red-600 hover:text-red-700 transition"
                                onClick={() => regeneratePdf(f.id)}
                              >
                                <RefreshCw size={18} />
                              </button>
                            )}
                          </>
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

          <div className="lg:hidden p-4 space-y-3">
            {forms.length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">No debriefing forms found</div>
            )}

            {forms.map((f) => (
              <div key={f.id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      #{f.id} — {getCrewName(f)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{f.embarkation_vessel_name ?? "-"}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(f.status as any)}`}>
                      {f.status}
                    </span>
                    {f.status === "confirmed" && <PdfBadge status={f.pdf_status} />}
                  </div>
                </div>

                {isPdfFailed(f) && f.pdf_error && (
                  <div className="text-xs text-red-600 mt-2 truncate" title={f.pdf_error}>
                    {f.pdf_error}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500">Rank</p>
                    <p className="font-medium text-gray-900">{f.rank ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {f.submitted_at ? formatDate(String(f.submitted_at).slice(0, 10)) : "—"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="text-blue-600 hover:text-blue-700 transition p-1"
                        title="View form"
                        onClick={() => openViewModal(f.id)}
                      >
                        <Eye size={18} />
                      </button>

                      {f.status === "confirmed" && (
                        <>
                          <button
                            className={`transition p-1 ${isPdfReady(f) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-not-allowed"
                              }`}
                            title={isPdfReady(f) ? "Preview PDF" : isPdfGenerating(f) ? "PDF is generating…" : "PDF not ready"}
                            onClick={() => isPdfReady(f) && openPreview(f.id)}
                            disabled={!isPdfReady(f)}
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            className={`transition p-1 ${isPdfReady(f) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-not-allowed"
                              }`}
                            title={isPdfReady(f) ? "Download PDF" : isPdfGenerating(f) ? "PDF is generating…" : "PDF not ready"}
                            onClick={() => isPdfReady(f) && openDownload(f.id)}
                            disabled={!isPdfReady(f)}
                          >
                            <Download size={18} />
                          </button>

                          {isPdfFailed(f) && (
                            <button
                              title="Regenerate PDF"
                              className="text-red-600 hover:text-red-700 transition p-1"
                              onClick={() => regeneratePdf(f.id)}
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={PAGE_SIZE}
            totalItems={totalItems}
          />
        </div>
      )}

      {showConfirmModal && selectedForm && (
        <ConfirmDebriefingModal
          isOpen={showConfirmModal}
          onClose={resetConfirmState}
          onConfirm={confirmForm}
          loading={confirming}
          formId={selectedForm.id}
        />
      )}

      <DebriefingReadOnlyModal
        isOpen={viewOpen}
        onClose={closeViewModal}
        formId={activeId}
        fetchForm={(id) => AdminDebriefingService.getForm(id)}
        headerNote="Read-only view. Use Override to edit submitted forms."
      />
    </>
  );
}
