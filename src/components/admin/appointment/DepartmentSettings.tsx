"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import AddSlotModal from "./modals/AddSlotModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import {
  DepartmentSchedule,
  DepartmentScheduleService,
} from "@/services/department-schedule";

export default function DepartmentSettings() {
  const [slots, setSlots] = useState<DepartmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState<
    boolean | DepartmentSchedule
  >(false);

  const [deleteTarget, setDeleteTarget] =
    useState<DepartmentSchedule | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await DepartmentScheduleService.getAll();
      setSlots(res.data);
    } catch (e) {
      console.error("Failed to fetch schedules", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSaveSlot = async (slot: any) => {
    try {
      if (slot.id) {
        await DepartmentScheduleService.update(slot.id, {
          total_slots: slot.total_slots,
          opening_time: slot.opening_time,
          closing_time: slot.closing_time,
          slot_duration_minutes: slot.slot_duration_minutes,
        });
      } else {
        await DepartmentScheduleService.create({
          date: slot.date,
          total_slots: slot.total_slots,
          opening_time: slot.opening_time,
          closing_time: slot.closing_time,
          slot_duration_minutes: slot.slot_duration_minutes,
        });
      }

      fetchSlots();
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save schedule", e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await DepartmentScheduleService.delete(deleteTarget.id);
      setSlots((prev) =>
        prev.filter((s) => s.id !== deleteTarget.id)
      );
    } catch (e) {
      console.error("Failed to delete schedule", e);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (date: string) =>
    date ? date.split("T")[0] : "-";

  const formatTime = (time?: string) => {
    if (!time) return "-";

    const [hourStr, minute] = time.split(":");
    const hour = Number(hourStr);

    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-xl font-semibold">
        Department Daily Schedules
      </h2>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        + Add Daily Slot
      </button>

      <div className="mt-4 border rounded-lg overflow-hidden">
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
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500"
                >
                  Loading schedules...
                </td>
              </tr>
            )}

            {!loading &&
              slots.map((slot) => (
                <tr key={slot.id} className="border-b">
                  <td className="p-3">
                    {formatDate(slot.date)}
                  </td>
                  <td className="p-3">
                    {formatTime(slot.opening_time)}
                  </td>
                  <td className="p-3">
                    {formatTime(slot.closing_time)}
                  </td>
                  <td className="p-3">
                    {slot.total_slots}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setShowModal(slot)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>

                    <button
                      onClick={() => setDeleteTarget(slot)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && slots.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500"
                >
                  No schedules added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddSlotModal
          initialData={
            typeof showModal === "object" ? showModal : null
          }
          onClose={() => setShowModal(false)}
          onSave={handleSaveSlot}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
