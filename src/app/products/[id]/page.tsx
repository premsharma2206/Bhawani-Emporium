import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AddToCartButton } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/money";

type Props = { params: Promise<{ id: string }> };

const getProduct = cache(async (rawId: string) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return db.product.findFirst({ where: { id, active: true } });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return {};
  return { title: product.name, description: product.description.slice(0, 160) || undefined };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const user = await getCurrentUser();
  const inCart = user
    ? await db.cartItem.findUnique({
        where: { userId_productId: { userId: user.id, productId: product.id } },
      })
    : null;
  const others = await db.product.findMany({
    where: { active: true, id: { not: product.id } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  // Pieces of the same type come first.
  const related = [
    ...others.filter((p) => p.productType === product.productType),
    ...others.filter((p) => p.productType !== product.productType),
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-6">
        <div className="card p-2.5">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>
        <div className="animate-rise md:pt-2">
          {product.productType && <p className="eyebrow">{product.productType}</p>}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-3 font-display text-3xl font-semibold text-accent">
            {formatPaise(product.pricePaise)}
          </p>
          {product.description && (
            <p className="mt-3 whitespace-pre-line text-ink-soft">{product.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            {user?.role === "ADMIN" ? (
              <Link href={`/admin/products/${product.id}/edit`} className="btn btn-secondary">
                Edit product
              </Link>
            ) : user ? (
              <AddToCartButton productId={product.id}>
                {inCart ? "Add another" : "Add to cart"}
              </AddToCartButton>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Log in to buy
              </Link>
            )}
            {inCart && (
              <Link href="/cart" className="text-sm text-accent underline">
                In your cart ({inCart.quantity}). View cart
              </Link>
            )}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="card p-2.5">
              <dt className="text-xs tracking-widest text-muted uppercase">Delivery</dt>
              <dd className="mt-1">Shipped to your address</dd>
            </div>
            <div className="card p-2.5">
              <dt className="text-xs tracking-widest text-muted uppercase">Payment</dt>
              <dd className="mt-1">Pay on delivery available</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">More from the shop</h2>
            <Link href="/products" className="text-sm text-muted transition hover:text-accent">
              View all <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
