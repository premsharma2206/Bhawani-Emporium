import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { cartTotalPaise, formatPaise } from "@/lib/money";
import { razorpayEnabled } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser();
  const items = await db.cartItem.findMany({
    where: { userId: user.id, product: { active: true } },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });
  if (items.length === 0) redirect("/cart");

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="page-title">Checkout</h1>
        <CheckoutForm
          defaults={{
            shipName: user.name,
            shipContact: user.contact,
            shipCity: user.city,
            shipAddress: user.address,
          }}
          onlinePayment={razorpayEnabled()}
        />
      </div>
      <aside className="card h-fit p-4">
        <h2 className="mb-3 font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-4">
              <span>
                {quantity} × {product.name}
              </span>
              <span>{formatPaise(product.pricePaise * quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-stone-200 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPaise(cartTotalPaise(items))}</span>
        </p>
      </aside>
    </div>
  );
}
