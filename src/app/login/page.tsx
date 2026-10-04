import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/products");
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="page-title">Log in</h1>
      <LoginForm />
    </div>
  );
}
