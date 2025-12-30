"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { formatTime, formatDate } from "@/lib/utils";
import { AdminAppointmentService, AppointmentService } from "@/services/appointment";

import CancelReasonModal from "@/components/CancelReasonModal";
import ConfirmActionModal from "@/components/ConfirmActionModal";
import AppointmentFilters from "./AppointmentListFilter";
import Pagination from "@/components/Pagination";
import TableSkeleton from "@/components/TableSkeleton";

type AppointmentStatus = "pending" | "confirmed" | "cancelled";
type FilterStatus = "all" | AppointmentStatus;

interface Appointment {
  id: number;
  user_id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  type?: {
    id?: number;
    name?: string;
  };
  user?: {
    profile?: {
      first_name: string;
      middle_name?: string | null;
      last_name: string;
    };
  };
}

interface AppointmentTypeOption {
  id: number;
  name: string;
}

interface Filters {
  status: FilterStatus;
  name: string;
  typeId: string;
  date: string;
}

const PAGE_SIZE = 10;

export default function AdminAppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState<AppointmentTypeOption[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reason, setReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState<"confirm" | "cancel" | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    name: "",
    typeId: "all",
    date: "",
  });

  const [page, setPage] = useState(1);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await AdminAppointmentService.getAppointments();
      setAppointments(res.data ?? []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      setTypesLoading(true);
      const res = await AppointmentService.getAppointmentTypes();
      setTypes(res.data ?? []);
    } catch {
      setTypes([]);
    } finally {
      setTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchTypes();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getCrewName = (appt: Appointment) => {
    const profile = appt.user?.profile;
    if (!profile) return `Crew #${appt.user_id}`;
    return `${profile.last_name}, ${profile.first_name} ${profile.middle_name ?? ""}`.trim();
  };

  const filteredAppointments = useMemo(() => {
    const { status, name, typeId, date } = filters;

    return appointments.filter((appt) => {
      const profile = appt.user?.profile;
      const fullName = profile
        ? `${profile.first_name} ${profile.middle_name ?? ""} ${profile.last_name}`
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()
        : "";

      const matchStatus = status === "all" || appt.status === status;
      const matchName = !name || fullName.includes(name.toLowerCase().trim());
      const matchType = typeId === "all" || String(appt.type?.id ?? "") === String(typeId);
      const matchDate = !date || (appt.date ?? "").startsWith(date);

      return matchStatus && matchName && matchType && matchDate;
    });
  }, [appointments, filters]);

  const total = filteredAppointments.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + PAGE_SIZE);

  const resetModalState = () => {
    setShowCancelModal(false);
    setShowConfirmModal(false);
    setConfirmType(null);
    setSelectedAppointment(null);
    setReason("");
  };

  const confirmAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await AppointmentService.confirmAppointment(selectedAppointment.id);
      toast.success("Appointment confirmed");
      fetchAppointments();
    } catch {
      toast.error("Failed to confirm appointment");
    } finally {
      resetModalState();
    }
  };

  const finalizeCancellation = async () => {
    if (!selectedAppointment) return;

    try {
      await AdminAppointmentService.cancelAppointment(selectedAppointment.id, reason);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel appointment");
    } finally {
      resetModalState();
    }
  };

  const canAct = (status: AppointmentStatus) => status === "pending";

  return (
    <>
      <AppointmentFilters
        value={filters}
        types={types}
        typesLoading={typesLoading}
        onChange={(v) => {
          setFilters(v);
          setPage(1);
        }}
        onClear={() => {
          setFilters({
            status: "all",
            name: "",
            typeId: "all",
            date: "",
          });
          setPage(1);
        }}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <TableSkeleton columns={6} rows={10} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Crew</th>
                  <th className="px-4 py-3 text-left">Appointment Type</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {total === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                )}

                {total > 0 &&
                  paginatedAppointments.map((appt) => (
                    <tr key={appt.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{getCrewName(appt)}</td>
                      <td className="px-4 py-3">{appt.type?.name ?? "-"}</td>
                      <td className="px-4 py-3">{formatDate(appt.date)}</td>
                      <td className="px-4 py-3">{formatTime(appt.time)}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {canAct(appt.status) ? (
                          <div className="flex justify-center gap-3">
                            <button
                              title="Confirm appointment"
                              className="text-green-600 hover:text-green-700 transition"
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setConfirmType("confirm");
                                setShowConfirmModal(true);
                              }}
                            >
                              <CheckCircle size={18} />
                            </button>

                            <button
                              title="Cancel appointment"
                              className="text-red-600 hover:text-red-700 transition"
                              onClick={() => {
                                setSelectedAppointment(appt);
                                setReason("");
                                setShowCancelModal(true);
                              }}
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden p-4 space-y-3">
            {total === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">No appointments found</div>
            )}

            {total > 0 &&
              paginatedAppointments.map((appt) => (
                <div key={appt.id} className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {getCrewName(appt)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{appt.type?.name ?? "-"}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>

                      {canAct(appt.status) && (
                        <div className="flex items-center gap-2">
                          <button
                            title="Confirm appointment"
                            className="text-green-600 hover:text-green-700 transition p-1"
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setConfirmType("confirm");
                              setShowConfirmModal(true);
                            }}
                          >
                            <CheckCircle size={18} />
                          </button>

                          <button
                            title="Cancel appointment"
                            className="text-red-600 hover:text-red-700 transition p-1"
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setReason("");
                              setShowCancelModal(true);
                            }}
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(appt.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">{formatTime(appt.time)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {total > 0 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              itemsPerPage={PAGE_SIZE}
              totalItems={total}
            />
          )}
        </div>
      )}

      {showCancelModal && (
        <CancelReasonModal
          reason={reason}
          setReason={setReason}
          onClose={resetModalState}
          onProceed={() => {
            if (!reason.trim()) {
              toast.error("Please provide a cancellation reason");
              return;
            }
            setShowCancelModal(false);
            setConfirmType("cancel");
            setShowConfirmModal(true);
          }}
        />
      )}

      {showConfirmModal && confirmType && (
        <ConfirmActionModal
          type={confirmType}
          onClose={resetModalState}
          onConfirm={() => {
            confirmType === "confirm" ? confirmAppointment() : finalizeCancellation();
          }}
        />
      )}
    </>
  );
}
