"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { removeFromCart, setCartQuantity } from "@/actions/cart";
import { SubmitButton } from "@/components/form";
import { ProductImage } from "@/components/product-image";
import { formatPaise } from "@/lib/money";

export const CART_OPEN_EVENT = "cart:open";

export type CartLine = {
  productId: number;
  name: string;
  pricePaise: number;
  imageUrl: string | null;
  quantity: number;
};

const stepButton =
  "grid size-7 cursor-pointer place-items-center rounded-lg border border-line-strong bg-glass text-sm transition hover:border-accent/60 hover:bg-glass-strong disabled:opacity-50";

/** Header button that opens the cart drawer. */
export function CartButton({ count, className }: { count: number; className: string }) {
  return (
    <button
      type="button"
      className={`cursor-pointer ${className}`}
      onClick={() => window.dispatchEvent(new Event(CART_OPEN_EVENT))}
    >
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-bg">
          {count}
        </span>
      )}
    </button>
  );
}

/** Slide-out cart: change quantities, remove lines and go to checkout without leaving the page. */
export function CartDrawer({ lines }: { lines: CartLine[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(CART_OPEN_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(CART_OPEN_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const units = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.pricePaise, 0);
  const close = () => setOpen(false);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-lg font-semibold">
            Your cart
            {units > 0 && <span className="ml-2 text-sm font-normal text-muted">{units} items</span>}
          </h2>
          <button type="button" onClick={close} aria-label="Close cart" className={stepButton}>
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-muted">Your cart is empty.</p>
            <Link href="/products" onClick={close} className="btn btn-primary">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3 p-3">
                  <Link
                    href={`/products/${line.productId}`}
                    onClick={close}
                    className="w-16 shrink-0"
                  >
                    <ProductImage src={line.imageUrl} alt={line.name} sizes="4rem" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted">{formatPaise(line.pricePaise)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <form action={setCartQuantity}>
                        <input type="hidden" name="productId" value={line.productId} />
                        <input type="hidden" name="quantity" value={line.quantity - 1} />
                        <SubmitButton className={stepButton}>
                          <span aria-hidden>−</span>
                          <span className="sr-only">One fewer {line.name}</span>
                        </SubmitButton>
                      </form>
                      <span className="w-5 text-center text-sm tabular-nums">{line.quantity}</span>
                      <form action={setCartQuantity}>
                        <input type="hidden" name="productId" value={line.productId} />
                        <input type="hidden" name="quantity" value={Math.min(line.quantity + 1, 20)} />
                        <SubmitButton className={stepButton}>
                          <span aria-hidden>+</span>
                          <span className="sr-only">One more {line.name}</span>
                        </SubmitButton>
                      </form>
                      <form action={removeFromCart} className="ml-auto">
                        <input type="hidden" name="productId" value={line.productId} />
                        <SubmitButton className="cursor-pointer text-xs text-muted underline transition hover:text-danger disabled:opacity-50">
                          Remove
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPaise(line.pricePaise * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <div className="flex items-end justify-between">
                <p className="text-sm text-muted">Subtotal</p>
                <p className="font-display text-2xl font-semibold text-accent">
                  {formatPaise(subtotal)}
                </p>
              </div>
              <Link href="/checkout" onClick={close} className="btn btn-primary mt-3 w-full py-2.5">
                Checkout <span aria-hidden>→</span>
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="mt-2 block text-center text-xs text-muted underline transition hover:text-accent"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
