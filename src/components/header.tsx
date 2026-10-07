import Link from "next/link";
import { logout } from "@/actions/auth";
import { CartButton, CartDrawer, type CartLine } from "@/components/cart-drawer";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";

const navLink =
  "rounded-full px-3 py-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-ink";

export async function Header() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  // Admins manage the shop rather than buy from it, so they get no cart link.
  const showCart = !!user && !isAdmin;
  const cartItems = showCart
    ? await db.cartItem.findMany({
        where: { userId: user.id, product: { active: true } },
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      })
    : [];
  const lines: CartLine[] = cartItems.map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    pricePaise: product.pricePaise,
    imageUrl: product.imageUrl,
    quantity,
  }));
  const cartCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2">
          <Link href="/" className="group flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-9 rotate-45 place-items-center rounded-lg bg-linear-to-br from-accent-strong to-[#e79a2b] shadow-[0_0_28px_-6px_var(--color-accent)] transition group-hover:shadow-[0_0_36px_-4px_var(--color-accent)]"
            >
              <span className="-rotate-45 font-display text-base font-bold text-[#1b1303]">B</span>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Bhawani <span className="text-gradient">Emporium</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
            <Link href="/products" className={navLink}>
              Products
            </Link>
            {user ? (
              <>
                {showCart && <CartButton count={cartCount} className={navLink} />}
                <Link href={isAdmin ? "/admin/orders" : "/orders"} className={navLink}>
                  Orders
                </Link>
                <Link href="/account" className={navLink}>
                  Account
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 font-medium text-accent transition hover:bg-accent/20"
                  >
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button type="submit" className={`cursor-pointer ${navLink}`}>
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={navLink}>
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-primary ml-2">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {showCart && <CartDrawer lines={lines} />}
    </>
  );
}
