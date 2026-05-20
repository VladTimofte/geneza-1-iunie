"use client";

import { useFieldArray, Control, UseFormRegister, FieldErrors } from "react-hook-form";

export interface FormValues {
  parentName: string;
  parentPhone: string;
  children: { name: string; ageCategory: string }[];
}

interface Props {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

const AGE_CATEGORIES = ["3-6 ani", "7-9 ani", "10-13 ani"];

export default function ChildrenFields({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "children" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/40 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800 text-sm">
              Copil {index + 1}
            </h3>
            {index > 0 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
              >
                Elimină
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume & Prenume
              </label>
              <input
                {...register(`children.${index}.name`, {
                  required: "Câmp obligatoriu",
                })}
                placeholder="Numele copilului"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              {errors.children?.[index]?.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.children[index]?.name?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie Vârstă
              </label>
              <div className="flex flex-wrap gap-3">
                {AGE_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={cat}
                      {...register(`children.${index}.ageCategory`, {
                        required: "Selectați categoria",
                      })}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.children?.[index]?.ageCategory && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.children[index]?.ageCategory?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", ageCategory: "" })}
        className="w-full border-2 border-dashed border-blue-300 rounded-xl py-3 text-blue-600 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium transition-all"
      >
        + Adaugă copil
      </button>
    </div>
  );
}
