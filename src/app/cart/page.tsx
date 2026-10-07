import type { Metadata } from "next";
import Link from "next/link";
import { removeFromCart, setCartQuantity } from "@/actions/cart";
import { SubmitButton } from "@/components/form";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { cartTotalPaise, formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await requireUser();
  const items = await db.cartItem.findMany({
    where: { userId: user.id, product: { active: true } },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });

  if (items.length === 0) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary mt-4">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Cart</h1>
      <ul className="card divide-y divide-line">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <Link href={`/products/${product.id}`} className="font-medium hover:text-accent">
                {product.name}
              </Link>
              <p className="text-sm text-muted">{formatPaise(product.pricePaise)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <form action={setCartQuantity} className="flex items-center gap-2">
                <input type="hidden" name="productId" value={product.id} />
                <label htmlFor={`qty-${product.id}`} className="sr-only">
                  Quantity of {product.name}
                </label>
                <input
                  id={`qty-${product.id}`}
                  name="quantity"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={quantity}
                  className="input w-20"
                />
                <SubmitButton className="btn btn-secondary">Update</SubmitButton>
              </form>
              <form action={removeFromCart}>
                <input type="hidden" name="productId" value={product.id} />
                <SubmitButton className="btn btn-danger">Remove</SubmitButton>
              </form>
              <span className="w-24 text-right font-medium">
                {formatPaise(product.pricePaise * quantity)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-end gap-6">
        <p className="text-lg">
          Total: <span className="font-semibold">{formatPaise(cartTotalPaise(items))}</span>
        </p>
        <Link href="/checkout" className="btn btn-primary">
          Checkout
        </Link>
      </div>
    </div>
  );
}
