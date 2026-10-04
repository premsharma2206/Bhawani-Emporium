"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { MAX_IMAGE_BYTES, saveImage } from "@/lib/images";
import { rupeesToPaise } from "@/lib/money";
import { type FormState, ProductSchema, fieldErrors, formValues } from "@/lib/validation";

const id = z.coerce.number().int().positive();

export async function saveProduct(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { price, ...fields } = parsed.data;
  const pricePaise = rupeesToPaise(price);
  if (pricePaise === null || pricePaise === 0) {
    return { errors: { price: ["Enter a price in rupees, for example 499 or 499.50."] }, values };
  }

  let imageUrl: string | undefined;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { errors: { image: ["Image must be 5 MB or smaller."] }, values };
    }
    try {
      imageUrl = await saveImage(Buffer.from(await file.arrayBuffer()));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed.";
      return { errors: { image: [message] }, values };
    }
  }

  const data = { ...fields, pricePaise, ...(imageUrl ? { imageUrl } : {}) };
  const existingId = id.safeParse(formData.get("id"));
  if (existingId.success) {
    await db.product.update({ where: { id: existingId.data }, data });
  } else {
    await db.product.create({ data });
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function setProductActive(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ id, active: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db.product.update({
    where: { id: parsed.data.id },
    data: { active: parsed.data.active === "true" },
  });
  revalidatePath("/", "layout");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ id, status: z.enum(["PLACED", "FULFILLED", "CANCELLED"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db.order.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  revalidatePath("/admin/orders");
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = z
    .object({ id, role: z.enum(["CUSTOMER", "ADMIN"]) })
    .safeParse(Object.fromEntries(formData));
  // Admins cannot change their own role, so there is always at least one admin.
  if (!parsed.success || parsed.data.id === admin.id) return;
  await db.user.update({ where: { id: parsed.data.id }, data: { role: parsed.data.role } });
  revalidatePath("/admin/users");
}
