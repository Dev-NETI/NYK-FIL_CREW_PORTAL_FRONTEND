"use client";

import { User } from "@/types/api";
import { Program } from "@/services/program";
import { EmploymentRecord } from "@/services/employment";

interface EmploymentInformationProps {
  profile: User;
  isEditing: boolean;
  saving: boolean;
  programs: Program[];
  employmentRecords: EmploymentRecord[];
  editingEmploymentId: number | null;
  showProgramSelection: boolean;
  selectedProgramId: number | null;
  batchInput: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAddEmploymentRecord: () => void;
  onProgramSelect: (programId: number) => void;
  onBatchSave: () => void;
  onCancelBatchInput: () => void;
  onUpdateEmploymentRecord: (
    id: number,
    field: string,
    value: string | number
  ) => void;
  onDeleteEmploymentRecord: (employmentId: number) => void;
  onSaveEmploymentRecord: (employmentId: number) => void;
  onCancelEmploymentEdit: () => void;
  onSetEditingEmploymentId: (id: number | null) => void;
  onSetShowProgramSelection: (show: boolean) => void;
  onSetBatchInput: (value: string) => void;
}

export default function EmploymentInformation({
  isEditing,
  saving,
  programs,
  employmentRecords,
  editingEmploymentId,
  showProgramSelection,
  selectedProgramId,
  batchInput,
  onEdit,
  onSave,
  onCancel,
  onAddEmploymentRecord,
  onProgramSelect,
  onBatchSave,
  onCancelBatchInput,
  onUpdateEmploymentRecord,
  onDeleteEmploymentRecord,
  onSaveEmploymentRecord,
  onCancelEmploymentEdit,
  onSetEditingEmploymentId,
  onSetShowProgramSelection,
  onSetBatchInput,
}: EmploymentInformationProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="bi bi-briefcase text-blue-600 mr-3"></i>
            Employment Information
          </h2>
          <p className="text-gray-600 mt-1">
            Work history and employment records
          </p>
        </div>

        {/* Edit Controls */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <i className="bi bi-pencil text-sm"></i>
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 text-sm font-medium shadow-lg flex items-center space-x-2"
              >
                <i className="bi bi-x text-sm"></i>
                <span>Cancel</span>
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-clockwise animate-spin text-sm"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check text-sm"></i>
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Employment History
          </h3>
          <button
            onClick={onAddEmploymentRecord}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
          >
            <i className="bi bi-plus mr-2"></i>
            Add Employment
          </button>
        </div>

        {/* Program Selection Modal */}
        {showProgramSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Select Program
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => onProgramSelect(program.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="font-medium text-gray-900">
                      {program.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => onSetShowProgramSelection(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Input Interface */}
        {selectedProgramId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Add Employment Record
              </h4>
              <button
                onClick={onCancelBatchInput}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Program
                </label>
                <p className="text-gray-900 py-2 px-3 bg-white rounded-lg border border-gray-200">
                  {programs.find((p) => p.id === selectedProgramId)?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchInput}
                  onChange={(e) => onSetBatchInput(e.target.value)}
                  placeholder="e.g., BATCH 2025, Q1 2025, etc."
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onCancelBatchInput}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onBatchSave}
                  disabled={!batchInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Employment Record
                </button>
              </div>
            </div>
          </div>
        )}

        {employmentRecords.length === 0 ? (
          <div className="text-center py-8">
            <i className="bi bi-briefcase text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500 mb-4">No employment records found</p>
            <button
              onClick={onAddEmploymentRecord}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add First Employment Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employmentRecords.map((employment) => (
                  <tr
                    key={employment.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmploymentId === employment.id ? (
                        <select
                          value={employment.program_id}
                          onChange={(e) =>
                            onUpdateEmploymentRecord(
                              employment.id,
                              "program_id",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select program</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-3 w-3 bg-blue-600 rounded-full mr-3"></div>
                          <div className="text-sm font-medium text-gray-900">
                            {employment.program?.name || "Not assigned"}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmploymentId === employment.id ? (
                        <input
                          type="text"
                          value={employment.batch}
                          onChange={(e) =>
                            onUpdateEmploymentRecord(
                              employment.id,
                              "batch",
                              e.target.value
                            )
                          }
                          placeholder="e.g., BATCH 2025"
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {employment.batch || "Not provided"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingEmploymentId === employment.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              onSaveEmploymentRecord(employment.id)
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            onClick={() => onCancelEmploymentEdit()}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              onSetEditingEmploymentId(employment.id)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() =>
                              onDeleteEmploymentRecord(employment.id)
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
