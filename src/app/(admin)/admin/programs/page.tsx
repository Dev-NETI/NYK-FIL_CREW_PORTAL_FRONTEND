"use client";

import { useState, useEffect } from "react";
import { ProgramService } from "@/services";
import { Program } from "@/services/program";
import toast from "react-hot-toast";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProgramName, setNewProgramName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await ProgramService.getPrograms();
      if (response.success && response.data) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async () => {
    if (!newProgramName.trim()) {
      toast.error("Program name is required");
      return;
    }

    try {
      const response = await ProgramService.createProgram({
        name: newProgramName.trim(),
      });
      if (response.success && response.data) {
        setPrograms([...programs, response.data]);
        setNewProgramName("");
        setIsAdding(false);
        toast.success("Program added successfully");
      }
    } catch (error) {
      console.error("Error adding program:", error);
      toast.error("Failed to add program");
    }
  };

  const handleEditProgram = async (id: number) => {
    if (!editingName.trim()) {
      toast.error("Program name is required");
      return;
    }

    try {
      const response = await ProgramService.updateProgram(id, {
        name: editingName.trim(),
      });
      if (response.success && response.data) {
        setPrograms(
          programs.map((p) => (p.id === id ? response.data : p))
        );
        setEditingId(null);
        setEditingName("");
        toast.success("Program updated successfully");
      }
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if (!confirm("Are you sure you want to delete this program?")) {
      return;
    }

    try {
      const response = await ProgramService.deleteProgram(id);
      if (response.success) {
        setPrograms(programs.filter((p) => p.id !== id));
        toast.success("Program deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const startEditing = (program: Program) => {
    setEditingId(program.id);
    setEditingName(program.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                <p className="text-gray-600 mt-1">Manage training programs</p>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <i className="bi bi-plus mr-2"></i>
                Add Program
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Add new program form */}
            {isAdding && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Add New Program
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newProgramName}
                    onChange={(e) => setNewProgramName(e.target.value)}
                    placeholder="Enter program name"
                    className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleAddProgram()}
                  />
                  <button
                    onClick={handleAddProgram}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewProgramName("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Programs list */}
            <div className="space-y-3">
              {programs.length === 0 ? (
                <div className="text-center py-12">
                  <i className="bi bi-list-task text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No programs found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by adding your first program.
                  </p>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Program
                  </button>
                </div>
              ) : (
                programs.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {editingId === program.id ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleEditProgram(program.id)
                          }
                        />
                        <button
                          onClick={() => handleEditProgram(program.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <i className="bi bi-bookmark-check text-blue-600 mr-3"></i>
                          <span className="font-medium text-gray-900">
                            {program.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditing(program)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}