"use client";

import { useState, useEffect } from "react";
import {
  EmploymentDocumentService,
  EmploymentDocument,
} from "@/services/employment-document";
import {
  TravelDocumentService,
  TravelDocument,
} from "@/services/travel-document";
import {
  CrewCertificateService,
  CrewCertificate,
} from "@/services/crew-certificate";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import AdminEmpDocModal from "./AdminEmpDocModal";
import AdminTravelDocModal from "./AdminTravelDocModal";
import AdminCertModal from "./AdminCertModal";

interface CrewDocumentsProps {
  crewId: string | null | undefined;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(date: string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function isExpiringSoon(date: string | null | undefined, days = 60): boolean {
  if (!date) return false;
  const expiry = new Date(date);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return expiry >= new Date() && expiry <= threshold;
}

function ExpiryBadge({ date }: { date: string | null | undefined }) {
  if (!date) return <span className="text-gray-400 text-xs">No expiry</span>;
  if (isExpired(date))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
        <i className="bi bi-exclamation-circle-fill" /> Expired
      </span>
    );
  if (isExpiringSoon(date))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
        <i className="bi bi-clock-fill" /> Expiring soon
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <i className="bi bi-check-circle-fill" /> Valid
    </span>
  );
}

function ViewFileButton({
  documentId,
  filePath,
  type,
}: {
  documentId: number;
  filePath: string | null | undefined;
  type: "employment" | "travel" | "certificate";
}) {
  if (!filePath)
    return <span className="text-gray-400 text-xs italic">No file</span>;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  const base = backendUrl.replace(/\/api$/, "");

  const urlMap: Record<string, string> = {
    employment: `${base}/api/employment-documents/${documentId}/view-file`,
    travel: `${base}/api/travel-documents/${documentId}/view-file`,
    certificate: `${base}/api/crew-certificates/${documentId}/view-file`,
  };

  return (
    <a
      href={urlMap[type]}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
    >
      <i className="bi bi-file-earmark-text text-sm" /> View File
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <i className="bi bi-inbox text-3xl mb-2 block" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// Inline delete confirmation
interface DeleteConfirmProps {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
function InlineDeleteConfirm({
  label,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="text-red-600 font-medium">Delete {label}?</span>
      <button
        onClick={onConfirm}
        disabled={isDeleting}
        className="px-2 py-0.5 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50"
      >
        {isDeleting ? "..." : "Yes"}
      </button>
      <button
        onClick={onCancel}
        disabled={isDeleting}
        className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
      >
        No
      </button>
    </span>
  );
}

export default function CrewDocuments({ crewId }: CrewDocumentsProps) {
  const [employmentDocs, setEmploymentDocs] = useState<EmploymentDocument[]>([]);
  const [travelDocs, setTravelDocs] = useState<TravelDocument[]>([]);
  const [crewCerts, setCrewCerts] = useState<CrewCertificate[]>([]);

  const [empLoading, setEmpLoading] = useState(true);
  const [travelLoading, setTravelLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);

  // Delete state — track which row is pending delete
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);
  const [deletingTravelId, setDeletingTravelId] = useState<number | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal state — employment doc
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editEmpDoc, setEditEmpDoc] = useState<EmploymentDocument | null>(null);

  // Modal state — travel doc
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [editTravelDoc, setEditTravelDoc] = useState<TravelDocument | null>(null);

  // Modal state — certificate
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editCert, setEditCert] = useState<CrewCertificate | null>(null);

  // ── Employment Documents ───────────────────────────────────────────────────
  const fetchEmploymentDocs = async () => {
    if (!crewId) {
      setEmpLoading(false);
      return;
    }
    try {
      setEmpLoading(true);
      const data = await EmploymentDocumentService.getEmploymentDocumentsByCrewId(crewId);
      setEmploymentDocs(data || []);
    } catch (error: any) {
      console.error("Error fetching employment documents:", error);
      toast.error(error?.response?.data?.message || "Failed to load employment documents");
    } finally {
      setEmpLoading(false);
    }
  };

  // ── Travel Documents ──────────────────────────────────────────────────────
  const fetchTravelDocs = async () => {
    if (!crewId) {
      setTravelLoading(false);
      return;
    }
    try {
      setTravelLoading(true);
      const data = await TravelDocumentService.getTravelDocumentsByCrewId(crewId);
      setTravelDocs(data || []);
    } catch (error: any) {
      console.error("Error fetching travel documents:", error);
      toast.error(error?.response?.data?.message || "Failed to load travel documents");
    } finally {
      setTravelLoading(false);
    }
  };

  // ── Crew Certificates ──────────────────────────────────────────────────────
  const fetchCrewCerts = async () => {
    if (!crewId) {
      setCertLoading(false);
      return;
    }
    try {
      setCertLoading(true);
      const data = await CrewCertificateService.getCrewCertificatesByCrewId(crewId);
      setCrewCerts(data || []);
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      toast.error(error?.response?.data?.message || "Failed to load certificates");
    } finally {
      setCertLoading(false);
    }
  };

  useEffect(() => {
    fetchEmploymentDocs();
    fetchTravelDocs();
    fetchCrewCerts();
  }, [crewId]);

  // ── Delete handlers ────────────────────────────────────────────────────────
  const handleDeleteEmp = async (id: number) => {
    setIsDeleting(true);
    try {
      await EmploymentDocumentService.deleteEmploymentDocument(id);
      toast.success("Employment document deleted.");
      setDeletingEmpId(null);
      fetchEmploymentDocs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTravel = async (id: number) => {
    setIsDeleting(true);
    try {
      await TravelDocumentService.deleteTravelDocument(id);
      toast.success("Travel document deleted.");
      setDeletingTravelId(null);
      fetchTravelDocs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCert = async (id: number) => {
    setIsDeleting(true);
    try {
      await CrewCertificateService.deleteCrewCertificate(id);
      toast.success("Certificate deleted.");
      setDeletingCertId(null);
      fetchCrewCerts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete certificate");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!crewId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <i className="bi bi-person-x text-5xl mb-4 block" />
        <p className="text-base font-medium text-gray-600">No Crew ID found</p>
        <p className="text-sm mt-1">
          This crew member does not have a Crew ID assigned. Documents cannot be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Employment Documents ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-200">
          <i className="bi bi-file-earmark-text text-xl text-blue-600" />
          <span className="font-semibold text-gray-800">Employment Documents</span>
          {empLoading ? (
            <span className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {employmentDocs.length}
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {
                setEditEmpDoc(null);
                setEmpModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
        <div className="p-6">
          {empLoading ? (
            <LoadingSkeleton />
          ) : employmentDocs.length === 0 ? (
            <EmptyState label="No employment documents found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Document Number</th>
                    <th className="pb-3 pr-4">File</th>
                    <th className="pb-3 pr-4">Date Added</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employmentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">
                        {doc.employment_document_type?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {doc.document_number}
                      </td>
                      <td className="py-3 pr-4">
                        <ViewFileButton documentId={doc.id} filePath={doc.file_path} type="employment" />
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3">
                        {deletingEmpId === doc.id ? (
                          <InlineDeleteConfirm
                            label={doc.employment_document_type?.name || "document"}
                            onConfirm={() => handleDeleteEmp(doc.id)}
                            onCancel={() => setDeletingEmpId(null)}
                            isDeleting={isDeleting}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditEmpDoc(doc);
                                setEmpModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingEmpId(doc.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ── Travel Documents ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-purple-50 border-b border-purple-200">
          <i className="bi bi-passport text-xl text-purple-600" />
          <span className="font-semibold text-gray-800">Travel Documents</span>
          {travelLoading ? (
            <span className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {travelDocs.length}
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {
                setEditTravelDoc(null);
                setTravelModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
        <div className="p-6">
          {travelLoading ? (
            <LoadingSkeleton />
          ) : travelDocs.length === 0 ? (
            <EmptyState label="No travel documents found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">ID / Number</th>
                    <th className="pb-3 pr-4">Place of Issue</th>
                    <th className="pb-3 pr-4">Issued</th>
                    <th className="pb-3 pr-4">Expiry</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">File</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {travelDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">
                        {doc.is_US_VISA ? (
                          <span>
                            US VISA
                            {doc.visa_type && (
                              <span className="ml-1 text-xs text-indigo-600">({doc.visa_type})</span>
                            )}
                          </span>
                        ) : (
                          doc.travel_document_type?.name ?? "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{doc.id_no}</td>
                      <td className="py-3 pr-4 text-gray-600">{doc.place_of_issue}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(doc.date_of_issue)}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(doc.expiration_date)}</td>
                      <td className="py-3 pr-4">
                        <ExpiryBadge date={doc.expiration_date} />
                      </td>
                      <td className="py-3 pr-4">
                        <ViewFileButton documentId={doc.id} filePath={doc.file_path} type="travel" />
                      </td>
                      <td className="py-3">
                        {deletingTravelId === doc.id ? (
                          <InlineDeleteConfirm
                            label={doc.is_US_VISA ? "US VISA" : doc.travel_document_type?.name || "document"}
                            onConfirm={() => handleDeleteTravel(doc.id)}
                            onCancel={() => setDeletingTravelId(null)}
                            isDeleting={isDeleting}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditTravelDoc(doc);
                                setTravelModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTravelId(doc.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ── Crew Certificates ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 border-b border-emerald-200">
          <i className="bi bi-award text-xl text-emerald-600" />
          <span className="font-semibold text-gray-800">Certificates</span>
          {certLoading ? (
            <span className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
          ) : (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {crewCerts.length}
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {
                setEditCert(null);
                setCertModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
        <div className="p-6">
          {certLoading ? (
            <LoadingSkeleton />
          ) : crewCerts.length === 0 ? (
            <EmptyState label="No certificates found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="pb-3 pr-4">Certificate</th>
                    <th className="pb-3 pr-4">Number</th>
                    <th className="pb-3 pr-4">Issued By</th>
                    <th className="pb-3 pr-4">Date Issued</th>
                    <th className="pb-3 pr-4">Expiry</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">File</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {crewCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-800">
                        {cert.certificate?.name ?? cert.certificate?.code ?? `Certificate #${cert.certificate_id}`}
                        {cert.certificate?.certificate_type?.name && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({cert.certificate.certificate_type.name})
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {cert.certificate_no && !cert.certificate_no.startsWith("PENDING_") ? (
                          cert.certificate_no
                        ) : (
                          <span className="text-amber-600 italic text-xs">Pending approval</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{cert.issued_by ?? "—"}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(cert.date_issued)}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(cert.expiry_date)}</td>
                      <td className="py-3 pr-4">
                        <ExpiryBadge date={cert.expiry_date} />
                      </td>
                      <td className="py-3 pr-4">
                        <ViewFileButton documentId={cert.id} filePath={cert.file_path} type="certificate" />
                      </td>
                      <td className="py-3">
                        {deletingCertId === cert.id ? (
                          <InlineDeleteConfirm
                            label={cert.certificate?.name || "certificate"}
                            onConfirm={() => handleDeleteCert(cert.id)}
                            onCancel={() => setDeletingCertId(null)}
                            isDeleting={isDeleting}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditCert(cert);
                                setCertModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingCertId(cert.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {crewId && (
        <>
          <AdminEmpDocModal
            isOpen={empModalOpen}
            onClose={() => {
              setEmpModalOpen(false);
              setEditEmpDoc(null);
            }}
            onSuccess={() => {
              setEmpModalOpen(false);
              setEditEmpDoc(null);
              fetchEmploymentDocs();
            }}
            crewId={crewId}
            editDoc={editEmpDoc}
          />

          <AdminTravelDocModal
            isOpen={travelModalOpen}
            onClose={() => {
              setTravelModalOpen(false);
              setEditTravelDoc(null);
            }}
            onSuccess={() => {
              setTravelModalOpen(false);
              setEditTravelDoc(null);
              fetchTravelDocs();
            }}
            crewId={crewId}
            editDoc={editTravelDoc}
          />

          <AdminCertModal
            isOpen={certModalOpen}
            onClose={() => {
              setCertModalOpen(false);
              setEditCert(null);
            }}
            onSuccess={() => {
              setCertModalOpen(false);
              setEditCert(null);
              fetchCrewCerts();
            }}
            crewId={crewId}
            editCert={editCert}
          />
        </>
      )}
    </div>
  );
}
