"use client";

import { useState } from "react";
import { AppointmentService } from "@/services/appointment";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAppointmentTypeModal({
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      await AppointmentService.createAppointmentType({
        name,
        department_id: 0,
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create appointment type", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Create Appointment Type
        </h3>

        <input
          type="text"
          placeholder="Appointment type name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
