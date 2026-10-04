import "dotenv/config";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// Creates the first admin account and, on an empty catalogue, two sample products.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hashPassword(password);
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { name: "Shop admin", email, passwordHash, role: "ADMIN" },
    });
    console.log(`Admin account ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set; no admin account created.");
  }

  if ((await db.product.count()) === 0) {
    await db.product.createMany({
      data: [
        {
          name: "Brass Ganesha idol with stone inlay",
          description: "Sample product. Replace the name, price and description in the admin area.",
          pricePaise: 249900,
          imageUrl: "/products/brass-ganesha.jpg",
          productType: "Brassware",
        },
        {
          name: "Brass urli on stand",
          description: "Sample product. Replace the name, price and description in the admin area.",
          pricePaise: 189900,
          imageUrl: "/products/brass-urli-stand.jpg",
          productType: "Brassware",
        },
      ],
    });
    console.log("Added 2 sample products.");
  }
}

main().finally(() => db.$disconnect());
