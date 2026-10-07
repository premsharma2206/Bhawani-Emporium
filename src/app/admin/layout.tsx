import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Every admin page and action also checks this itself; the layout check is a convenience.
  await requireAdmin();
  return (
    <div>
      <nav className="card mb-3 inline-flex gap-1 p-1 text-sm font-medium">
        <Link href="/admin" className="rounded-xl px-4 py-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-accent">
          Products
        </Link>
        <Link href="/admin/orders" className="rounded-xl px-4 py-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-accent">
          Orders
        </Link>
        <Link href="/admin/users" className="rounded-xl px-4 py-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-accent">
          Users
        </Link>
      </nav>
      {children}
    </div>
  );
}
