import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { formatPaise } from "@/lib/money";

export function ProductCard({
  product,
}: {
  product: { id: number; name: string; pricePaise: number; imageUrl: string | null };
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="card group block p-3 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_60px_-28px_var(--color-accent)]"
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      />
      <h3 className="mt-3 text-sm font-medium transition group-hover:text-accent">{product.name}</h3>
      <div className="mt-1 flex items-center justify-between">
        <p className="font-display text-base font-semibold text-accent">
          {formatPaise(product.pricePaise)}
        </p>
        <span
          aria-hidden
          className="text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </Link>
  );
}
