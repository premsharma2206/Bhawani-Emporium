import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { formatPaise } from "@/lib/money";

export function ProductCard({
  product,
}: {
  product: { id: number; name: string; pricePaise: number; imageUrl: string | null };
}) {
  return (
    <Link href={`/products/${product.id}`} className="card group block p-3 hover:border-amber-700">
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      />
      <h3 className="mt-3 text-sm font-medium group-hover:text-amber-800">{product.name}</h3>
      <p className="mt-1 text-sm text-stone-600">{formatPaise(product.pricePaise)}</p>
    </Link>
  );
}
