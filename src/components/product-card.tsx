import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import { getCurrentUser } from "@/lib/dal";
import { formatPaise } from "@/lib/money";

export async function ProductCard({
  product,
}: {
  product: {
    id: number;
    name: string;
    description: string;
    productType: string;
    pricePaise: number;
    imageUrl: string | null;
  };
}) {
  const user = await getCurrentUser();
  const href = `/products/${product.id}`;
  return (
    <article className="card group flex flex-col p-2.5 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_60px_-28px_var(--color-accent)]">
      <Link href={href} className="relative block">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {product.productType && (
          <span className="absolute top-2 left-2 rounded-full bg-bg/80 px-2 py-0.5 text-[0.65rem] tracking-wider text-ink-soft uppercase backdrop-blur">
            {product.productType}
          </span>
        )}
      </Link>
      <h3 className="mt-2.5 text-sm font-medium transition group-hover:text-accent">
        <Link href={href}>{product.name}</Link>
      </h3>
      {product.description && (
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{product.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
        <p className="font-display text-base font-semibold text-accent">
          {formatPaise(product.pricePaise)}
        </p>
        {user && user.role !== "ADMIN" ? (
          <AddToCartButton productId={product.id} className="btn btn-secondary px-3 py-1.5 text-xs">
            Add to cart
          </AddToCartButton>
        ) : (
          <Link
            href={href}
            className="text-xs text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
          >
            View <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
