"use client";

import type { InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/validation";

export function Field({
  label,
  name,
  state,
  textarea = false,
  defaultValue,
  hint,
  ...props
}: {
  label: string;
  name: string;
  state: FormState;
  textarea?: boolean;
  defaultValue?: string;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue">) {
  const errors = state?.errors?.[name];
  const value = state?.values?.[name] ?? defaultValue;
  const describedBy = errors ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          defaultValue={value}
          aria-describedby={describedBy}
          className="input"
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={value}
          aria-describedby={describedBy}
          className="input"
          {...props}
        />
      )}
      {hint && !errors && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-stone-500">
          {hint}
        </p>
      )}
      {errors && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state, tone = "error" }: { state: FormState; tone?: "error" | "success" }) {
  if (!state?.message) return null;
  return (
    <p role="status" className={`text-sm ${tone === "error" ? "text-red-700" : "text-green-700"}`}>
      {state.message}
    </p>
  );
}

export function SubmitButton({
  children,
  className = "btn btn-primary",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {children}
    </button>
  );
}
