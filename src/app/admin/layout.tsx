import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Every admin page and action also checks this itself; the layout check is a convenience.
  await requireAdmin();
  return (
    <div>
      <nav className="mb-6 flex gap-5 border-b border-stone-200 pb-3 text-sm font-medium">
        <Link href="/admin" className="hover:text-amber-800">
          Products
        </Link>
        <Link href="/admin/orders" className="hover:text-amber-800">
          Orders
        </Link>
        <Link href="/admin/users" className="hover:text-amber-800">
          Users
        </Link>
      </nav>
      {children}
    </div>
  );
}
