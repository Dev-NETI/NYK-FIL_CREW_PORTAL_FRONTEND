"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";

import AddSlotModal from "./modals/AddSlotModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import TableSkeleton from "@/components/TableSkeleton";

import {
  DepartmentSchedule,
  DepartmentScheduleService,
} from "@/services/department-schedule";

import { formatTime, formatDate } from "@/lib/utils";

type ServerErrors = Record<string, string[]>;

export default function DepartmentSettings() {
  const [slots, setSlots] = useState<DepartmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState<boolean | DepartmentSchedule>(false);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentSchedule | null>(null);

  const [formErrors, setFormErrors] = useState<ServerErrors | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await DepartmentScheduleService.getAll();
      setSlots(res.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSaveSlot = async (slot: any) => {
    try {
      setFormErrors(null);

      if (slot.id) {
        await DepartmentScheduleService.update(slot.id, {
          total_slots: slot.total_slots,
          opening_time: slot.opening_time,
          closing_time: slot.closing_time,
          slot_duration_minutes: slot.slot_duration_minutes,
        });
        toast.success("Schedule updated");
      } else {
        await DepartmentScheduleService.create({
          date: slot.date,
          total_slots: slot.total_slots,
          opening_time: slot.opening_time,
          closing_time: slot.closing_time,
          slot_duration_minutes: slot.slot_duration_minutes,
        });
        toast.success("Schedule saved");
      }

      await fetchSlots();
      setShowModal(false);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 422) {
        setFormErrors(error?.response?.data?.errors ?? {});
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to save schedule");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await DepartmentScheduleService.delete(deleteTarget.id);
      setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Schedule deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete schedule");
    } finally {
      setDeleteTarget(null);
    }
  };

  const deleteMessage = deleteTarget
    ? `Are you sure you want to delete the schedule for ${formatDate(
        deleteTarget.date
      )} (${formatTime(deleteTarget.opening_time)} - ${formatTime(
        deleteTarget.closing_time
      )})? This action cannot be undone.`
    : "";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold">Department Daily Schedules</h2>

        <button
          onClick={() => {
            setFormErrors(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          + Add Daily Slot
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={5} rows={6} />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Opening</th>
                  <th className="p-3 text-left">Closing</th>
                  <th className="p-3 text-left">Capacity</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className="border-b">
                    <td className="p-3">{formatDate(slot.date)}</td>
                    <td className="p-3">{formatTime(slot.opening_time)}</td>
                    <td className="p-3">{formatTime(slot.closing_time)}</td>
                    <td className="p-3">{slot.total_slots}</td>

                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setFormErrors(null);
                            setShowModal(slot);
                          }}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>

                        <button
                          onClick={() => setDeleteTarget(slot)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {slots.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No schedules added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-3">
            {slots.length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">
                No schedules added.
              </div>
            )}

            {slots.map((slot) => (
              <div
                key={slot.id}
                className="border rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(slot.date)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(slot.opening_time)} - {formatTime(slot.closing_time)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Capacity: {slot.total_slots}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setFormErrors(null);
                      setShowModal(slot);
                    }}
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
                  >
                    <Edit size={16} /> Edit
                  </button>

                  <button
                    onClick={() => setDeleteTarget(slot)}
                    className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <AddSlotModal
          initialData={typeof showModal === "object" ? showModal : null}
          serverErrors={formErrors ?? undefined}
          onClose={() => {
            setFormErrors(null);
            setShowModal(false);
          }}
          onSave={handleSaveSlot}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Schedule"
        message={deleteMessage}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
