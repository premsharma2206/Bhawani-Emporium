import Link from "next/link";
import { setOrderStatus } from "@/actions/admin";
import { SubmitButton } from "@/components/form";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  formatDate,
} from "@/lib/labels";
import { formatPaise } from "@/lib/money";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Placed</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-3">
                  <Link href={`/orders/${o.id}`} className="text-amber-800 underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="p-3">{formatDate(o.createdAt)}</td>
                <td className="p-3">
                  {o.shipName}
                  <br />
                  <span className="text-stone-500">{o.user.email}</span>
                </td>
                <td className="p-3">{formatPaise(o.totalPaise)}</td>
                <td className="p-3">
                  {PAYMENT_METHOD_LABEL[o.paymentMethod]}
                  <br />
                  <span className="text-stone-500">{PAYMENT_STATUS_LABEL[o.paymentStatus]}</span>
                </td>
                <td className="p-3">
                  <form action={setOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <label htmlFor={`status-${o.id}`} className="sr-only">
                      Status of order {o.id}
                    </label>
                    <select
                      id={`status-${o.id}`}
                      name="status"
                      defaultValue={o.status}
                      className="input w-auto"
                    >
                      {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <SubmitButton className="btn btn-secondary">Save</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-stone-600">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
