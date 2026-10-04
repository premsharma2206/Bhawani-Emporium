"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "@/actions/account";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; contact: string; city: string; address: string };
}) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="name" defaultValue={defaults.name} state={state} required />
      <Field
        label="Mobile number"
        name="contact"
        type="tel"
        defaultValue={defaults.contact}
        state={state}
        required
      />
      <Field label="City" name="city" defaultValue={defaults.city} state={state} required />
      <Field label="Address" name="address" textarea defaultValue={defaults.address} state={state} />
      <FormMessage state={state} tone={state?.errors ? "error" : "success"} />
      <SubmitButton>Save details</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        state={state}
        required
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        state={state}
        required
      />
      <FormMessage state={state} tone={state?.errors ? "error" : "success"} />
      <SubmitButton>Change password</SubmitButton>
    </form>
  );
}
