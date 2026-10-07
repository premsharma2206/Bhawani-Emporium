import Link from "next/link";
import { setProductActive } from "@/actions/admin";
import { SubmitButton } from "@/components/form";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/money";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await db.product.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : "text-faint"}>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.productType}</td>
                <td className="p-3">{formatPaise(p.pricePaise)}</td>
                <td className="p-3">{p.active ? "On sale" : "Hidden"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="btn btn-secondary">
                      Edit
                    </Link>
                    <form action={setProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={String(!p.active)} />
                      <SubmitButton className={p.active ? "btn btn-danger" : "btn btn-secondary"}>
                        {p.active ? "Hide" : "Restore"}
                      </SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-muted">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
