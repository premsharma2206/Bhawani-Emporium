import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/dal";
import { storeOpen } from "@/lib/store";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/products");
  if (!storeOpen()) {
    return (
      <AuthShell title="Sign-ups are closed" subtitle="Online ordering opens soon. Until then, you can browse the catalogue.">
        <Link href="/products" className="btn btn-primary">
          Browse products
        </Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Create an account" subtitle="It takes a minute, and your details are saved for checkout.">
      <SignupForm />
    </AuthShell>
  );
}
