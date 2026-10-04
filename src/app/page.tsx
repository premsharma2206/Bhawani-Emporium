import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";

export default async function HomePage() {
  const latest = await db.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-10">
      <section className="card bg-amber-50 px-6 py-12 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Handicrafts, gifts and novelties
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          Brassware, idols and handmade pieces from our shop, delivered to your door.
        </p>
        <Link href="/products" className="btn btn-primary mt-6">
          Shop all products
        </Link>
      </section>

      {latest.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">New arrivals</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
