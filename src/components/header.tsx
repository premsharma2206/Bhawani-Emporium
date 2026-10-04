import Link from "next/link";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";

export async function Header() {
  const user = await getCurrentUser();
  const cart = user
    ? await db.cartItem.aggregate({ where: { userId: user.id }, _sum: { quantity: true } })
    : null;
  const cartCount = cart?._sum.quantity ?? 0;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-amber-800">
          Bhawani Emporium
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/products" className="hover:text-amber-800">
            Products
          </Link>
          {user ? (
            <>
              <Link href="/cart" className="hover:text-amber-800">
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
              <Link href="/orders" className="hover:text-amber-800">
                Orders
              </Link>
              <Link href="/account" className="hover:text-amber-800">
                Account
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="font-medium text-amber-800">
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="cursor-pointer hover:text-amber-800">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-amber-800">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
