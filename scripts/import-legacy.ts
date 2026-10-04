/**
 * One-off import from the old PHP site.
 *
 *   npm run import:legacy -- <export.json> [path-to-old-site]
 *
 * <export.json> is a phpMyAdmin "JSON" export of the whole database
 * (tables users, items, user_items). If the old site's folder is given,
 * product photos are copied from its img/ folder into image storage.
 * Safe to re-run only on an empty database.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { saveImage } from "@/lib/images";
import { rupeesToPaise } from "@/lib/money";

type Row = Record<string, string | null>;
type ExportEntry = { type: string; name?: string; data?: Row[] };

function table(entries: ExportEntry[], name: string): Row[] {
  return entries.find((e) => e.type === "table" && e.name === name)?.data ?? [];
}

async function main() {
  const [exportPath, legacyDir] = process.argv.slice(2);
  if (!exportPath) throw new Error("Usage: npm run import:legacy -- <export.json> [old-site-dir]");

  if ((await db.user.count()) + (await db.product.count()) > 0) {
    throw new Error("The database already has users or products. Import into an empty database.");
  }

  const entries = JSON.parse(await readFile(exportPath, "utf8")) as ExportEntry[];
  const users = table(entries, "users");
  const items = table(entries, "items");
  const userItems = table(entries, "user_items");
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const seenEmails = new Set<string>();
  for (const u of users) {
    const email = (u.email ?? "").trim().toLowerCase();
    if (!email || seenEmails.has(email)) {
      console.warn(`Skipped user ${u.id}: missing or duplicate email.`);
      continue;
    }
    seenEmails.add(email);
    await db.user.create({
      data: {
        id: Number(u.id),
        name: u.name ?? "",
        email,
        legacyMd5: u.password,
        contact: u.contact ?? "",
        city: u.city ?? "",
        address: u.address ?? "",
        role: email === adminEmail ? "ADMIN" : "CUSTOMER",
      },
    });
  }

  for (const item of items) {
    const pricePaise = rupeesToPaise(String(item.price ?? ""));
    if (pricePaise === null) {
      console.warn(`Skipped item ${item.id} (${item.name}): price "${item.price}" is not a number.`);
      continue;
    }
    let imageUrl: string | null = null;
    if (legacyDir && item.images) {
      try {
        // Only the file name is used, so a stored path cannot point outside img/.
        const file = path.join(legacyDir, "img", path.basename(item.images));
        imageUrl = await saveImage(await readFile(file));
      } catch (err) {
        console.warn(`No photo for item ${item.id} (${item.images}): ${(err as Error).message}`);
      }
    }
    await db.product.create({
      data: {
        id: Number(item.id),
        name: item.name ?? "",
        description: item.description ?? "",
        pricePaise,
        imageUrl,
        productType: item.product_type ?? "",
        tags: item.tags ?? "",
      },
    });
  }

  const userIds = new Set((await db.user.findMany({ select: { id: true } })).map((u) => u.id));
  const products = new Map((await db.product.findMany()).map((p) => [p.id, p]));
  const carts = new Map<string, { userId: number; productId: number; quantity: number }>();
  const confirmed = new Map<number, Map<number, number>>();

  for (const row of userItems) {
    const userId = Number(row.user_id);
    const productId = Number(row.item_id);
    if (!userIds.has(userId) || !products.has(productId)) continue;
    if (row.status === "Added to cart") {
      const key = `${userId}:${productId}`;
      const entry = carts.get(key) ?? { userId, productId, quantity: 0 };
      entry.quantity += 1;
      carts.set(key, entry);
    } else if (row.status === "Confirmed") {
      const perUser = confirmed.get(userId) ?? new Map<number, number>();
      perUser.set(productId, (perUser.get(productId) ?? 0) + 1);
      confirmed.set(userId, perUser);
    }
  }

  await db.cartItem.createMany({ data: [...carts.values()] });

  // The old site kept no order dates or grouping, so each customer's confirmed
  // items become a single historical order.
  for (const [userId, lines] of confirmed) {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const orderItems = [...lines].map(([productId, quantity]) => {
      const p = products.get(productId)!;
      return { productId, name: p.name, pricePaise: p.pricePaise, quantity };
    });
    await db.order.create({
      data: {
        userId,
        status: "FULFILLED",
        totalPaise: orderItems.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0),
        shipName: user.name,
        shipContact: user.contact,
        shipAddress: user.address,
        shipCity: user.city,
        note: "Imported from the old website. Original order dates and payment were not recorded.",
        items: { create: orderItems },
      },
    });
  }

  // Rows were inserted with their old ids, so move the id counters past them.
  for (const t of ["User", "Product"]) {
    await db.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), COALESCE((SELECT MAX(id) FROM "${t}"), 0) + 1, false)`,
    );
  }

  console.log(
    `Imported ${await db.user.count()} users, ${await db.product.count()} products, ` +
      `${carts.size} cart lines, ${confirmed.size} historical orders.`,
  );
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
