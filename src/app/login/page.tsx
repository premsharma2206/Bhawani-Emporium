import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/products");
  return (
    <AuthShell title="Log in" subtitle="Welcome back. Sign in to see your cart and orders.">
      <LoginForm />
    </AuthShell>
  );
}
