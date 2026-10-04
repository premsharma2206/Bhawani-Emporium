"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";
import { cartTotalPaise } from "@/lib/money";
import { createRazorpayOrder, razorpayEnabled, verifyPaymentSignature } from "@/lib/razorpay";
import { CheckoutSchema, type FormState, fieldErrors, formValues } from "@/lib/validation";

export async function placeOrder(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = CheckoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  if (parsed.data.paymentMethod === "RAZORPAY" && !razorpayEnabled()) {
    return { message: "Online payment is not available right now.", values };
  }

  // Prices come from the database inside the transaction, never from the browser.
  const order = await db.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { userId: user.id, product: { active: true } },
      include: { product: true },
    });
    if (cart.length === 0) return null;

    const created = await tx.order.create({
      data: {
        userId: user.id,
        ...parsed.data,
        totalPaise: cartTotalPaise(cart),
        items: {
          create: cart.map((c) => ({
            productId: c.productId,
            name: c.product.name,
            pricePaise: c.product.pricePaise,
            quantity: c.quantity,
          })),
        },
      },
      include: { items: true },
    });
    await tx.cartItem.deleteMany({ where: { userId: user.id } });
    return created;
  });

  if (!order) return { message: "Your cart is empty.", values };

  await sendOrderEmails(order, user.email);
  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}?placed=1`);
}

export type PaymentStart =
  | { ok: true; keyId: string; razorpayOrderId: string; amountPaise: number }
  | { ok: false; message: string };

/** Creates the Razorpay order for an unpaid order, on first use, and returns what Checkout needs. */
export async function startPayment(orderId: number): Promise<PaymentStart> {
  const user = await requireUser();
  if (!razorpayEnabled()) return { ok: false, message: "Online payment is not available." };

  const order = await db.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order || order.paymentStatus === "PAID" || order.status === "CANCELLED") {
    return { ok: false, message: "This order cannot be paid." };
  }

  let razorpayOrderId = order.razorpayOrderId;
  if (!razorpayOrderId) {
    try {
      razorpayOrderId = await createRazorpayOrder(order.totalPaise, `order_${order.id}`);
    } catch (err) {
      console.error(err);
      return { ok: false, message: "Could not start the payment. Please try again." };
    }
    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId, paymentMethod: "RAZORPAY" },
    });
  }
  return {
    ok: true,
    keyId: process.env.RAZORPAY_KEY_ID!,
    razorpayOrderId,
    amountPaise: order.totalPaise,
  };
}

export async function confirmPayment(
  orderId: number,
  razorpayPaymentId: string,
  signature: string,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const order = await db.order.findFirst({ where: { id: orderId, userId: user.id } });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!order?.razorpayOrderId || !secret) return { ok: false };

  // The Razorpay order id comes from our database, so a signature for another order cannot be reused.
  if (!verifyPaymentSignature(order.razorpayOrderId, razorpayPaymentId, signature, secret)) {
    return { ok: false };
  }
  await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID", razorpayPaymentId },
  });
  revalidatePath(`/orders/${order.id}`);
  return { ok: true };
}
