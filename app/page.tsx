"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import ChildrenFields, { FormValues } from "@/components/ChildrenFields";

export default function HomePage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      parentName: "",
      parentPhone: "",
      children: [{ name: "", ageCategory: "" }],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "A apărut o eroare. Încearcă din nou.");
        return;
      }

      setSuccess(true);
      reset();
    } catch {
      setServerError("A apărut o eroare de rețea. Încearcă din nou.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Church header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-5">
            <Image
              src="/geneza-logo.png"
              alt="Biserica Geneza Oradea"
              width={180}
              height={64}
              className="brightness-0 invert"
            />
          </div>
          <div className="w-16 h-px bg-blue-400/40 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Activitate de 1 Iunie
          </h1>
          <p className="text-blue-200 mt-2 text-sm font-light">
            Completați formularul de mai jos pentru a înregistra participarea copiilor dumneavoastră.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {success ? (
            <div className="px-8 py-14 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Înregistrare confirmată
              </h2>
              <p className="text-gray-500 text-sm mb-7">
                Datele au fost transmise cu succes. Vă așteptăm pe 1 Iunie!
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm font-medium transition-colors"
              >
                Înregistrează alt copil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nume și Prenume Părinte <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("parentName", { required: "Câmp obligatoriu" })}
                  placeholder="ex: Popescu Ion"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {errors.parentName && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.parentName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Număr de Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("parentPhone", { required: "Câmp obligatoriu" })}
                  placeholder="ex: 0712 345 678"
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {errors.parentPhone && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.parentPhone.message}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h2 className="text-sm font-medium text-gray-700 mb-3">Date copii</h2>
                <ChildrenFields control={control} register={register} errors={errors} />
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Se transmite..." : "Trimite înregistrarea"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-blue-300/60 mt-6">
          Biserica Geneza Oradea • Activitate 1 Iunie 2026
        </p>
      </div>
    </main>
  );
}
