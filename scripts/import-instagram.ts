/**
 * Adds the products collected from the shop's Instagram posts: npm run import:instagram
 *
 * Instagram captions carry no prices, so each product goes on sale at DEFAULT_PRICE_PAISE until
 * its real price is set in Admin → Products. Running this again skips products that are already
 * there, apart from giving the default price to any that still have none.
 */
import "dotenv/config";
import { db } from "@/lib/db";
import products from "./instagram-products.json";

/** ₹10,000. */
const DEFAULT_PRICE_PAISE = 10_000_00;

async function main() {
  let added = 0;
  let priced = 0;
  for (const { name, description, productType, tags, imageUrl } of products) {
    const existing = await db.product.findFirst({ where: { imageUrl } });
    if (!existing) {
      await db.product.create({
        data: { name, description, productType, tags, imageUrl, pricePaise: DEFAULT_PRICE_PAISE },
      });
      added += 1;
    } else if (existing.pricePaise === 0) {
      await db.product.update({
        where: { id: existing.id },
        data: { pricePaise: DEFAULT_PRICE_PAISE, active: true },
      });
      priced += 1;
    }
  }
  console.log(
    `Added ${added} products; priced and restored ${priced}; left ${products.length - added - priced} unchanged.`,
  );
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
