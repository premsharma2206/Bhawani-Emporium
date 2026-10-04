import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

type PaymentEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();
  if (!secret || !signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody) as PaymentEvent;
  const payment = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment?.order_id && payment.id) {
    // updateMany keeps this safe to receive more than once.
    await db.order.updateMany({
      where: { razorpayOrderId: payment.order_id },
      data: { paymentStatus: "PAID", razorpayPaymentId: payment.id },
    });
  }
  return new Response("ok");
}
