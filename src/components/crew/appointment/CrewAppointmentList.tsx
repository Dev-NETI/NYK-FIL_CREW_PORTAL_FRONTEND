"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { XCircle } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ── Status config for mobile cards ──────────────────────────────────────────
const STATUS_CARD_CONFIG: Record<
  string,
  { border: string; iconBg: string; iconColor: string; icon: string; badgeBg: string; badgeText: string }
> = {
  pending: {
    border: "border-l-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: "bi-hourglass-split",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  confirmed: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: "bi-calendar-check-fill",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  cancelled: {
    border: "border-l-red-400",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    icon: "bi-calendar-x-fill",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
  completed: {
    border: "border-l-blue-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: "bi-calendar2-check-fill",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
};

import QrModal from "./QrModal";
import CancelReasonModal from "@/components/CancelReasonModal";
import ConfirmActionModal from "@/components/ConfirmActionModal";
import Pagination from "@/components/Pagination";
import TableSkeleton from "@/components/TableSkeleton";

import {
  formatTime,
  formatDate,
  getStatusBadge,
  getCancellationReason,
} from "@/lib/utils";

import { Appointment } from "@/services/admin-appointment";
import { CrewAppointmentService } from "@/services/crew-appointments";

const ITEMS_PER_PAGE = 10;

export default function CrewAppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showQr, setShowQr] = useState(false);
  const [qrAppointmentId, setQrAppointmentId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await CrewAppointmentService.getAppointments();
      setAppointments(res.data);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const totalItems = appointments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [appointments, currentPage]);

  const canCancel = (status: string) =>
    status === "confirmed" || status === "pending";

  const openCancelFlow = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const openQrFlow = (appointmentId: number) => {
    setQrAppointmentId(appointmentId);
    setShowQr(true);
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await CrewAppointmentService.cancelAppointment(
        selectedAppointment.id,
        cancelReason
      );

      toast.success("Appointment cancelled");

      setShowConfirmModal(false);
      setSelectedAppointment(null);
      setCancelReason("");

      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  return (
    <>
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg">
          <TableSkeleton columns={9} rows={10} />
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Department</th>
                  <th className="px-6 py-3 text-left">Appointment Type</th>
                  <th className="px-6 py-3 text-left">Purpose</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Session</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-center">Action</th>
                  <th className="px-4 py-3 text-center">Show QR</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm">
                {totalItems === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No appointments found
                    </td>
                  </tr>
                )}

                {totalItems > 0 &&
                  paginatedAppointments.map((appointment) => {
                    const isPast = new Date(`${appointment.date}T${appointment.time}`) < new Date();
                    const canShowQr = appointment.status === "confirmed" && !isPast;

                    return (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {appointment.department?.name ?? "-"}
                        </td>

                        <td className="px-6 py-4">
                          {appointment.type?.name ?? "-"}
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <span
                            className="block truncate"
                            title={appointment.purpose ?? ""}
                          >
                            {appointment.purpose ?? "-"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {formatDate(appointment.date)}
                        </td>

                        <td className="px-6 py-4">
                          {appointment.session}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {appointment.status === "cancelled" ? (
                            <span className="text-gray-700">
                              {getCancellationReason(appointment)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {canCancel(appointment.status) ? (
                            <button
                              onClick={() => openCancelFlow(appointment)}
                              className="inline-flex items-center justify-center text-red-600 hover:text-red-700 transition"
                              title="Cancel appointment"
                            >
                              <XCircle size={18} />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Tooltip
                            title={
                              canShowQr
                                ? "Show QR"
                                : "QR available only for confirmed appointments"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={!canShowQr}
                                onClick={() => openQrFlow(appointment.id)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <div className="space-y-3 p-4">
              {totalItems === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <i className="bi bi-calendar2-x text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No appointments yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your booked appointments will appear here</p>
                </div>
              )}

              {totalItems > 0 &&
                paginatedAppointments.map((appointment) => {
                  const isCancelled = appointment.status === "cancelled";
                  const isPast = new Date(`${appointment.date}T${appointment.time}`) < new Date();
                  const canShowQr = appointment.status === "confirmed" && !isPast;
                  const cfg = STATUS_CARD_CONFIG[appointment.status] ?? STATUS_CARD_CONFIG.pending;

                  return (
                    <div
                      key={appointment.id}
                      className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${cfg.border} overflow-hidden shadow-sm`}
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                          <i className={`bi ${cfg.icon} text-lg ${cfg.iconColor}`}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 truncate leading-tight">
                            {appointment.type?.name ?? "Appointment"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            <i className="bi bi-building mr-1"></i>
                            {appointment.department?.name ?? "—"}
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                          {appointment.status}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 border-t border-gray-100" />

                      {/* Details */}
                      <div className="px-4 py-3 space-y-2.5">
                        {/* Date + Session */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <i className="bi bi-calendar3 text-gray-500 text-xs"></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none">Date</p>
                              <p className="text-xs font-semibold text-gray-800 mt-0.5">{formatDate(appointment.date)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <i className="bi bi-clock text-gray-500 text-xs"></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none">Session</p>
                              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                {appointment.session ?? formatTime(appointment.time)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Purpose */}
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="bi bi-chat-left-text text-gray-500 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none">Purpose</p>
                            <p className="text-xs font-medium text-gray-700 mt-0.5 leading-snug line-clamp-2">
                              {appointment.purpose ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* Cancellation reason */}
                        {isCancelled && getCancellationReason(appointment) && (
                          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            <i className="bi bi-exclamation-circle-fill text-red-400 text-xs mt-0.5 flex-shrink-0"></i>
                            <div>
                              <p className="text-[10px] text-red-500 uppercase tracking-wider font-semibold leading-none">Cancellation Reason</p>
                              <p className="text-xs text-red-700 font-medium mt-0.5 leading-snug">
                                {getCancellationReason(appointment)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action footer */}
                      {(canCancel(appointment.status) || canShowQr || appointment.status === "confirmed") && (
                        <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                          {canShowQr && (
                            <button
                              onClick={() => openQrFlow(appointment.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold transition-all"
                            >
                              <i className="bi bi-qr-code text-sm"></i>
                              Show QR Code
                            </button>
                          )}

                          {!canShowQr && appointment.status === "confirmed" && (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed">
                              <i className="bi bi-qr-code text-sm"></i>
                              QR Unavailable
                            </div>
                          )}

                          {canCancel(appointment.status) && (
                            <button
                              onClick={() => openCancelFlow(appointment)}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-600 text-xs font-bold transition-all ${canShowQr || appointment.status === "confirmed" ? "px-4" : "flex-1"}`}
                            >
                              <i className="bi bi-x-circle text-sm"></i>
                              {(canShowQr || appointment.status === "confirmed") ? "" : "Cancel Appointment"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
            />
          )}
        </div>
      )}

      {showCancelModal && (
        <CancelReasonModal
          reason={cancelReason}
          setReason={setCancelReason}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
            setCancelReason("");
          }}
          onProceed={() => {
            if (!cancelReason.trim()) {
              toast.error("Please provide a cancellation reason");
              return;
            }
            setShowCancelModal(false);
            setShowConfirmModal(true);
          }}
        />
      )}

      {showConfirmModal && (
        <ConfirmActionModal
          type="cancel"
          onClose={() => {
            setShowConfirmModal(false);
            setCancelReason("");
            setSelectedAppointment(null);
          }}
          onConfirm={handleCancel}
        />
      )}

      <QrModal
        open={showQr}
        appointmentId={qrAppointmentId}
        onClose={() => {
          setShowQr(false);
          setQrAppointmentId(null);
        }}
      />
    </>
  );
}
