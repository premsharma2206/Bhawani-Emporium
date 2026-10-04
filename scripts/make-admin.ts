/** Grants the admin role to an existing account: npm run make-admin -- someone@example.com */
import "dotenv/config";
import { db } from "@/lib/db";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run make-admin -- <email>");
  const { count } = await db.user.updateMany({ where: { email }, data: { role: "ADMIN" } });
  console.log(count ? `${email} is now an admin.` : `No account found for ${email}.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
