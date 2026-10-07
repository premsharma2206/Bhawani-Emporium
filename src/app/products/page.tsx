import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Products" };

const SORTS = {
  newest: { label: "Newest first", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "Price: low to high", orderBy: { pricePaise: "asc" } },
  "price-desc": { label: "Price: high to low", orderBy: { pricePaise: "desc" } },
  name: { label: "Name: A to Z", orderBy: { name: "asc" } },
} as const;
type Sort = keyof typeof SORTS;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const type = params.type;
  const q = params.q?.trim().slice(0, 80) ?? "";
  const sort: Sort = params.sort && params.sort in SORTS ? (params.sort as Sort) : "newest";

  const contains = { contains: q, mode: "insensitive" } as const;
  const [products, types] = await Promise.all([
    db.product.findMany({
      where: {
        active: true,
        ...(type ? { productType: type } : {}),
        ...(q
          ? {
              OR: [
                { name: contains },
                { description: contains },
                { productType: contains },
                { tags: contains },
              ],
            }
          : {}),
      },
      orderBy: SORTS[sort].orderBy,
    }),
    db.product.findMany({
      where: { active: true, productType: { not: "" } },
      distinct: ["productType"],
      select: { productType: true },
      orderBy: { productType: "asc" },
    }),
  ]);

  // Links keep the current search and sort when the type filter changes.
  const hrefFor = (nextType?: string) => {
    const query = new URLSearchParams();
    if (nextType) query.set("type", nextType);
    if (q) query.set("q", q);
    if (sort !== "newest") query.set("sort", sort);
    const text = query.toString();
    return text ? `/products?${text}` : "/products";
  };
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? "border-accent bg-accent font-medium text-bg shadow-[0_0_24px_-6px_var(--color-accent)]"
        : "border-line-strong bg-glass text-ink-soft hover:border-accent/60 hover:bg-glass-strong"
    }`;
  const filtered = !!(q || type);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
          <p className="mt-0.5 text-sm text-muted">
            Showing <span className="text-accent">{products.length}</span>{" "}
            {products.length === 1 ? "piece" : "pieces"}
            {q && <> for “{q}”</>}
            {type && <> in {type}</>}
          </p>
        </div>
        <form action="/products" className="flex flex-wrap items-center gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          <label htmlFor="q" className="sr-only">
            Search products
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search brass, idols, gifts…"
            className="input w-56"
          />
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select id="sort" name="sort" defaultValue={sort} className="input w-auto">
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary">
            Apply
          </button>
        </form>
      </div>

      {types.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href={hrefFor()} className={chip(!type)}>
            All
          </Link>
          {types.map((t) => (
            <Link
              key={t.productType}
              href={hrefFor(t.productType)}
              className={chip(type === t.productType)}
            >
              {t.productType}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-muted">
            {filtered ? "No products match that search yet." : "No products to show yet."}
          </p>
          {filtered && (
            <Link href="/products" className="btn btn-secondary mt-3">
              Show all products
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
