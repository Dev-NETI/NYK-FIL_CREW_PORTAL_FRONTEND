"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { XCircle } from "lucide-react";
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

  const canCancel = (status: string) => status === "confirmed" || status === "pending";

  const openCancelFlow = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  return (
    <>
      {loading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg">
          <TableSkeleton columns={8} rows={10} />
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
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm">
                {totalItems === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No appointments found
                    </td>
                  </tr>
                )}

                {totalItems > 0 &&
                  paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {appointment.department?.name ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        {appointment.type?.name ?? "-"}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <span className="block truncate" title={appointment.purpose ?? ""}>
                          {appointment.purpose ?? "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {formatDate(appointment.date)}
                      </td>

                      <td className="px-6 py-4">
                        {formatTime(appointment.time)}
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <div className="space-y-3 p-4">
              {totalItems === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No appointments found
                </div>
              )}

              {totalItems > 0 &&
                paginatedAppointments.map((appointment) => {
                  const isCancelled = appointment.status === "cancelled";

                  return (
                    <div
                      key={appointment.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {appointment.type?.name ?? "Appointment"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {appointment.department?.name ?? "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>

                          {canCancel(appointment.status) && (
                            <button
                              onClick={() => openCancelFlow(appointment)}
                              className="text-red-600 hover:text-red-700 transition p-1"
                              title="Cancel appointment"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                        </div>

                        {isCancelled ? (
                          <div className="text-right">
                            <span className="text-gray-500">Reason:</span>
                            <p className="font-medium text-gray-900 break-words">
                              {getCancellationReason(appointment)}
                            </p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-gray-500">Time:</span>
                            <p className="font-medium text-gray-900">
                              {formatTime(appointment.time)}
                            </p>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Time:</span>
                            <p className="font-medium text-gray-900">
                              {formatTime(appointment.time)}
                            </p>
                          </div>
                        )}

                        <div className="col-span-2">
                          <span className="text-gray-500">Purpose:</span>
                          <p className="font-medium text-gray-900 break-words">
                            {appointment.purpose ?? "-"}
                          </p>
                        </div>
                      </div>
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
    </>
  );
}
