"use client";

import { addToCart } from "@/actions/cart";
import { SubmitButton } from "@/components/form";
import { CART_OPEN_EVENT } from "@/components/cart-drawer";

/** Adds one of a product to the cart, then slides the cart drawer open. */
export function AddToCartButton({
  productId,
  children = "Add to cart",
  className,
}: {
  productId: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={async (formData) => {
        await addToCart(formData);
        window.dispatchEvent(new Event(CART_OPEN_EVENT));
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton className={className}>{children}</SubmitButton>
    </form>
  );
}
