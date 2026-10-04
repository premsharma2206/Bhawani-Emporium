"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  type FormState,
  PasswordChangeSchema,
  ProfileSchema,
  fieldErrors,
  formValues,
} from "@/lib/validation";

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  return { message: "Details saved.", values };
}

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = PasswordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const stored = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  const check = await verifyPassword(stored, parsed.data.currentPassword);
  if (!check.ok) return { errors: { currentPassword: ["Current password is incorrect."] } };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), legacyMd5: null },
  });
  return { message: "Password changed." };
}
