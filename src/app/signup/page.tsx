import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/products");
  return (
    <AuthShell title="Create an account" subtitle="It takes a minute, and your details are saved for checkout.">
      <SignupForm />
    </AuthShell>
  );
}
