import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSessionUserId } from "@/lib/session";

/** The logged-in user, read from the database so role changes apply immediately. */
export const getCurrentUser = cache(async () => {
  const userId = await readSessionUserId();
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      city: true,
      address: true,
      role: true,
    },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}
