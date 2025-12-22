"use client";

import { useEffect, useState } from "react";
import CancelModal from "./modals/CancelModal";
import ConfirmCancelModal from "./modals/ConfirmModal";
import AppointmentFilters from "./Filters";
import {
  Appointment,
  AppointmentService,
} from "@/services/appointment";

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [reason, setReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await AppointmentService.getAppointments();
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to load appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openCancelModal = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setReason("");
    setShowCancelModal(true);
  };

  const proceedToConfirm = () => {
    if (!reason.trim()) return;
    setShowCancelModal(false);
    setShowConfirmModal(true);
  };

  const finalizeCancellation = async () => {
    if (!selectedAppointment) return;

    try {
      await AppointmentService.cancelAppointment(
        selectedAppointment.id,
        reason
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id
            ? {
                ...appt,
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason,
              }
            : appt
        )
      );
    } catch (error) {
      console.error("Cancellation failed", error);
    } finally {
      setShowConfirmModal(false);
      setSelectedAppointment(null);
      setReason("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>

      <AppointmentFilters onFilterChange={() => {}} />

      {loading ? (
        <p className="text-sm text-gray-500 mt-4">
          Loading appointments...
        </p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Crew ID</th>
                <th className="p-3 text-left">Type ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b">
                  <td className="p-3">{appt.crew_id}</td>
                  <td className="p-3">{appt.appointment_type_id}</td>
                  <td className="p-3">{appt.date}</td>
                  <td className="p-3">{appt.time}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs capitalize ${
                        appt.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {appt.status === "confirmed" && (
                      <button
                        onClick={() => openCancelModal(appt)}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {!appointments.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-gray-500"
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCancelModal && (
        <CancelModal
          reason={reason}
          setReason={setReason}
          onClose={() => setShowCancelModal(false)}
          onProceed={proceedToConfirm}
        />
      )}

      {showConfirmModal && (
        <ConfirmCancelModal
          onClose={() => setShowConfirmModal(false)}
          onConfirm={finalizeCancellation}
        />
      )}
    </div>
  );
}
