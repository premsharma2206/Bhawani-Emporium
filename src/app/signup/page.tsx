import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/products");
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title">Create an account</h1>
      <SignupForm />
    </div>
  );
}
