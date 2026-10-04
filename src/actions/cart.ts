"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";

const MAX_QUANTITY = 20;
const productId = z.coerce.number().int().positive();

export async function addToCart(formData: FormData) {
  const user = await requireUser();
  const id = productId.safeParse(formData.get("productId"));
  if (!id.success) return;

  const product = await db.product.findFirst({ where: { id: id.data, active: true } });
  if (!product) return;

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId: product.id } },
  });
  if (!existing) {
    await db.cartItem.create({ data: { userId: user.id, productId: product.id } });
  } else if (existing.quantity < MAX_QUANTITY) {
    await db.cartItem.update({
      where: { userId_productId: { userId: user.id, productId: product.id } },
      data: { quantity: existing.quantity + 1 },
    });
  }
  revalidatePath("/", "layout");
}

export async function setCartQuantity(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({ productId, quantity: z.coerce.number().int().min(0).max(MAX_QUANTITY) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const where = { userId: user.id, productId: parsed.data.productId };
  if (parsed.data.quantity === 0) {
    await db.cartItem.deleteMany({ where });
  } else {
    await db.cartItem.updateMany({ where, data: { quantity: parsed.data.quantity } });
  }
  revalidatePath("/", "layout");
}

export async function removeFromCart(formData: FormData) {
  const user = await requireUser();
  const id = productId.safeParse(formData.get("productId"));
  if (!id.success) return;
  await db.cartItem.deleteMany({ where: { userId: user.id, productId: id.data } });
  revalidatePath("/", "layout");
}
