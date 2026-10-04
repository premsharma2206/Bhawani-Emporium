import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/account-forms";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section>
        <h1 className="page-title">Your details</h1>
        <p className="mb-4 text-sm text-stone-600">Signed in as {user.email}</p>
        <ProfileForm
          defaults={{
            name: user.name,
            contact: user.contact,
            city: user.city,
            address: user.address,
          }}
        />
      </section>
      <section>
        <h2 className="page-title">Password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
