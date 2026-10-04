"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import {
  type FormState,
  LoginSchema,
  SignupSchema,
  fieldErrors,
  formValues,
} from "@/lib/validation";

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { password, ...profile } = parsed.data;
  const existing = await db.user.findUnique({ where: { email: profile.email } });
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] }, values };
  }

  const user = await db.user.create({
    data: { ...profile, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);
  redirect("/products");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const check = user
    ? await verifyPassword(user, parsed.data.password)
    : { ok: false, needsUpgrade: false };
  if (!user || !check.ok) {
    return { message: "Incorrect email or password.", values };
  }

  // Accounts imported from the old site move from MD5 to bcrypt on first login.
  if (check.needsUpgrade) {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.password), legacyMd5: null },
    });
  }

  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/products");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
