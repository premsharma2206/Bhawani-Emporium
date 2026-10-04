import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/dal";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="page-title">Add product</h1>
      <ProductForm />
    </div>
  );
}
