"use client";

import { useEffect, useState } from "react";
import { AppointmentService, AppointmentType } from "@/services/appointment";
import CreateAppointmentTypeModal from "./modals/CreateAppointmentTypeModal";

export default function AppointmentTypeList() {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await AppointmentService.getAppointmentTypes();
      setTypes(res.data);
    } catch (error) {
      console.error("Failed to fetch appointment types", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const toggleType = async (id: number) => {
  setTypes((prev) =>
    prev.map((type) =>
      type.id === id
        ? { ...type, is_active: !type.is_active }
        : type
    )
  );

  try {
    await AppointmentService.toggleAppointmentType(id);
  } catch (error) {
    setTypes((prev) =>
      prev.map((type) =>
        type.id === id
          ? { ...type, is_active: !type.is_active }
          : type
      )
    );

    console.error("Failed to toggle appointment type", error);
  }
};


  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Appointment Types</h2>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Type
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-b">
                <td className="p-3">{type.name}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      type.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {type.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleType(type.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                      ${type.is_active ? "bg-green-500" : "bg-gray-300"}
                    `}
                    aria-label="Toggle appointment type"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                        ${type.is_active ? "translate-x-6" : "translate-x-1"}
                      `}
                    />
                  </button>

                </td>
              </tr>
            ))}

            {types.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No appointment types found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateAppointmentTypeModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchTypes}
        />
      )}
    </div>
  );
}
