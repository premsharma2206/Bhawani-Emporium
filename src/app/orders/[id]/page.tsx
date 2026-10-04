import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayButton } from "@/components/pay-button";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  formatDate,
} from "@/lib/labels";
import { formatPaise } from "@/lib/money";
import { razorpayEnabled } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  // Customers can open only their own orders; admins can open any.
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  const { placed } = await searchParams;
  const canPay =
    order.userId === user.id &&
    order.paymentMethod === "RAZORPAY" &&
    order.paymentStatus === "UNPAID" &&
    order.status !== "CANCELLED" &&
    razorpayEnabled();

  return (
    <div className="mx-auto max-w-2xl">
      {placed && (
        <p role="status" className="mb-6 rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
          Your order is placed. Thank you for shopping with us.
        </p>
      )}
      <h1 className="page-title">Order #{order.id}</h1>
      <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-stone-500">Placed</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Status</dt>
          <dd>{ORDER_STATUS_LABEL[order.status]}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Payment</dt>
          <dd>{PAYMENT_METHOD_LABEL[order.paymentMethod]}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Paid</dt>
          <dd>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</dd>
        </div>
      </dl>

      {canPay && (
        <div className="mb-6">
          <PayButton
            orderId={order.id}
            customer={{ name: order.shipName, email: user.email, contact: order.shipContact }}
          />
        </div>
      )}

      <ul className="card divide-y divide-stone-200 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 p-4">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatPaise(item.pricePaise * item.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 p-4 font-semibold">
          <span>Total</span>
          <span>{formatPaise(order.totalPaise)}</span>
        </li>
      </ul>

      <h2 className="mt-6 mb-1 font-semibold">Deliver to</h2>
      <p className="text-sm text-stone-700">
        {order.shipName}, {order.shipContact}
        <br />
        {order.shipAddress}, {order.shipCity}
      </p>
      {user.role === "ADMIN" && order.userId !== user.id && (
        <p className="mt-4 text-sm text-stone-600">
          Customer account: {order.user.name} ({order.user.email})
        </p>
      )}
      {order.note && <p className="mt-4 text-sm text-stone-600">{order.note}</p>}

      <Link href="/products" className="btn btn-secondary mt-8">
        Continue shopping
      </Link>
    </div>
  );
}
