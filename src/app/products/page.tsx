import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [products, types] = await Promise.all([
    db.product.findMany({
      where: { active: true, ...(type ? { productType: type } : {}) },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { active: true, productType: { not: "" } },
      distinct: ["productType"],
      select: { productType: true },
      orderBy: { productType: "asc" },
    }),
  ]);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? "border-accent bg-accent font-medium text-bg shadow-[0_0_24px_-6px_var(--color-accent)]"
        : "border-line-strong bg-glass text-ink-soft hover:border-accent/60 hover:bg-glass-strong"
    }`;

  return (
    <div>
      <h1 className="page-title">Products</h1>
      {types.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/products" className={chip(!type)}>
            All
          </Link>
          {types.map((t) => (
            <Link
              key={t.productType}
              href={`/products?type=${encodeURIComponent(t.productType)}`}
              className={chip(type === t.productType)}
            >
              {t.productType}
            </Link>
          ))}
        </div>
      )}
      {products.length === 0 ? (
        <p className="text-muted">No products to show yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
