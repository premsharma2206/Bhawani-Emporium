import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { paiseToRupees } from "@/lib/money";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="page-title">Edit product</h1>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: paiseToRupees(product.pricePaise),
          productType: product.productType,
          tags: product.tags,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
