"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-3">
      <Field label="Email" name="email" type="email" autoComplete="email" state={state} required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        state={state}
        required
      />
      <FormMessage state={state} />
      <SubmitButton>Log in</SubmitButton>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-accent underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  return (
    <form action={action} className="space-y-3">
      <Field label="Name" name="name" autoComplete="name" state={state} required />
      <Field label="Email" name="email" type="email" autoComplete="email" state={state} required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        state={state}
        required
      />
      <Field
        label="Mobile number"
        name="contact"
        type="tel"
        autoComplete="tel-national"
        hint="10 digits starting with 6, 7, 8 or 9, without +91."
        state={state}
        required
      />
      <Field label="City" name="city" autoComplete="address-level2" state={state} required />
      <Field label="Address" name="address" textarea state={state} />
      <FormMessage state={state} />
      <SubmitButton>Create account</SubmitButton>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
