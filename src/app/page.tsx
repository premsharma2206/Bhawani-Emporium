import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/money";

const HIGHLIGHTS = [
  { title: "Handmade pieces", text: "Brassware, idols and gifts picked from our shop." },
  { title: "Delivered to your door", text: "Order online and we ship it to your address." },
  { title: "Pay on delivery", text: "Pay when your order arrives." },
];

export default async function HomePage() {
  const [latest, types] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.product.findMany({
      where: { active: true, productType: { not: "" } },
      distinct: ["productType"],
      select: { productType: true },
      orderBy: { productType: "asc" },
    }),
  ]);
  const featured = latest[0];

  return (
    <div className="space-y-8">
      <section className="card relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(40rem_24rem_at_85%_10%,rgb(246_196_83/0.18),transparent_65%),radial-gradient(30rem_20rem_at_0%_100%,rgb(94_234_212/0.1),transparent_65%)]"
        />
        <div className="relative grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.3fr_1fr]">
          <div className="animate-rise">
            <p className="eyebrow">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              Brassware · Idols · Gifts
            </p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Handicrafts, gifts and <span className="text-gradient">novelties</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              Brassware, idols and handmade pieces from our shop, delivered to your door.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-primary px-5 py-2.5 text-base">
                Shop all products <span aria-hidden>→</span>
              </Link>
              {featured && (
                <Link
                  href={`/products/${featured.id}`}
                  className="btn btn-secondary px-5 py-2.5 text-base"
                >
                  See the latest piece
                </Link>
              )}
            </div>
          </div>

          {featured && (
            <div className="relative mx-auto w-full max-w-72">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-[conic-gradient(from_140deg,var(--color-accent),transparent_35%,var(--color-glow)_60%,transparent_80%,var(--color-accent))] opacity-30 blur-3xl"
              />
              <Link
                href={`/products/${featured.id}`}
                className="card relative block animate-float p-3 [--tilt:2deg] hover:border-accent/60"
              >
                <ProductImage
                  src={featured.imageUrl}
                  alt={featured.name}
                  sizes="(min-width: 768px) 18rem, 80vw"
                  priority
                />
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.65rem] tracking-widest text-muted uppercase">New arrival</p>
                    <p className="truncate text-sm font-medium">{featured.name}</p>
                  </div>
                  <p className="font-display font-semibold text-accent">
                    {formatPaise(featured.pricePaise)}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>

        <ul className="relative grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {HIGHLIGHTS.map((h, i) => (
            <li key={h.title} className="flex items-start gap-3 px-6 py-4">
              <span className="mt-0.5 font-mono text-xs text-accent">0{i + 1}</span>
              <div>
                <p className="text-sm font-semibold">{h.title}</p>
                <p className="text-sm text-muted">{h.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {latest.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">New arrivals</h2>
              {types.map((t) => (
                <Link
                  key={t.productType}
                  href={`/products?type=${encodeURIComponent(t.productType)}`}
                  className="rounded-full border border-line-strong bg-glass px-3 py-1 text-xs text-ink-soft transition hover:border-accent/60 hover:text-accent"
                >
                  {t.productType}
                </Link>
              ))}
            </div>
            <Link href="/products" className="text-sm text-muted transition hover:text-accent">
              View all <span aria-hidden>→</span>
            </Link>
          </div>
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
