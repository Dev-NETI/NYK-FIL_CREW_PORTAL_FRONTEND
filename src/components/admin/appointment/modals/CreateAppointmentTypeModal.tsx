"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ValidationError from "@/components/ui/ValidationError";
import { AppointmentService } from "@/services/admin-appointment";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAppointmentTypeModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ name?: string[] }>({});

  const submit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setErrors({ name: ["Appointment type name is required."] });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await AppointmentService.createAppointmentType({
        name: trimmed,
        department_id: 0,
      });

      toast.success("Appointment type created");
      onCreated();
      onClose();
    } catch (error: any) {
      const status = error?.response?.status;

      // If backend returns validation errors (Laravel style)
      if (status === 422 && error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to create appointment type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Appointment Type</h3>

        <input
          type="text"
          placeholder="Appointment type name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            errors.name ? "border-red-500" : ""
          }`}
        />

        <ValidationError errors={errors.name ?? ""} />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
            disabled={loading}
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
