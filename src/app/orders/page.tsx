import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatDate } from "@/lib/labels";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="page-title">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-stone-600">You have not placed any orders yet.</p>
      ) : (
        <ul className="card divide-y divide-stone-200">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium">Order #{o.id}</p>
                  <p className="text-sm text-stone-600">
                    {formatDate(o.createdAt)} · {o._count.items}{" "}
                    {o._count.items === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPaise(o.totalPaise)}</p>
                  <p className="text-sm text-stone-600">
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
