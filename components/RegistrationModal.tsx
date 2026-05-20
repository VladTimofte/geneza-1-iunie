"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Registration } from "@/lib/firestore";
import ChildrenFields, { FormValues } from "./ChildrenFields";

interface Props {
  initial?: Registration | null;
  onSave: (data: Omit<Registration, "id" | "createdAt">) => Promise<void>;
  onClose: () => void;
}

export default function RegistrationModal({ initial, onSave, onClose }: Props) {
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

  useEffect(() => {
    if (initial) {
      reset({
        parentName: initial.parentName,
        parentPhone: initial.parentPhone,
        children: initial.children.length
          ? initial.children
          : [{ name: "", ageCategory: "" }],
      });
    } else {
      reset({
        parentName: "",
        parentPhone: "",
        children: [{ name: "", ageCategory: "" }],
      });
    }
  }, [initial, reset]);

  const onSubmit = async (data: FormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? "Editează înregistrare" : "Adaugă înregistrare"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
            aria-label="Închide"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nume & Prenume Părinte <span className="text-red-500">*</span>
            </label>
            <input
              {...register("parentName", { required: "Câmp obligatoriu" })}
              placeholder="ex: Popescu Ion"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            {errors.parentName && (
              <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Număr Telefon <span className="text-red-500">*</span>
            </label>
            <input
              {...register("parentPhone", { required: "Câmp obligatoriu" })}
              placeholder="ex: 0712 345 678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            {errors.parentPhone && (
              <p className="text-red-500 text-xs mt-1">{errors.parentPhone.message}</p>
            )}
          </div>

          <ChildrenFields control={control} register={register} errors={errors} />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
