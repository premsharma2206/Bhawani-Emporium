import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatDate } from "@/lib/labels";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await requireUser();
  // Admins have no orders of their own; send them to the list of customer orders.
  if (user.role === "ADMIN") redirect("/admin/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="page-title">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted">You have not placed any orders yet.</p>
      ) : (
        <ul className="card divide-y divide-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-3 hover:bg-glass-strong"
              >
                <div>
                  <p className="font-medium">Order #{o.id}</p>
                  <p className="text-sm text-muted">
                    {formatDate(o.createdAt)} · {o._count.items}{" "}
                    {o._count.items === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPaise(o.totalPaise)}</p>
                  <p className="text-sm text-muted">
                    {ORDER_STATUS_LABEL[o.status]} · {PAYMENT_STATUS_LABEL[o.paymentStatus]}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
