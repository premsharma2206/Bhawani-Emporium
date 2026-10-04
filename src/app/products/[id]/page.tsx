import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { addToCart } from "@/actions/cart";
import { SubmitButton } from "@/components/form";
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

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        sizes="(min-width: 768px) 50vw, 100vw"
        priority
      />
      <div>
        {product.productType && (
          <p className="text-sm text-stone-500">{product.productType}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-2 text-xl">{formatPaise(product.pricePaise)}</p>
        {product.description && (
          <p className="mt-4 whitespace-pre-line text-stone-700">{product.description}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {user ? (
            <form action={addToCart}>
              <input type="hidden" name="productId" value={product.id} />
              <SubmitButton>{inCart ? "Add another" : "Add to cart"}</SubmitButton>
            </form>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log in to buy
            </Link>
          )}
          {inCart && (
            <Link href="/cart" className="text-sm text-amber-800 underline">
              In your cart ({inCart.quantity}). View cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
