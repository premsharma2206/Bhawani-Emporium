"use client";

import { useActionState } from "react";
import { createAdmin } from "@/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function NewAdminForm() {
  const [state, action] = useActionState(createAdmin, undefined);
  return (
    <form action={action} className="card grid max-w-3xl gap-3 p-3 sm:grid-cols-3">
      <Field label="Name" name="name" state={state} required />
      <Field label="Email" name="email" type="email" state={state} required />
      <Field
        label="Starting password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters. They can change it under Account."
        state={state}
        required
      />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <SubmitButton>Add admin</SubmitButton>
        <FormMessage state={state} tone={state?.errors ? "error" : "success"} />
      </div>
    </form>
  );
}
