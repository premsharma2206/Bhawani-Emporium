import Link from "next/link";
import { InstagramIcon } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/money";
import { CRAFT_LINES, SITE } from "@/lib/site";

const HIGHLIGHTS = [
  { title: "Handmade pieces", text: "Brass and black metal handicrafts from our shop." },
  { title: "Delivered to your door", text: "Order online and we ship it to your address." },
  { title: "Pay on delivery", text: "Pay when your order arrives." },
];

const TICKER = [
  "Brass handicrafts",
  "Black metal handicrafts",
  "Handicraft gifts",
  "Novelties",
  "Pay on delivery",
  `Instagram @${SITE.instagramHandle}`,
];

export default async function HomePage() {
  const [latest, types, total] = await Promise.all([
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
    db.product.count({ where: { active: true } }),
  ]);
  const featured = latest[0];

  return (
    <div className="space-y-5">
      <section className="card relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(40rem_24rem_at_85%_10%,rgb(246_196_83/0.18),transparent_65%),radial-gradient(30rem_20rem_at_0%_100%,rgb(94_234_212/0.1),transparent_65%)]"
        />
        <div className="relative grid items-center gap-5 p-4 sm:p-6 md:grid-cols-[1.3fr_1fr]">
          <div className="animate-rise">
            <p className="eyebrow">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              Brass · Black metal · Gifts
            </p>
            <h1 className="mt-3 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Handicraft gifts and <span className="text-gradient">novelties</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted sm:text-lg">
              {SITE.blurb} Picked from our shop and delivered to your door.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-primary px-5 py-2.5 text-base">
                Shop all products <span aria-hidden>→</span>
              </Link>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-5 py-2.5 text-base"
              >
                <InstagramIcon className="size-4" />@{SITE.instagramHandle}
              </a>
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
                className="card relative block animate-float p-2.5 [--tilt:2deg] hover:border-accent/60"
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
            <li key={h.title} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-0.5 font-mono text-xs text-accent">0{i + 1}</span>
              <div>
                <p className="text-sm font-semibold">{h.title}</p>
                <p className="text-sm text-muted">{h.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="card overflow-hidden py-2" aria-hidden>
        <div className="ticker">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-4 pr-4 text-xs tracking-widest whitespace-nowrap text-ink-soft uppercase"
            >
              {item}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">What we make</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CRAFT_LINES.map((line, i) => (
            <Link
              key={line.query}
              href={`/products?q=${encodeURIComponent(line.query)}`}
              className="card group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:border-accent/60"
            >
              <span
                aria-hidden
                className="absolute -top-10 -right-10 size-32 rounded-full bg-accent/15 blur-2xl transition duration-300 group-hover:bg-accent/30"
              />
              <p className="font-mono text-xs text-accent">0{i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{line.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{line.text}</p>
              <p className="mt-3 text-xs text-ink-soft transition group-hover:text-accent">
                Browse <span aria-hidden>→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {latest.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
              View all {total} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="card relative overflow-hidden p-4 sm:p-6">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(32rem_18rem_at_100%_50%,rgb(124_92_255/0.18),transparent_65%),radial-gradient(26rem_16rem_at_0%_0%,rgb(246_196_83/0.14),transparent_65%)]"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">
              <InstagramIcon className="size-3.5" />
              Instagram
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              See new pieces first on <span className="text-gradient">@{SITE.instagramHandle}</span>
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              {SITE.tagline}. Follow the shop for the latest brass and black metal handicrafts.
            </p>
          </div>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-5 py-2.5"
          >
            Follow on Instagram <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
