"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Registration,
  subscribeToRegistrations,
  getRegistrations,
  addRegistration,
  updateRegistration,
  deleteRegistration,
} from "@/lib/firestore";
import RegistrationModal from "@/components/RegistrationModal";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

// Phone numbers prefixed with tab so Excel/Sheets never strips the leading zero
function csvPhone(phone: string): string {
  return `"\t${phone.replace(/"/g, '""')}"`;
}

function exportCSV(registrations: Registration[]) {
  const headers = ["Nume Părinte", "Telefon", "Nr. Copii", "Copii", "Data Înscrierii"];
  const rows = registrations.map((r) => [
    csvCell(r.parentName),
    csvPhone(r.parentPhone),
    csvCell(r.children.length),
    csvCell(r.children.map((c) => `${c.name} (${c.ageCategory})`).join("; ")),
    csvCell(formatDate(r.createdAt instanceof Date ? r.createdAt : null)),
  ]);

  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inscrieri-1-iunie-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRegistrations((data) => {
      setRegistrations(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleSave = async (data: Omit<Registration, "id" | "createdAt">) => {
    if (editTarget?.id) {
      await updateRegistration(editTarget.id, data);
    } else {
      await addRegistration(data);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteRegistration(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/geneza-logo.png"
              alt="Biserica Geneza Oradea"
              width={120}
              height={43}
              className="brightness-0"
            />
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Panou Administrare</p>
              <p className="text-slate-400 text-xs">Activitate 1 Iunie</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Reîncarcă datele"
              className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">
                {refreshing ? "Se încarcă..." : "Reîncarcă"}
              </span>
            </button>

            {/* Export CSV */}
            <button
              onClick={() => exportCSV(registrations)}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {/* Add */}
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Adaugă</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Deconectare"
              className="px-3 py-2 sm:px-4 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Deconectare</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-slate-500 text-xs mb-0.5">Total înscrieri</p>
            <p className="font-bold text-blue-700 text-2xl">{registrations.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-slate-500 text-xs mb-0.5">Total copii</p>
            <p className="font-bold text-blue-700 text-2xl">
              {registrations.reduce((acc, r) => acc + r.children.length, 0)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Se încarcă...</div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 text-center text-slate-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Nu există înregistrări încă.</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet: card list (hidden on lg+) */}
            <div className="lg:hidden space-y-3">
              {registrations.map((reg, idx) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800">{reg.parentName}</span>
                      </div>
                      <a
                        href={`tel:${reg.parentPhone}`}
                        className="text-blue-600 text-sm mt-0.5 block"
                      >
                        {reg.parentPhone}
                      </a>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditTarget(reg);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        Editează
                      </button>
                      <button
                        onClick={() => setDeleteTarget(reg)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {reg.children.map((child, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs rounded-full px-2.5 py-1"
                      >
                        {child.name}
                        <span className="text-blue-400 text-[10px]">({child.ageCategory})</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {reg.children.length} {reg.children.length === 1 ? "copil" : "copii"}
                    </span>
                    <span>{formatDate(reg.createdAt instanceof Date ? reg.createdAt : null)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table (hidden below lg) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Nume Părinte</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Telefon</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Copii</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Data Înscrierii</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, idx) => (
                      <tr
                        key={reg.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{reg.parentName}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{reg.parentPhone}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {reg.children.map((child, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-0.5"
                              >
                                {child.name}
                                <span className="text-blue-400">({child.ageCategory})</span>
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            {reg.children.length} {reg.children.length === 1 ? "copil" : "copii"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {formatDate(reg.createdAt instanceof Date ? reg.createdAt : null)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditTarget(reg);
                                setModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              Editează
                            </button>
                            <button
                              onClick={() => setDeleteTarget(reg)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              Șterge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && (
        <RegistrationModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmare ștergere</h3>
            <p className="text-slate-600 text-sm mb-6">
              Ești sigur că vrei să ștergi înregistrarea lui{" "}
              <strong>{deleteTarget.parentName}</strong>? Această acțiune nu poate fi anulată.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Se șterge..." : "Șterge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
