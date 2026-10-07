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
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Placed</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Payment</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2">
                  <Link href={`/orders/${o.id}`} className="text-accent underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{formatDate(o.createdAt)}</td>
                <td className="px-3 py-2">
                  {o.shipName}
                  <br />
                  <span className="text-muted">{o.user.email}</span>
                </td>
                <td className="px-3 py-2">{formatPaise(o.totalPaise)}</td>
                <td className="px-3 py-2">
                  {PAYMENT_METHOD_LABEL[o.paymentMethod]}
                  <br />
                  <span className="text-muted">{PAYMENT_STATUS_LABEL[o.paymentStatus]}</span>
                </td>
                <td className="px-3 py-2">
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
                <td colSpan={6} className="px-3 py-2 text-muted">
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
